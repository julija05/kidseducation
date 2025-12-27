<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Updates the type column to include practice and graded quiz types
     */
    public function up(): void
    {
        // Use raw SQL to modify the enum column to include new types
        // This matches the validation in MentorQuizController
        DB::statement("ALTER TABLE quizzes MODIFY COLUMN type ENUM('mental_arithmetic', 'multiple_choice', 'text_answer', 'true_false', 'mixed', 'practice', 'graded') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE quizzes MODIFY COLUMN type ENUM('mental_arithmetic', 'multiple_choice', 'text_answer', 'true_false', 'mixed') NOT NULL");
    }
};
