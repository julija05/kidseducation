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
            // Only add columns if they don't exist
            if (! Schema::hasColumn('users', 'theme_preference')) {
                $table->string('theme_preference')->nullable()->default('default');
            }
            if (! Schema::hasColumn('users', 'avatar_preference')) {
                $table->string('avatar_preference')->nullable()->default('default');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['theme_preference', 'avatar_preference']);
        });
    }
};
