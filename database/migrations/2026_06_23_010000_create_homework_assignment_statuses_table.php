<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('homework_assignment_statuses')) {
            Schema::create('homework_assignment_statuses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('homework_assignment_id')->constrained('homework_assignments')->onDelete('cascade');
                $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
                $table->string('status', 50)->default('not_started');
                $table->timestamp('completed_at')->nullable();
                $table->timestamp('help_requested_at')->nullable();
                $table->timestamps();

                $table->unique(['homework_assignment_id', 'student_id'], 'homework_status_assignment_student_unique');
                $table->index('homework_assignment_id');
                $table->index('student_id');
                $table->index('status');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('homework_assignment_statuses');
    }
};
