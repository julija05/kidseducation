<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('meetings') && ! Schema::hasColumn('meetings', 'learning_group_id')) {
            Schema::table('meetings', function (Blueprint $table) {
                $table->foreignId('learning_group_id')
                    ->nullable()
                    ->after('mentor_id')
                    ->constrained('learning_groups')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('meetings') && Schema::hasColumn('meetings', 'learning_group_id')) {
            Schema::table('meetings', function (Blueprint $table) {
                $table->dropConstrainedForeignId('learning_group_id');
            });
        }
    }
};
