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
        // Check if lesson_resources table exists before trying to modify it
        if (Schema::hasTable('lesson_resources')) {
            Schema::table('lesson_resources', function (Blueprint $table) {
                // Only add columns if they don't already exist
                if (!Schema::hasColumn('lesson_resources', 'title_translations')) {
                    $table->json('title_translations')->nullable()->after('title');
                }
                if (!Schema::hasColumn('lesson_resources', 'description_translations')) {
                    $table->json('description_translations')->nullable()->after('description');
                }
            });
        }
        
        // Migrate existing data to translations (will be done after models are updated)
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Check if lesson_resources table exists before trying to modify it
        if (Schema::hasTable('lesson_resources')) {
            Schema::table('lesson_resources', function (Blueprint $table) {
                if (Schema::hasColumn('lesson_resources', 'title_translations')) {
                    $table->dropColumn('title_translations');
                }
                if (Schema::hasColumn('lesson_resources', 'description_translations')) {
                    $table->dropColumn('description_translations');
                }
            });
        }
    }
};