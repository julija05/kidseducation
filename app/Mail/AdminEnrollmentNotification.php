<?php

namespace App\Mail;

use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminEnrollmentNotification extends Mailable
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
            to: 'abacoding@abacoding.com',
            subject: 'New Enrollment Request - '.$this->enrollment->program->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            html: 'emails.admin.enrollment-notification',
            text: 'emails.admin.enrollment-notification-text',
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
