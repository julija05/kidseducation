<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Program;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentEnrollmentRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Program $program
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Enrollment Request Received - ' . $this->program->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student-enrollment-request',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
