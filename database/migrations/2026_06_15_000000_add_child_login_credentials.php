<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'username')) {
                $table->string('username', 191)->nullable()->unique()->after('email');
            }
        });

        Schema::table('child_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('child_profiles', 'child_username')) {
                $table->string('child_username', 191)->nullable()->after('child_name');
            }

            if (! Schema::hasColumn('child_profiles', 'child_generated_password')) {
                $table->text('child_generated_password')->nullable()->after('child_username');
            }
        });
    }

    public function down(): void
    {
        Schema::table('child_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('child_profiles', 'child_generated_password')) {
                $table->dropColumn('child_generated_password');
            }

            if (Schema::hasColumn('child_profiles', 'child_username')) {
                $table->dropColumn('child_username');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'username')) {
                $table->dropUnique(['username']);
                $table->dropColumn('username');
            }
        });
    }
};
