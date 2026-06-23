<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('learning_group_student')) {
            Schema::create('learning_group_student', function (Blueprint $table) {
                $table->id();
                $table->foreignId('learning_group_id')->constrained('learning_groups')->onDelete('cascade');
                $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
                $table->timestamps();

                $table->unique(['learning_group_id', 'student_id'], 'learning_group_student_unique');
                $table->index('learning_group_id');
                $table->index('student_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_group_student');
    }
};
