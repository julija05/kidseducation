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
        Schema::table('enrollments', function (Blueprint $table) {
            // Add missing rejection fields
            if (! Schema::hasColumn('enrollments', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable()->after('approved_by');
            }
            if (! Schema::hasColumn('enrollments', 'rejected_by')) {
                $table->foreignId('rejected_by')->nullable()->after('rejected_at')->constrained('users');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (Schema::hasColumn('enrollments', 'rejected_by')) {
                $table->dropForeign(['rejected_by']);
                $table->dropColumn('rejected_by');
            }
            if (Schema::hasColumn('enrollments', 'rejected_at')) {
                $table->dropColumn('rejected_at');
            }
        });
    }
};
