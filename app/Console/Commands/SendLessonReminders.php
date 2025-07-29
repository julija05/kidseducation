<?php

namespace App\Console\Commands;

use App\Jobs\SendLessonReminder;
use App\Models\ClassSchedule;
use Illuminate\Console\Command;

class SendLessonReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lessons:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send reminder emails for lessons scheduled in the next 24 hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for lessons that need reminders...');

        // Find lessons that need reminders
        $schedules = ClassSchedule::with(['student', 'students', 'admin', 'program', 'lesson'])
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->whereNull('reminder_sent_at')
            ->where('scheduled_at', '>', now())
            ->where('scheduled_at', '<=', now()->addHours(26)) // 26 hours to handle timezone differences
            ->get();

        $remindersSent = 0;

        foreach ($schedules as $schedule) {
            // Check if it needs a reminder (within 24 hours)
            $hoursUntilLesson = now()->diffInHours($schedule->scheduled_at, false);
            
            if ($hoursUntilLesson <= 24 && $hoursUntilLesson > 0) {
                $this->info("Sending reminder for: {$schedule->title} at {$schedule->getFormattedScheduledTime()}");
                
                SendLessonReminder::dispatch($schedule);
                $remindersSent++;
            }
        }

        $this->info("Processed {$schedules->count()} lessons, dispatched {$remindersSent} reminder jobs.");
        
        return 0;
    }
}