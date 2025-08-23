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
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->decimal('score', 5, 2)->nullable(); // percentage
            $table->integer('total_points')->default(0);
            $table->integer('earned_points')->default(0);
            $table->integer('total_questions')->default(0);
            $table->integer('correct_answers')->default(0);
            $table->integer('time_taken')->nullable(); // seconds
            $table->enum('status', ['in_progress', 'completed', 'abandoned', 'expired'])->default('in_progress');
            $table->json('answers')->nullable(); // user's answers with timestamps
            $table->json('metadata')->nullable(); // additional tracking data
            $table->timestamps();

            $table->index(['user_id', 'quiz_id']);
            $table->index(['status', 'completed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
    }
};
