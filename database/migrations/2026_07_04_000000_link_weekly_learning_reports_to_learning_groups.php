<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('weekly_learning_reports', function (Blueprint $table) {
            if (! Schema::hasColumn('weekly_learning_reports', 'learning_group_id')) {
                $table->foreignId('learning_group_id')->nullable()->after('child_user_id')->constrained('learning_groups')->cascadeOnDelete();
                $table->index(['learning_group_id', 'week_number'], 'weekly_reports_group_week_index');
            }

            if (! Schema::hasColumn('weekly_learning_reports', 'mentor_id')) {
                $table->foreignId('mentor_id')->nullable()->after('learning_group_id')->constrained('users')->nullOnDelete();
            }
        });

        if (! Schema::hasTable('weekly_learning_report_notes')) {
            Schema::create('weekly_learning_report_notes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('weekly_learning_report_id')->constrained('weekly_learning_reports')->cascadeOnDelete();
                $table->foreignId('child_user_id')->constrained('users')->cascadeOnDelete();
                $table->text('note');
                $table->timestamps();

                $table->unique(['weekly_learning_report_id', 'child_user_id'], 'weekly_report_child_note_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_learning_report_notes');

        Schema::table('weekly_learning_reports', function (Blueprint $table) {
            if (Schema::hasColumn('weekly_learning_reports', 'mentor_id')) {
                $table->dropConstrainedForeignId('mentor_id');
            }
            if (Schema::hasColumn('weekly_learning_reports', 'learning_group_id')) {
                $table->dropIndex('weekly_reports_group_week_index');
                $table->dropConstrainedForeignId('learning_group_id');
            }
        });
    }
};
