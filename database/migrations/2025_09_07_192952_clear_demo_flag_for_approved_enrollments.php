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
        // Clear is_demo_account flag for users who have approved enrollments
        // This fixes the issue where former demo users with approved enrollments
        // were still being treated as demo accounts and couldn't access resources
        
        DB::statement("
            UPDATE users 
            SET is_demo_account = false 
            WHERE is_demo_account = true 
            AND id IN (
                SELECT DISTINCT user_id 
                FROM enrollments 
                WHERE approval_status = 'approved'
            )
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be easily reversed as we don't know
        // which users were originally demo accounts vs. those who had
        // their demo status cleared due to approved enrollments
    }
};
