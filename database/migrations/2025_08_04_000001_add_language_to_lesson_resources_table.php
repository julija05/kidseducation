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
        Schema::table('lesson_resources', function (Blueprint $table) {
            // Add language field to specify which language this resource is for
            $table->string('language', 5)->default('en')->after('type');
            
            // Add index for efficient querying by language
            $table->index(['lesson_id', 'language']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lesson_resources', function (Blueprint $table) {
            $table->dropIndex(['lesson_id', 'language']);
            $table->dropColumn('language');
        });
    }
};