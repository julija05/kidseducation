<?php

namespace App\Mail;

use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminEnrollmentNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Enrollment $enrollment
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Enrollment Request - ' . $this->enrollment->program->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-enrollment-notification',
            with: [
                'user' => $this->enrollment->user,
                'program' => $this->enrollment->program,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
