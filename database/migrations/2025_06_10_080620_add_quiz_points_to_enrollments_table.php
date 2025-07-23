<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (!Schema::hasColumn('enrollments', 'quiz_points')) {
                $table->integer('quiz_points')->default(0)->after('progress');
            }
            if (!Schema::hasColumn('enrollments', 'highest_unlocked_level')) {
                $table->integer('highest_unlocked_level')->default(1)->after('quiz_points');
            }
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $columnsToDropColumn = [];
            if (Schema::hasColumn('enrollments', 'quiz_points')) {
                $columnsToDropColumn[] = 'quiz_points';
            }
            if (Schema::hasColumn('enrollments', 'highest_unlocked_level')) {
                $columnsToDropColumn[] = 'highest_unlocked_level';
            }
            if (!empty($columnsToDropColumn)) {
                $table->dropColumn($columnsToDropColumn);
            }
        });
    }
};