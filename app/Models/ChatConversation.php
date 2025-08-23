<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ChatConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'user_id',
        'admin_id',
        'status',
        'visitor_name',
        'visitor_email',
        'initial_message',
        'last_activity_at',
    ];

    protected $casts = [
        'last_activity_at' => 'datetime',
    ];

    /**
     * Relationship with the user who started the conversation
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship with the admin handling the conversation
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Relationship with chat messages
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id')->orderBy('created_at');
    }

    /**
     * Get the latest message for this conversation
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(ChatMessage::class, 'conversation_id')->latest();
    }

    /**
     * Get unread messages count for admin
     */
    public function unreadMessagesCount(): int
    {
        return $this->messages()
            ->where('sender_type', '!=', 'admin')
            ->where('is_read', false)
            ->count();
    }

    /**
     * Get unread messages count for user
     */
    public function unreadMessagesForUser(): int
    {
        return $this->messages()
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->count();
    }

    /**
     * Mark all messages as read by admin
     */
    public function markAsReadByAdmin(): void
    {
        $this->messages()
            ->where('sender_type', '!=', 'admin')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Mark all messages as read by user
     */
    public function markAsReadByUser(): void
    {
        $this->messages()
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Update last activity timestamp
     */
    public function updateActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Scope for active conversations
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for waiting conversations
     */
    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    /**
     * Scope for draft conversations (no messages sent yet)
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope for conversations assigned to specific admin
     */
    public function scopeAssignedTo($query, $adminId)
    {
        return $query->where('admin_id', $adminId);
    }
}
