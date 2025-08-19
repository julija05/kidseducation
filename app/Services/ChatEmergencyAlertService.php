<?php

namespace App\Services;

use App\Mail\EmergencyChatAlert;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ChatEmergencyAlertService
{
    /**
     * Send emergency alert email to all admin users
     */
    public function sendAlert(ChatConversation $conversation, ChatMessage $message): void
    {
        try {
            $admins = User::role('admin')->get();
            
            foreach ($admins as $admin) {
                Mail::to($admin->email)->send(new EmergencyChatAlert($conversation, $message));
            }
            
            Log::info('Emergency chat alert sent', [
                'conversation_id' => $conversation->id,
                'message_id' => $message->id,
                'admin_count' => $admins->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send emergency chat alert: ' . $e->getMessage(), [
                'conversation_id' => $conversation->id,
                'message_id' => $message->id,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
