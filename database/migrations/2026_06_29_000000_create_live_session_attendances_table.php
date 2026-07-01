<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('live_session_attendances')) {
            Schema::create('live_session_attendances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('live_session_id')->constrained('class_schedules')->onDelete('cascade');
                $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('marked_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('status', 50);
                $table->timestamp('marked_at');
                $table->timestamps();

                $table->unique(['live_session_id', 'student_id'], 'live_session_student_attendance_unique');
                $table->index('student_id');
                $table->index('status');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('live_session_attendances');
    }
};
