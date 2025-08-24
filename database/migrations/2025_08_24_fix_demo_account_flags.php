<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix existing demo users where is_demo_account is 0 but they have demo access
        DB::statement("
            UPDATE users 
            SET is_demo_account = 1 
            WHERE is_demo_account = 0 
            AND demo_created_at IS NOT NULL 
            AND demo_expires_at IS NOT NULL 
            AND demo_program_slug IS NOT NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optionally revert the changes
        DB::statement("
            UPDATE users 
            SET is_demo_account = 0 
            WHERE demo_created_at IS NOT NULL 
            AND demo_expires_at IS NOT NULL 
            AND demo_program_slug IS NOT NULL
        ");
    }
};