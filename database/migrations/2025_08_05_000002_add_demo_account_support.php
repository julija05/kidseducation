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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_demo_account')->default(false)->after('language_selected');
            $table->timestamp('demo_created_at')->nullable()->after('is_demo_account');
            $table->timestamp('demo_expires_at')->nullable()->after('demo_created_at');
            $table->string('demo_program_slug')->nullable()->after('demo_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_demo_account', 'demo_created_at', 'demo_expires_at', 'demo_program_slug']);
        });
    }
};
