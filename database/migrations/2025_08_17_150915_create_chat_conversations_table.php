<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('chat_conversations')) {
            Schema::create('chat_conversations', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique(); // For guest users
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade'); // For authenticated users
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null'); // Admin handling the conversation
            $table->enum('status', ['active', 'closed', 'waiting'])->default('waiting');
            $table->string('visitor_name')->nullable();
            $table->string('visitor_email')->nullable();
            $table->text('initial_message')->nullable();
            $table->timestamp('last_activity_at')->useCurrent();
            $table->timestamps();

            $table->index(['status', 'admin_id']);
            $table->index(['user_id', 'status']);
            $table->index('session_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_conversations');
    }
};
