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
        // Check if programs table exists before trying to modify it
        if (Schema::hasTable('programs')) {
            Schema::table('programs', function (Blueprint $table) {
                // Only add columns if they don't already exist
                if (!Schema::hasColumn('programs', 'name_translations')) {
                    $table->json('name_translations')->nullable()->after('name');
                }
                if (!Schema::hasColumn('programs', 'description_translations')) {
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
        // Check if programs table exists before trying to modify it
        if (Schema::hasTable('programs')) {
            Schema::table('programs', function (Blueprint $table) {
                if (Schema::hasColumn('programs', 'name_translations')) {
                    $table->dropColumn('name_translations');
                }
                if (Schema::hasColumn('programs', 'description_translations')) {
                    $table->dropColumn('description_translations');
                }
            });
        }
    }
};