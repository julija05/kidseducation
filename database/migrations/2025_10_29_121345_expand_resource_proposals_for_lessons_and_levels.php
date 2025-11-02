<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Expands resource_proposals table to support lesson and level proposals
     */
    public function up(): void
    {
        Schema::table('resource_proposals', function (Blueprint $table) {
            // Add program_id to track which program this proposal belongs to
            if (!Schema::hasColumn('resource_proposals', 'program_id')) {
                $table->foreignId('program_id')->after('lesson_id')->nullable()->constrained('programs')->onDelete('cascade');
            }

            // Add fields for lesson proposals
            if (!Schema::hasColumn('resource_proposals', 'proposed_lesson_title')) {
                $table->string('proposed_lesson_title')->after('proposed_order')->nullable();
            }
            if (!Schema::hasColumn('resource_proposals', 'proposed_lesson_description')) {
                $table->text('proposed_lesson_description')->after('proposed_lesson_title')->nullable();
            }
            if (!Schema::hasColumn('resource_proposals', 'proposed_lesson_level')) {
                $table->integer('proposed_lesson_level')->after('proposed_lesson_description')->nullable();
            }
            if (!Schema::hasColumn('resource_proposals', 'proposed_lesson_order')) {
                $table->integer('proposed_lesson_order')->after('proposed_lesson_level')->nullable();
            }

            // Add fields for level proposals
            if (!Schema::hasColumn('resource_proposals', 'proposed_level_number')) {
                $table->integer('proposed_level_number')->after('proposed_lesson_order')->nullable();
            }
            if (!Schema::hasColumn('resource_proposals', 'proposed_level_description')) {
                $table->text('proposed_level_description')->after('proposed_level_number')->nullable();
            }

            // Update proposal_type enum to support new types
            // Note: In production, you may need to use raw SQL to modify enums
            // For now, we'll handle validation at application level using ProposalType constants
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resource_proposals', function (Blueprint $table) {
            if (Schema::hasColumn('resource_proposals', 'program_id')) {
                $table->dropForeign(['program_id']);
                $table->dropColumn('program_id');
            }

            $columnsToRemove = [
                'proposed_lesson_title',
                'proposed_lesson_description',
                'proposed_lesson_level',
                'proposed_lesson_order',
                'proposed_level_number',
                'proposed_level_description',
            ];

            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('resource_proposals', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
