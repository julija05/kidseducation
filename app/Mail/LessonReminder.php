<?php

namespace App\Mail;

use App\Models\ClassSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LessonReminder extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public ClassSchedule $schedule
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
            subject: 'Lesson Reminder - ' . $this->schedule->title . ' Tomorrow',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            html: 'emails.student.lesson-reminder',
            text: 'emails.student.lesson-reminder-text',
            with: [
                'schedule' => $this->schedule,
                'student' => $this->schedule->student,
                'admin' => $this->schedule->admin,
                'program' => $this->schedule->program,
                'lesson' => $this->schedule->lesson,
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