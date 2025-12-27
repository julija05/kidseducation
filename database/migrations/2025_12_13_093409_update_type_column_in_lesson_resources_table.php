<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Updates the type column to include youtube, pdf, word, and other resource types
     */
    public function up(): void
    {
        // Use raw SQL to modify the enum column to include new types
        // This matches the validation in MentorProposalController
        DB::statement("ALTER TABLE lesson_resources MODIFY COLUMN type ENUM('video', 'document', 'link', 'download', 'interactive', 'quiz', 'youtube', 'pdf', 'word', 'other') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE lesson_resources MODIFY COLUMN type ENUM('video', 'document', 'link', 'download', 'interactive', 'quiz') NOT NULL");
    }
};
