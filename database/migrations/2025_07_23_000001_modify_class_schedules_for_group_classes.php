<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the class_schedules table to support group classes
        Schema::table('class_schedules', function (Blueprint $table) {
            // Add fields for group classes
            $table->boolean('is_group_class')->default(false);
            $table->integer('max_students')->default(1);

            // Make student_id nullable since group classes will use pivot table
            $table->foreignId('student_id')->nullable()->change();
        });

        // Create pivot table for group class students
        Schema::create('class_schedule_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_schedule_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Prevent duplicate enrollments
            $table->unique(['class_schedule_id', 'student_id']);

            // Indexes for better performance
            $table->index('class_schedule_id');
            $table->index('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_schedule_students');

        Schema::table('class_schedules', function (Blueprint $table) {
            $table->dropColumn(['is_group_class', 'max_students']);
            $table->foreignId('student_id')->nullable(false)->change();
        });
    }
};
