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
        Schema::create('class_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('program_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('lesson_id')->nullable()->constrained()->onDelete('set null');
            
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('scheduled_at');
            $table->integer('duration_minutes')->default(60); // Duration in minutes
            $table->string('location')->nullable(); // Online/Physical location
            $table->string('meeting_link')->nullable(); // Zoom/Teams link
            
            $table->enum('status', ['scheduled', 'confirmed', 'cancelled', 'completed'])->default('scheduled');
            $table->enum('type', ['lesson', 'assessment', 'consultation', 'review'])->default('lesson');
            
            // Cancellation/Rescheduling
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Completion
            $table->text('session_notes')->nullable();
            $table->json('session_data')->nullable(); // Additional session data
            $table->timestamp('completed_at')->nullable();
            
            // Notifications
            $table->timestamp('student_notified_at')->nullable();
            $table->timestamp('reminder_sent_at')->nullable();
            
            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'scheduled_at']);
            $table->index(['admin_id', 'scheduled_at']);
            $table->index(['status', 'scheduled_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_schedules');
    }
};