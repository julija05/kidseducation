<?php

namespace App\Jobs;

use App\Mail\LessonReminder;
use App\Models\ClassSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendLessonReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ClassSchedule $schedule
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Check if reminder was already sent or if lesson is cancelled/completed
        if ($this->schedule->reminder_sent_at ||
            $this->schedule->isCancelled() ||
            $this->schedule->isCompleted()) {
            return;
        }

        // Refresh the model to get latest data
        $this->schedule->refresh();

        // Double check it's still valid to send reminder
        if (! $this->schedule->needsReminder()) {
            return;
        }

        // Send reminder emails to all students
        $students = $this->schedule->getAllStudents();

        foreach ($students as $student) {
            // Create a temporary schedule with student context for the email
            $scheduleForEmail = clone $this->schedule;
            $scheduleForEmail->student = $student;

            // Ensure the student relationship is properly loaded
            $scheduleForEmail->setRelation('student', $student);

            Mail::to($student->email)->send(new LessonReminder($scheduleForEmail));
        }

        // Mark reminder as sent
        $this->schedule->markReminderSent();
    }

    /**
     * The job failed to process.
     */
    public function failed(): void
    {
        // Log the failure but don't retry
        logger()->error('Failed to send lesson reminder', [
            'schedule_id' => $this->schedule->id,
            'schedule_title' => $this->schedule->title,
            'scheduled_at' => $this->schedule->scheduled_at,
        ]);
    }
}
