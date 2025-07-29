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
        if (!Schema::hasTable('quizzes')) {
            Schema::create('quizzes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
                $table->string('title');
                $table->text('description')->nullable();
                $table->enum('type', ['mental_arithmetic', 'multiple_choice', 'text_answer', 'true_false', 'mixed']);
                $table->integer('time_limit')->nullable(); // seconds, null = no time limit
                $table->integer('question_time_limit')->nullable(); // seconds per question
                $table->integer('max_attempts')->default(3);
                $table->decimal('passing_score', 5, 2)->default(70.00); // percentage
                $table->boolean('show_results_immediately')->default(true);
                $table->boolean('shuffle_questions')->default(false);
                $table->boolean('shuffle_answers')->default(false);
                $table->boolean('is_active')->default(true);
                $table->json('settings')->nullable(); // quiz-specific settings
                $table->timestamps();

                $table->index(['lesson_id', 'is_active']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};