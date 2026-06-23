<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('homework_assignments')) {
            Schema::create('homework_assignments', function (Blueprint $table) {
                $table->id();
                $table->string('title', 191);
                $table->text('instructions');
                $table->foreignId('learning_group_id')->constrained('learning_groups')->onDelete('cascade');
                $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
                $table->foreignId('live_session_id')->nullable()->constrained('class_schedules')->onDelete('set null');
                $table->date('due_date')->nullable();
                $table->unsignedSmallInteger('estimated_practice_minutes')->default(15);
                $table->string('status', 50)->default('assigned');
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamps();

                $table->index('learning_group_id');
                $table->index('lesson_id');
                $table->index('live_session_id');
                $table->index('status');
                $table->index('due_date');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('homework_assignments');
    }
};
