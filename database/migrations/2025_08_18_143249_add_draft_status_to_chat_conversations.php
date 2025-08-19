<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, modify the enum to include 'draft' status
        DB::statement("ALTER TABLE chat_conversations MODIFY COLUMN status ENUM('draft', 'waiting', 'active', 'closed') DEFAULT 'draft'");
        
        // Update existing conversations with no messages to 'draft' status
        DB::statement("
            UPDATE chat_conversations 
            SET status = 'draft' 
            WHERE status = 'waiting' 
            AND id NOT IN (
                SELECT DISTINCT conversation_id 
                FROM chat_messages 
                WHERE sender_type IN ('guest', 'user')
            )
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert draft conversations back to waiting
        DB::statement("UPDATE chat_conversations SET status = 'waiting' WHERE status = 'draft'");
        
        // Revert the enum to original values
        DB::statement("ALTER TABLE chat_conversations MODIFY COLUMN status ENUM('waiting', 'active', 'closed') DEFAULT 'waiting'");
    }
};
