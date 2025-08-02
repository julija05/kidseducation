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
        // Check if lessons table exists before trying to modify it
        if (Schema::hasTable('lessons')) {
            Schema::table('lessons', function (Blueprint $table) {
                // Only add columns if they don't already exist
                if (!Schema::hasColumn('lessons', 'title_translations')) {
                    $table->json('title_translations')->nullable()->after('title');
                }
                if (!Schema::hasColumn('lessons', 'description_translations')) {
                    $table->json('description_translations')->nullable()->after('description');
                }
                if (!Schema::hasColumn('lessons', 'content_body_translations')) {
                    $table->json('content_body_translations')->nullable()->after('content_body');
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
        // Check if lessons table exists before trying to modify it
        if (Schema::hasTable('lessons')) {
            Schema::table('lessons', function (Blueprint $table) {
                if (Schema::hasColumn('lessons', 'title_translations')) {
                    $table->dropColumn('title_translations');
                }
                if (Schema::hasColumn('lessons', 'description_translations')) {
                    $table->dropColumn('description_translations');
                }
                if (Schema::hasColumn('lessons', 'content_body_translations')) {
                    $table->dropColumn('content_body_translations');
                }
            });
        }
    }
};