<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('meeting_participants')) {
            return;
        }

        Schema::table('meeting_participants', function (Blueprint $table) {
            if (! Schema::hasColumn('meeting_participants', 'attendance_marked_at')) {
                $table->dateTime('attendance_marked_at')->nullable()->after('responded_at');
            }

            if (! Schema::hasColumn('meeting_participants', 'attendance_marked_by')) {
                $table->foreignId('attendance_marked_by')
                    ->nullable()
                    ->after('attendance_marked_at')
                    ->constrained('users')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('meeting_participants')) {
            return;
        }

        Schema::table('meeting_participants', function (Blueprint $table) {
            if (Schema::hasColumn('meeting_participants', 'attendance_marked_by')) {
                $table->dropConstrainedForeignId('attendance_marked_by');
            }

            if (Schema::hasColumn('meeting_participants', 'attendance_marked_at')) {
                $table->dropColumn('attendance_marked_at');
            }
        });
    }
};
