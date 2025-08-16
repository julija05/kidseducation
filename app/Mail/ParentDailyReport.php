<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ParentDailyReport extends Mailable
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
            subject: "📚 Daily Learning Report for {$studentName} - Abacoding",
            from: config('mail.from.address'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.parent-daily-report',
            with: [
                'reportData' => $this->reportData,
                'timeSpentFormatted' => $this->formatTime($this->reportData['time_spent'] ?? 0),
                'securityStatus' => $this->getSecurityStatus(),
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
     * Get security status summary
     */
    protected function getSecurityStatus(): string
    {
        $securityEvents = count($this->reportData['security_events'] ?? []);
        $blockedContent = $this->reportData['blocked_content_attempts'] ?? 0;
        
        if ($securityEvents === 0 && $blockedContent === 0) {
            return "✅ No security concerns today";
        }
        
        $status = [];
        if ($securityEvents > 0) {
            $status[] = "{$securityEvents} security event(s)";
        }
        if ($blockedContent > 0) {
            $status[] = "{$blockedContent} content filter activation(s)";
        }
        
        return "⚠️ " . implode(", ", $status);
    }
}