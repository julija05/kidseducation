<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->integer('quiz_points')->default(0)->after('progress');
            $table->integer('highest_unlocked_level')->default(1)->after('quiz_points');
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn(['quiz_points', 'highest_unlocked_level']);
        });
    }
};