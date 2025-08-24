<?php

namespace App\Http\Controllers\Admin;

use App\Models\ChatConversation;
use Illuminate\Support\Facades\DB;

trait AdminChatHelpers
{
    /**
     * Safely assign a conversation to an admin with database consistency
     */
    protected function safelyAssignConversation(ChatConversation $conversation, $adminId): bool
    {
        return DB::transaction(function () use ($conversation, $adminId) {
            // Lock the conversation row for update to prevent race conditions
            $lockedConversation = ChatConversation::where('id', $conversation->id)
                ->lockForUpdate()
                ->first();
            
            if (!$lockedConversation) {
                return false;
            }
            
            // Check if conversation is still available
            if ($lockedConversation->status !== 'waiting' && $lockedConversation->admin_id !== null) {
                return false;
            }
            
            // Update the conversation
            $updated = $lockedConversation->update([
                'admin_id' => $adminId,
                'status' => 'active',
                'last_activity_at' => now(),
            ]);
            
            return $updated;
        });
    }
    
    /**
     * Check if admin can access conversation with fresh database data
     */
    protected function canAdminAccessConversation($adminId, $conversationId): bool
    {
        // Always get fresh data from database, bypassing any model caching
        $conversation = ChatConversation::whereId($conversationId)->first();
        
        if (!$conversation) {
            return false;
        }
        
        return $conversation->admin_id === $adminId 
               || $conversation->status === 'waiting'
               || ($conversation->status === 'active' && $conversation->admin_id === null);
    }
}