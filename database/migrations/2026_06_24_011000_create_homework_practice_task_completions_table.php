<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('homework_practice_task_completions')) {
            Schema::create('homework_practice_task_completions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('homework_practice_task_id');
                $table->unsignedBigInteger('student_id');
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();

                $table->unique(['homework_practice_task_id', 'student_id'], 'homework_practice_done_task_student_unique');
                $table->index('homework_practice_task_id');
                $table->index('student_id');
                $table->foreign('homework_practice_task_id', 'hw_practice_done_task_fk')
                    ->references('id')
                    ->on('homework_practice_tasks')
                    ->onDelete('cascade');
                $table->foreign('student_id', 'hw_practice_done_student_fk')
                    ->references('id')
                    ->on('users')
                    ->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('homework_practice_task_completions');
    }
};
