<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add mentor referral tracking to enrollments
     */
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (!Schema::hasColumn('enrollments', 'referred_by_mentor_id')) {
                $table->foreignId('referred_by_mentor_id')->nullable()->after('approval_status')->constrained('users')->nullOnDelete();
                $table->index('referred_by_mentor_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (Schema::hasColumn('enrollments', 'referred_by_mentor_id')) {
                $table->dropForeign(['referred_by_mentor_id']);
                $table->dropIndex(['referred_by_mentor_id']);
                $table->dropColumn('referred_by_mentor_id');
            }
        });
    }
};
