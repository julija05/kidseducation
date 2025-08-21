<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\SendMessageRequest;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Services\ChatEmergencyAlertService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function __construct(
        private ChatEmergencyAlertService $emergencyAlertService
    ) {}

    /**
     * Initialize or get existing chat conversation
     */
    public function initChat(Request $request)
    {
        Log::info('ChatController::initChat called', [
            'method' => $request->method(),
            'url' => $request->url(),
            'user_agent' => $request->userAgent(),
            'content_type' => $request->header('Content-Type'),
            'accept' => $request->header('Accept'),
        ]);

        try {
            $sessionId = $request->session()->getId();
            $user = Auth::user();

            Log::info('Chat init attempt', [
                'session_id' => $sessionId,
                'user_id' => $user?->id,
                'user_authenticated' => $user !== null,
            ]);

            if (empty($sessionId)) {
                Log::error('Empty session ID in chat init');

                return response()->json([
                    'error' => 'Session not available',
                    'message' => 'Please refresh the page and try again',
                ], 400);
            }

            // Try to find existing conversation
            $conversation = null;

            if ($user) {
                // For authenticated users, find by user_id
                $conversation = ChatConversation::where('user_id', $user->id)
                    ->whereIn('status', ['active', 'waiting', 'draft'])
                    ->first();
            } else {
                // For guests, find by session_id
                $conversation = ChatConversation::where('session_id', $sessionId)
                    ->first();

                // If found but closed, reset it for a new conversation instead of creating duplicate
                if ($conversation && $conversation->status === 'closed') {
                    Log::info('Found closed conversation for guest, resetting for new conversation', [
                        'conversation_id' => $conversation->id,
                        'session_id' => $sessionId,
                    ]);

                    // Reset the closed conversation for reuse
                    $conversation->update([
                        'status' => 'draft',
                        'admin_id' => null,
                        'visitor_name' => null,
                        'visitor_email' => null,
                        'initial_message' => null,
                        'last_activity_at' => now(),
                    ]);

                    // Delete old messages to start fresh
                    $conversation->messages()->delete();
                }
            }

            // Create new conversation if none exists
            if (! $conversation) {
                $conversation = ChatConversation::create([
                    'session_id' => $sessionId,
                    'user_id' => $user?->id,
                    'status' => 'draft', // Start as draft, will become 'waiting' when first message is sent
                    'last_activity_at' => now(),
                ]);

                Log::info('Created new conversation', [
                    'conversation_id' => $conversation->id,
                    'session_id' => $sessionId,
                ]);
            }

            $messages = $conversation->messages()->with('sender')->get();

            return response()->json([
                'conversation_id' => $conversation->id,
                'status' => $conversation->status,
                'messages' => $messages,
            ]);
        } catch (\Exception $e) {
            Log::error('Chat init error: '.$e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'session_id' => $request->session()->getId(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'error' => 'Failed to initialize chat',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send a message in the chat
     */
    public function sendMessage(SendMessageRequest $request)
    {

        $validated = $request->validated();
        $conversation = ChatConversation::findOrFail($validated['conversation_id']);
        $user = Auth::user();

        // Update conversation with visitor info if provided
        if (! $user && $request->filled('visitor_name')) {
            $conversation->update([
                'visitor_name' => $validated['visitor_name'],
                'visitor_email' => $validated['visitor_email'] ?? null,
                'initial_message' => $validated['message'],
            ]);
        }

        // Check if this will be the first message from a guest user
        $isFirstGuestMessage = ! $user && $conversation->messages()->whereIn('sender_type', ['guest', 'user'])->count() === 0;

        // Create the message
        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user?->id,
            'sender_type' => $user ? 'user' : 'guest',
            'message' => $validated['message'],
        ]);

        // Handle first guest message - activate conversation and send alerts
        if ($isFirstGuestMessage) {
            $this->activateConversation($conversation, $message);
        }

        // Update conversation activity and load relationships
        $conversation->updateActivity();
        $message->load('sender');

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    /**
     * Get messages for a conversation
     */
    public function getMessages(Request $request, $conversationId)
    {
        $conversation = ChatConversation::findOrFail($conversationId);
        $user = Auth::user();

        // Verify access to conversation
        if ($user && $conversation->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (! $user && $conversation->session_id !== $request->session()->getId()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Mark admin messages as read
        $conversation->markAsReadByUser();

        $messages = $conversation->messages()->with('sender')->get();

        return response()->json([
            'messages' => $messages,
            'conversation' => $conversation,
        ]);
    }

    /**
     * Close a conversation
     */
    public function closeConversation(Request $request, $conversationId)
    {
        $conversation = ChatConversation::findOrFail($conversationId);
        $user = Auth::user();

        // Verify access to conversation
        if ($user && $conversation->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (! $user && $conversation->session_id !== $request->session()->getId()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $conversation->update(['status' => 'closed']);

        return response()->json(['success' => true]);
    }

    /**
     * Check conversation status
     */
    public function checkStatus(Request $request, $conversationId)
    {
        $conversation = ChatConversation::findOrFail($conversationId);
        $user = Auth::user();

        // Verify access to conversation
        if ($user && $conversation->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (! $user && $conversation->session_id !== $request->session()->getId()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'status' => $conversation->status,
            'admin_name' => $conversation->admin?->name,
            'unread_count' => $conversation->unreadMessagesForUser(),
        ]);
    }

    /**
     * Activate conversation and send emergency alerts
     */
    private function activateConversation(ChatConversation $conversation, ChatMessage $message): void
    {
        // Change conversation status from 'draft' to 'waiting' to trigger admin notifications
        $conversation->update(['status' => 'waiting']);

        Log::info('Chat conversation activated', [
            'conversation_id' => $conversation->id,
            'message_id' => $message->id,
            'visitor_name' => $conversation->visitor_name,
            'status_changed' => 'draft -> waiting',
        ]);

        $this->emergencyAlertService->sendAlert($conversation, $message);
    }
}
