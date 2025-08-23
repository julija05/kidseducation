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
        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->integer('progress_percentage')->default(0);
            $table->decimal('score', 5, 2)->nullable(); // For quizzes/assessments
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('session_data')->nullable(); // Store lesson-specific progress data
            $table->timestamps();

            // Unique constraint - one progress record per user per lesson
            $table->unique(['user_id', 'lesson_id']);

            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['lesson_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_progress');
    }
};
