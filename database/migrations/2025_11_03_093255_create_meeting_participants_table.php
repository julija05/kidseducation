<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates meeting_participants pivot table for tracking student participation in meetings
     */
    public function up(): void
    {
        if (!Schema::hasTable('meeting_participants')) {
            Schema::create('meeting_participants', function (Blueprint $table) {
                $table->id();

                // Foreign keys
                $table->foreignId('meeting_id')->constrained('meetings')->onDelete('cascade');
                $table->foreignId('student_id')->constrained('users')->onDelete('cascade');

                // Participation status
                $table->string('status', 50)->default('invited'); // invited, confirmed, declined, attended, missed

                // Response tracking
                $table->text('response_note')->nullable();
                $table->dateTime('responded_at')->nullable();

                $table->timestamps();

                // Ensure a student can only be added once per meeting
                $table->unique(['meeting_id', 'student_id']);

                // Indexes for performance
                $table->index('meeting_id');
                $table->index('student_id');
                $table->index('status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting_participants');
    }
};
