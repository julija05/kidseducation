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
        if (!Schema::hasTable('quiz_questions')) {
            Schema::create('quiz_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
                $table->enum('type', ['mental_arithmetic', 'multiple_choice', 'text_answer', 'true_false']);
                $table->text('question_text');
                $table->json('question_data')->nullable(); // For storing numbers, images, etc.
                $table->json('answer_options')->nullable(); // For multiple choice options
                $table->text('correct_answer');
                $table->text('explanation')->nullable();
                $table->decimal('points', 8, 2)->default(1.00);
                $table->integer('time_limit')->nullable(); // seconds, overrides quiz default
                $table->integer('order')->default(0);
                $table->json('settings')->nullable(); // question-specific settings
                $table->timestamps();

                $table->index(['quiz_id', 'order']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
    }
};