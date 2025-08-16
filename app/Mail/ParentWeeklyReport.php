<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ParentWeeklyReport extends Mailable
{
    use Queueable, SerializesModels;

    public array $reportData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $reportData)
    {
        $this->reportData = $reportData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $studentName = $this->reportData['student_name'] ?? 'Your child';
        
        return new Envelope(
            subject: "📊 Weekly Learning Summary for {$studentName} - Abacoding",
            from: config('mail.from.address'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.parent-weekly-report',
            with: [
                'reportData' => $this->reportData,
                'totalTimeFormatted' => $this->formatTime($this->reportData['total_time_spent'] ?? 0),
                'averageDailyTime' => $this->calculateAverageDailyTime(),
                'progressSummary' => $this->getProgressSummary(),
            ],
        );
    }

    /**
     * Format time in minutes to hours and minutes
     */
    protected function formatTime(int $minutes): string
    {
        if ($minutes < 60) {
            return "{$minutes} minutes";
        }
        
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        if ($remainingMinutes === 0) {
            return $hours === 1 ? "1 hour" : "{$hours} hours";
        }
        
        return $hours === 1 
            ? "1 hour {$remainingMinutes} minutes"
            : "{$hours} hours {$remainingMinutes} minutes";
    }

    /**
     * Calculate average daily time
     */
    protected function calculateAverageDailyTime(): string
    {
        $totalTime = $this->reportData['total_time_spent'] ?? 0;
        $averageMinutes = round($totalTime / 7);
        
        return $this->formatTime($averageMinutes);
    }

    /**
     * Get learning progress summary
     */
    protected function getProgressSummary(): array
    {
        $progress = $this->reportData['learning_progress'] ?? [];
        
        return [
            'lessons_completed' => $progress['lessons_completed'] ?? 0,
            'programs_active' => count($progress['programs'] ?? []),
            'achievements_earned' => count($progress['achievements'] ?? []),
            'overall_progress' => $progress['overall_percentage'] ?? 0,
        ];
    }
}