<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing mental arithmetic quizzes to include points_per_session setting
        DB::table('quizzes')
            ->where('type', 'mental_arithmetic')
            ->whereJsonDoesntContain('settings->points_per_session', true)
            ->update([
                'settings' => DB::raw("JSON_SET(COALESCE(settings, '{}'), '$.points_per_session', 10)")
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove points_per_session from mental arithmetic quizzes
        DB::table('quizzes')
            ->where('type', 'mental_arithmetic')
            ->whereJsonContains('settings->points_per_session', true)
            ->update([
                'settings' => DB::raw("JSON_REMOVE(settings, '$.points_per_session')")
            ]);
    }
};