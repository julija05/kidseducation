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
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('message');
            $table->string('type', 50); // 'enrollment', 'general', etc.
            $table->json('data')->nullable(); // Additional data
            $table->boolean('is_read')->default(false);
            $table->string('related_model_type', 191)->nullable();
            $table->unsignedBigInteger('related_model_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes
            $table->index(['is_read', 'created_at']);
            $table->index(['type', 'created_at']);
            $table->index(['related_model_type', 'related_model_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
