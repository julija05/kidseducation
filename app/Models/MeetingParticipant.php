<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_id',
        'student_id',
        'status',
        'response_note',
        'responded_at',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
    ];

    /**
     * Get the meeting this participant belongs to
     */
    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    /**
     * Get the student participant
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Check if the participant confirmed attendance
     */
    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    /**
     * Check if the participant declined attendance
     */
    public function isDeclined(): bool
    {
        return $this->status === 'declined';
    }

    /**
     * Check if the participant attended
     */
    public function hasAttended(): bool
    {
        return $this->status === 'attended';
    }

    /**
     * Check if the participant was invited but hasn't responded
     */
    public function isInvited(): bool
    {
        return $this->status === 'invited';
    }

    /**
     * Mark participant as confirmed
     */
    public function confirm(?string $note = null): bool
    {
        return $this->update([
            'status' => 'confirmed',
            'response_note' => $note,
            'responded_at' => now(),
        ]);
    }

    /**
     * Mark participant as declined
     */
    public function decline(?string $note = null): bool
    {
        return $this->update([
            'status' => 'declined',
            'response_note' => $note,
            'responded_at' => now(),
        ]);
    }

    /**
     * Mark participant as attended
     */
    public function markAsAttended(): bool
    {
        return $this->update(['status' => 'attended']);
    }

    /**
     * Mark participant as missed
     */
    public function markAsMissed(): bool
    {
        return $this->update(['status' => 'missed']);
    }

    /**
     * Scope for confirmed participants
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope for pending responses
     */
    public function scopePending($query)
    {
        return $query->where('status', 'invited');
    }
}
