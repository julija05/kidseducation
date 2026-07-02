<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('mentor_notes')) {
            Schema::create('mentor_notes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('mentor_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('learning_group_id')->constrained('learning_groups')->cascadeOnDelete();
                $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
                $table->foreignId('live_session_id')->nullable()->constrained('class_schedules')->nullOnDelete();
                $table->text('note');
                $table->boolean('visible_to_parent')->default(false);
                $table->timestamps();

                $table->index(['student_id', 'created_at']);
                $table->index(['mentor_id', 'student_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('mentor_notes');
    }
};
