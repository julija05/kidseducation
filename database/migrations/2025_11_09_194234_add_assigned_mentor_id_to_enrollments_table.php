<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add assigned mentor tracking to enrollments - every student needs a mentor
     */
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (!Schema::hasColumn('enrollments', 'assigned_mentor_id')) {
                // Add mentor assignment field after referred_by_mentor_id
                $table->foreignId('assigned_mentor_id')->nullable()->after('referred_by_mentor_id')
                    ->constrained('users')->nullOnDelete();
                $table->index('assigned_mentor_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (Schema::hasColumn('enrollments', 'assigned_mentor_id')) {
                $table->dropForeign(['assigned_mentor_id']);
                $table->dropIndex(['assigned_mentor_id']);
                $table->dropColumn('assigned_mentor_id');
            }
        });
    }
};
