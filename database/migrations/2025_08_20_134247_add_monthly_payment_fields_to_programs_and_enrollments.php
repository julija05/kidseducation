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
            $table->boolean('requires_monthly_payment')->default(false)->after('price');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->boolean('access_blocked')->default(false)->after('approval_status');
            $table->text('block_reason')->nullable()->after('access_blocked');
            $table->timestamp('blocked_at')->nullable()->after('block_reason');
            $table->foreignId('blocked_by')->nullable()->constrained('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn('requires_monthly_payment');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['blocked_by']);
            $table->dropColumn(['access_blocked', 'block_reason', 'blocked_at', 'blocked_by']);
        });
    }
};
