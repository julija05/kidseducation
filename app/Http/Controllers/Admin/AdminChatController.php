<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\AdminSendMessageRequest;
use App\Http\Requests\Chat\TransferConversationRequest;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminChatController extends Controller
{
    // Middleware is handled by route group in web.php

    /**
     * Show admin chat dashboard
     */
    public function index()
    {
        $admin = Auth::user();

        // Get conversation counts
        $waitingCount = ChatConversation::waiting()->count();
        $activeCount = ChatConversation::active()->assignedTo($admin->id)->count();
        $totalUnreadCount = $admin->getUnreadChatMessagesCount();

        // Get recent conversations - show waiting conversations AND conversations assigned to this admin
        $conversations = ChatConversation::with(['user', 'admin', 'latestMessage'])
            ->where(function ($query) use ($admin) {
                $query->where('status', 'waiting')
                    ->orWhere('admin_id', $admin->id);
            })
            ->orderBy('last_activity_at', 'desc')
            ->paginate(20);

        return inertia('Admin/Chat/Index', [
            'conversations' => $conversations,
            'waitingCount' => $waitingCount,
            'activeCount' => $activeCount,
            'totalUnreadCount' => $totalUnreadCount,
        ]);
    }

    /**
     * Get all conversations for admin
     */
    public function getConversations(Request $request)
    {
        $admin = Auth::user();
        $status = $request->get('status', 'all');

        $query = ChatConversation::with(['user', 'admin', 'messages' => function ($query) {
            $query->latest()->limit(1);
        }]);

        if ($status === 'waiting') {
            $query->waiting();
        } elseif ($status === 'active') {
            $query->active()->assignedTo($admin->id);
        } elseif ($status === 'assigned') {
            $query->assignedTo($admin->id);
        } elseif ($status === 'closed') {
            $query->where('status', 'closed')->assignedTo($admin->id);
        } else {
            // For 'all' status, show waiting conversations AND conversations assigned to this admin
            $query->where(function ($q) use ($admin) {
                $q->where('status', 'waiting')
                    ->orWhere('admin_id', $admin->id);
            });
        }

        $conversations = $query->orderBy('last_activity_at', 'desc')->get();

        // Add unread count for each conversation
        $conversations->each(function ($conversation) {
            $conversation->unread_count = $conversation->unreadMessagesCount();
        });

        return response()->json(['conversations' => $conversations]);
    }

    /**
     * Take/assign a conversation to admin
     */
    public function takeConversation(Request $request, $conversationId)
    {
        $conversation = ChatConversation::findOrFail($conversationId);
        $admin = Auth::user();

        if ($conversation->status === 'waiting' || $conversation->admin_id === null) {
            // Update conversation and refresh to ensure we have the latest data
            $conversation->update([
                'admin_id' => $admin->id,
                'status' => 'active',
                'last_activity_at' => now(),
            ]);
            
            $conversation->refresh();

            // Send system message
            ChatMessage::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $admin->id,
                'sender_type' => 'admin',
                'message' => "Hello! I'm {$admin->name} and I'll be helping you today. How can I assist you?",
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Conversation assigned successfully',
            ]);
        }

        return response()->json(['error' => 'Conversation already assigned'], 400);
    }

    /**
     * Send admin message
     */
    public function sendMessage(AdminSendMessageRequest $request)
    {
        $validated = $request->validated();
        $admin = Auth::user();
        
        return DB::transaction(function () use ($validated, $admin) {
            // Get fresh conversation data with lock
            $conversation = ChatConversation::with(['user', 'admin'])
                ->lockForUpdate()
                ->findOrFail($validated['conversation_id']);

            // Auto-assign waiting conversations when sending message
            if ($conversation->status === 'waiting' && !$conversation->admin_id) {
                $conversation->update([
                    'admin_id' => $admin->id,
                    'status' => 'active',
                    'last_activity_at' => now(),
                ]);
            }

            // Use the same authorization logic as getMessages
            if (! $this->adminCanAccessConversation($admin, $conversation)) {
                return response()->json([
                    'error' => 'Access denied',
                    'message' => 'You cannot send messages to this conversation',
                ], 403);
            }

            $message = ChatMessage::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $admin->id,
                'sender_type' => 'admin',
                'message' => $validated['message'],
            ]);

            // Update conversation activity and mark messages as read
            $conversation->updateActivity();
            $conversation->markAsReadByAdmin();
            $message->load('sender');

            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        });
    }

    /**
     * Get messages for a specific conversation
     */
    public function getMessages(Request $request, $conversationId)
    {
        $admin = Auth::user();
        
        return DB::transaction(function () use ($conversationId, $admin, $request) {
            // Get fresh conversation data with lock to prevent race conditions
            $conversation = ChatConversation::with(['user', 'admin'])
                ->lockForUpdate()
                ->findOrFail($conversationId);

            // Auto-assign waiting conversations to the requesting admin
            if ($conversation->status === 'waiting' && !$conversation->admin_id) {
                $conversation->update([
                    'admin_id' => $admin->id,
                    'status' => 'active',
                    'last_activity_at' => now(),
                ]);
            }

            // Verify admin has access to this conversation
            if (! $this->adminCanAccessConversation($admin, $conversation)) {
                return response()->json([
                    'error' => 'Access denied',
                    'message' => 'This conversation is not accessible to you',
                ], 403);
            }

            // Mark user messages as read and get messages
            $conversation->markAsReadByAdmin();
            $messages = $conversation->messages()->with('sender')->get();

            return response()->json([
                'messages' => $messages,
                'conversation' => $conversation,
            ]);
        });
    }

    /**
     * Close a conversation
     */
    public function closeConversation(Request $request, $conversationId)
    {
        $conversation = ChatConversation::findOrFail($conversationId);
        $admin = Auth::user();

        // Verify admin has access to this conversation
        if ((int)$conversation->admin_id !== (int)$admin->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $conversation->update(['status' => 'closed']);

        // Send system message
        ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $admin->id,
            'sender_type' => 'admin',
            'message' => 'This conversation has been closed. Thank you for contacting us!',
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Transfer conversation to another admin
     */
    public function transferConversation(TransferConversationRequest $request, $conversationId)
    {

        $validated = $request->validated();
        $conversation = ChatConversation::findOrFail($conversationId);
        $currentAdmin = Auth::user();
        $newAdmin = User::findOrFail($validated['admin_id']);

        // Verify new admin has admin role
        if (! $newAdmin->hasRole('admin')) {
            return response()->json(['error' => 'Target user is not an admin'], 400);
        }

        // Verify current admin has access to this conversation
        if ($conversation->admin_id !== $currentAdmin->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $conversation->update(['admin_id' => $newAdmin->id]);

        // Send system message about transfer
        ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $currentAdmin->id,
            'sender_type' => 'admin',
            'message' => "This conversation has been transferred to {$newAdmin->name}.",
        ]);

        return response()->json(['success' => true, 'message' => 'Conversation transferred successfully']);
    }

    /**
     * Check if admin can access conversation
     */
    private function adminCanAccessConversation($admin, ChatConversation $conversation): bool
    {
        // Allow access to:
        // 1. Conversations assigned to this admin (with proper type casting)
        // 2. Waiting conversations (any admin can take them)
        // 3. Active conversations not assigned yet (for compatibility)
        return (int)$conversation->admin_id === (int)$admin->id 
               || $conversation->status === 'waiting'
               || ($conversation->status === 'active' && $conversation->admin_id === null);
    }

    /**
     * Get chat statistics
     */
    public function getStats()
    {
        $admin = Auth::user();

        $stats = [
            'total_conversations' => ChatConversation::assignedTo($admin->id)->count(),
            'active_conversations' => ChatConversation::active()->assignedTo($admin->id)->count(),
            'waiting_conversations' => ChatConversation::waiting()->count(),
            'closed_today' => ChatConversation::assignedTo($admin->id)
                ->where('status', 'closed')
                ->whereDate('updated_at', today())
                ->count(),
            'unread_messages' => $admin->getUnreadChatMessagesCount(),
        ];

        return response()->json($stats);
    }

    /**
     * Delete a closed conversation
     */
    public function deleteConversation(Request $request, $conversationId)
    {
        $conversation = ChatConversation::findOrFail($conversationId);
        $admin = Auth::user();

        // Only allow deletion of closed conversations
        if ($conversation->status !== 'closed') {
            return response()->json(['error' => 'Only closed conversations can be deleted'], 400);
        }

        // Verify admin has access to this conversation
        if ((int)$conversation->admin_id !== (int)$admin->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete the conversation and all its messages
        $conversation->messages()->delete();
        $conversation->delete();

        return response()->json(['success' => true, 'message' => 'Conversation deleted successfully']);
    }
}
