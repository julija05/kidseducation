<?php

namespace App\Mail;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmergencyChatAlert extends Mailable
{
    use Queueable, SerializesModels;

    public ChatConversation $conversation;
    public ChatMessage $firstMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(ChatConversation $conversation, ChatMessage $firstMessage)
    {
        $this->conversation = $conversation;
        $this->firstMessage = $firstMessage;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🚨 URGENT: New Live Chat Request - Immediate Response Needed',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.emergency-chat-alert',
            with: [
                'conversation' => $this->conversation,
                'firstMessage' => $this->firstMessage,
                'visitorName' => $this->conversation->visitor_name ?: 'Anonymous Visitor',
                'visitorEmail' => $this->conversation->visitor_email,
                'chatUrl' => url('/admin/chat'),
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