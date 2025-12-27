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
        Schema::table('programs', function (Blueprint $table) {
            // Add approval status field (pending, approved, rejected)
            if (!Schema::hasColumn('programs', 'approval_status')) {
                $table->string('approval_status', 50)->default('approved')->after('is_active');
            }

            // Add proposed_by field to track which mentor proposed the program
            if (!Schema::hasColumn('programs', 'proposed_by')) {
                $table->foreignId('proposed_by')->nullable()->after('approval_status')->constrained('users')->nullOnDelete();
            }

            // Add approved/rejected by field
            if (!Schema::hasColumn('programs', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('proposed_by')->constrained('users')->nullOnDelete();
            }

            // Add approved_at timestamp
            if (!Schema::hasColumn('programs', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }

            // Add rejected_at timestamp
            if (!Schema::hasColumn('programs', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable()->after('approved_at');
            }

            // Add rejection_reason field
            if (!Schema::hasColumn('programs', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('rejected_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            // Drop columns in reverse order
            if (Schema::hasColumn('programs', 'rejection_reason')) {
                $table->dropColumn('rejection_reason');
            }

            if (Schema::hasColumn('programs', 'rejected_at')) {
                $table->dropColumn('rejected_at');
            }

            if (Schema::hasColumn('programs', 'approved_at')) {
                $table->dropColumn('approved_at');
            }

            if (Schema::hasColumn('programs', 'approved_by')) {
                $table->dropForeign(['approved_by']);
                $table->dropColumn('approved_by');
            }

            if (Schema::hasColumn('programs', 'proposed_by')) {
                $table->dropForeign(['proposed_by']);
                $table->dropColumn('proposed_by');
            }

            if (Schema::hasColumn('programs', 'approval_status')) {
                $table->dropColumn('approval_status');
            }
        });
    }
};
