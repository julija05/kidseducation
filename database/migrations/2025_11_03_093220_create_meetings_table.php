<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates meetings table for mentor-scheduled class meetings
     */
    public function up(): void
    {
        if (!Schema::hasTable('meetings')) {
            Schema::create('meetings', function (Blueprint $table) {
                $table->id();

                // Mentor who scheduled the meeting
                $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');

                // Meeting details
                $table->string('title', 191);
                $table->text('description')->nullable();
                $table->string('meeting_type', 50)->default('individual'); // individual or group

                // Scheduling information
                $table->dateTime('scheduled_at');
                $table->integer('duration_minutes')->default(60);

                // Location/URL
                $table->string('meeting_url', 500)->nullable(); // for online meetings
                $table->string('location', 191)->nullable(); // for physical meetings

                // Status and limits
                $table->string('status', 50)->default('scheduled'); // scheduled, completed, cancelled
                $table->integer('max_participants')->default(1); // 1 for individual, up to 5 for group

                // Notes
                $table->text('notes')->nullable();

                $table->timestamps();

                // Indexes for performance
                $table->index('mentor_id');
                $table->index('scheduled_at');
                $table->index('status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
