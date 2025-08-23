<?php

namespace App\Mail;

use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentEnrollmentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Enrollment $enrollment
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: 'abacoding@abacoding.com',
            subject: 'Enrollment Request Received - '.$this->enrollment->program->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            html: 'emails.student.enrollment-confirmation',
            text: 'emails.student.enrollment-confirmation-text',
            with: [
                'enrollment' => $this->enrollment,
                'student' => $this->enrollment->user,
                'program' => $this->enrollment->program,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
