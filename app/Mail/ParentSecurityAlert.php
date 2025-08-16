<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ParentSecurityAlert extends Mailable
{
    use Queueable, SerializesModels;

    public array $alertData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $alertData)
    {
        $this->alertData = $alertData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->getSubjectBySeverity();
        
        return new Envelope(
            subject: $subject,
            from: config('mail.from.address'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.parent-security-alert',
            with: [
                'alertData' => $this->alertData,
                'severityColor' => $this->getSeverityColor(),
                'severityIcon' => $this->getSeverityIcon(),
            ],
        );
    }

    /**
     * Get subject line based on severity
     */
    protected function getSubjectBySeverity(): string
    {
        $severity = $this->alertData['severity'] ?? 'medium';
        $studentName = $this->alertData['student_name'] ?? 'Your child';
        
        return match($severity) {
            'critical' => "🚨 URGENT: Security Alert for {$studentName} - Abacoding",
            'high' => "⚠️ Security Alert for {$studentName} - Abacoding", 
            'medium' => "🔔 Security Notice for {$studentName} - Abacoding",
            'low' => "ℹ️ Security Update for {$studentName} - Abacoding",
            default => "🔔 Security Alert for {$studentName} - Abacoding"
        };
    }

    /**
     * Get color for severity level
     */
    protected function getSeverityColor(): string
    {
        return match($this->alertData['severity'] ?? 'medium') {
            'critical' => '#dc2626', // red-600
            'high' => '#ea580c', // orange-600
            'medium' => '#d97706', // amber-600
            'low' => '#2563eb', // blue-600
            default => '#6b7280' // gray-500
        };
    }

    /**
     * Get icon for severity level
     */
    protected function getSeverityIcon(): string
    {
        return match($this->alertData['severity'] ?? 'medium') {
            'critical' => '🚨',
            'high' => '⚠️',
            'medium' => '🔔',
            'low' => 'ℹ️',
            default => '🔔'
        };
    }
}