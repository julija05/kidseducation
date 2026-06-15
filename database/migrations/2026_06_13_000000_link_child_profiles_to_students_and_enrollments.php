<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('child_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('child_profiles', 'child_user_id')) {
                $table->foreignId('child_user_id')
                    ->nullable()
                    ->after('parent_user_id')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('child_profiles', 'program_id')) {
                $table->foreignId('program_id')
                    ->nullable()
                    ->after('child_user_id')
                    ->constrained('programs')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('child_profiles', 'enrollment_id')) {
                $table->foreignId('enrollment_id')
                    ->nullable()
                    ->after('program_id')
                    ->constrained('enrollments')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('child_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('child_profiles', 'enrollment_id')) {
                $table->dropForeign(['enrollment_id']);
                $table->dropColumn('enrollment_id');
            }

            if (Schema::hasColumn('child_profiles', 'program_id')) {
                $table->dropForeign(['program_id']);
                $table->dropColumn('program_id');
            }

            if (Schema::hasColumn('child_profiles', 'child_user_id')) {
                $table->dropForeign(['child_user_id']);
                $table->dropColumn('child_user_id');
            }
        });
    }
};
