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
        Schema::table('enrollments', function (Blueprint $table) {
            if (!Schema::hasColumn('enrollments', 'enrollment_type')) {
                $table->enum('enrollment_type', ['student', 'mentor'])
                    ->default('student')
                    ->after('program_id')
                    ->comment('Type of enrollment: student learns, mentor teaches');
                $table->index('enrollment_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (Schema::hasColumn('enrollments', 'enrollment_type')) {
                $table->dropIndex(['enrollment_type']);
                $table->dropColumn('enrollment_type');
            }
        });
    }
};
