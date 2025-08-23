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
        if (Schema::hasTable('lesson_resources')) {
            Schema::table('lesson_resources', function (Blueprint $table) {
                // Remove translation columns since we're using separate files per language
                if (Schema::hasColumn('lesson_resources', 'title_translations')) {
                    $table->dropColumn('title_translations');
                }
                if (Schema::hasColumn('lesson_resources', 'description_translations')) {
                    $table->dropColumn('description_translations');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('lesson_resources')) {
            Schema::table('lesson_resources', function (Blueprint $table) {
                // Re-add translation columns if needed
                $table->json('title_translations')->nullable()->after('title');
                $table->json('description_translations')->nullable()->after('description');
            });
        }
    }
};
