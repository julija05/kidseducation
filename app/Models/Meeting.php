<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'mentor_id',
        'title',
        'description',
        'meeting_type',
        'scheduled_at',
        'duration_minutes',
        'meeting_url',
        'location',
        'status',
        'max_participants',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'duration_minutes' => 'integer',
        'max_participants' => 'integer',
    ];

    /**
     * Get the mentor who scheduled this meeting
     */
    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    /**
     * Get all participants for this meeting
     */
    public function participants(): HasMany
    {
        return $this->hasMany(MeetingParticipant::class);
    }

    /**
     * Get students participating in this meeting
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'meeting_participants', 'meeting_id', 'student_id')
            ->withPivot(['status', 'response_note', 'responded_at'])
            ->withTimestamps();
    }

    /**
     * Check if the meeting is scheduled (not completed or cancelled)
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if the meeting is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the meeting is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if this is a group meeting
     */
    public function isGroupMeeting(): bool
    {
        return $this->meeting_type === 'group';
    }

    /**
     * Check if this is an individual meeting
     */
    public function isIndividualMeeting(): bool
    {
        return $this->meeting_type === 'individual';
    }

    /**
     * Check if the meeting can accept more participants
     */
    public function canAddParticipant(): bool
    {
        return $this->participants()->count() < $this->max_participants;
    }

    /**
     * Get the number of confirmed participants
     */
    public function getConfirmedParticipantsCount(): int
    {
        return $this->participants()->where('status', 'confirmed')->count();
    }

    /**
     * Get the number of available slots
     */
    public function getAvailableSlots(): int
    {
        return max(0, $this->max_participants - $this->participants()->count());
    }

    /**
     * Mark the meeting as completed
     */
    public function markAsCompleted(): bool
    {
        return $this->update(['status' => 'completed']);
    }

    /**
     * Cancel the meeting
     */
    public function cancel(): bool
    {
        return $this->update(['status' => 'cancelled']);
    }

    /**
     * Check if the meeting is in the past
     */
    public function isPast(): bool
    {
        return $this->scheduled_at->isPast();
    }

    /**
     * Check if the meeting is upcoming
     */
    public function isUpcoming(): bool
    {
        return $this->scheduled_at->isFuture() && $this->isScheduled();
    }

    /**
     * Get the end time of the meeting
     */
    public function getEndTime()
    {
        return $this->scheduled_at->addMinutes($this->duration_minutes);
    }

    /**
     * Scope for upcoming meetings
     */
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())
            ->where('status', 'scheduled')
            ->orderBy('scheduled_at', 'asc');
    }

    /**
     * Scope for past meetings
     */
    public function scopePast($query)
    {
        return $query->where('scheduled_at', '<', now())
            ->orderBy('scheduled_at', 'desc');
    }

    /**
     * Scope for meetings by mentor
     */
    public function scopeByMentor($query, $mentorId)
    {
        return $query->where('mentor_id', $mentorId);
    }

    /**
     * Scope for meetings by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
