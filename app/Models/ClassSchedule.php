<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ClassSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'admin_id',
        'program_id',
        'lesson_id',
        'title',
        'description',
        'scheduled_at',
        'duration_minutes',
        'location',
        'meeting_link',
        'status',
        'type',
        'is_group_class',
        'max_students',
        'cancellation_reason',
        'cancelled_at',
        'cancelled_by',
        'session_notes',
        'session_data',
        'completed_at',
        'student_notified_at',
        'reminder_sent_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
        'student_notified_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'session_data' => 'array',
        'duration_minutes' => 'integer',
        'is_group_class' => 'boolean',
        'max_students' => 'integer',
    ];

    protected $attributes = [
        'status' => 'scheduled',
        'type' => 'lesson',
        'duration_minutes' => 60,
        'is_group_class' => false,
        'max_students' => 1,
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    // Group class relationships
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'class_schedule_students', 'class_schedule_id', 'student_id')
                    ->withTimestamps();
    }

    // Get all students (individual or group)
    public function getAllStudents()
    {
        if ($this->is_group_class) {
            return $this->students;
        }
        
        return $this->student ? collect([$this->student]) : collect();
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>', now())
                    ->whereIn('status', ['scheduled', 'confirmed']);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_at', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('scheduled_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForAdmin($query, $adminId)
    {
        return $query->where('admin_id', $adminId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Status check methods
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isPast(): bool
    {
        return $this->scheduled_at->isPast();
    }

    public function isUpcoming(): bool
    {
        return $this->scheduled_at->isFuture() && !$this->isCancelled();
    }

    public function canBeCancelled(): bool
    {
        return !$this->isCancelled() && !$this->isCompleted() && !$this->isPast();
    }

    public function canBeRescheduled(): bool
    {
        return $this->canBeCancelled();
    }

    // Action methods
    public function confirm(): bool
    {
        if (!$this->isScheduled()) {
            return false;
        }

        return $this->update(['status' => 'confirmed']);
    }

    public function cancel(string $reason = null, User $cancelledBy = null): bool
    {
        if (!$this->canBeCancelled()) {
            return false;
        }

        return $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
            'cancelled_by' => $cancelledBy?->id,
        ]);
    }

    public function complete(string $notes = null, array $sessionData = null): bool
    {
        if ($this->isCancelled() || $this->isCompleted()) {
            return false;
        }

        return $this->update([
            'status' => 'completed',
            'session_notes' => $notes,
            'session_data' => $sessionData,
            'completed_at' => now(),
        ]);
    }

    public function reschedule(\DateTime $newTime): bool
    {
        if (!$this->canBeRescheduled()) {
            return false;
        }

        return $this->update([
            'scheduled_at' => $newTime,
            'status' => 'scheduled', // Reset to scheduled if it was confirmed
        ]);
    }

    public function markStudentNotified(): bool
    {
        return $this->update(['student_notified_at' => now()]);
    }

    public function markReminderSent(): bool
    {
        return $this->update(['reminder_sent_at' => now()]);
    }

    // Helper methods
    public function getFormattedScheduledTime(): string
    {
        return $this->scheduled_at->format('M d, Y \a\t g:i A');
    }

    public function getFormattedDuration(): string
    {
        $hours = intval($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;

        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}m";
        }
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            'scheduled' => 'yellow',
            'confirmed' => 'green',
            'cancelled' => 'red',
            'completed' => 'blue',
            default => 'gray'
        };
    }

    public function getTypeLabel(): string
    {
        return match($this->type) {
            'lesson' => 'Lesson',
            'assessment' => 'Assessment',
            'consultation' => 'Consultation',
            'review' => 'Review',
            default => 'Class'
        };
    }

    // Check if student needs reminder (24 hours before class)
    public function needsReminder(): bool
    {
        if ($this->reminder_sent_at || $this->isCancelled() || $this->isCompleted()) {
            return false;
        }

        $reminderTime = $this->scheduled_at->subHours(24);
        return now()->gte($reminderTime);
    }

    // Get enrollment for this class (if tied to a program)
    public function getEnrollment(): ?Enrollment
    {
        if (!$this->program_id) {
            return null;
        }

        return Enrollment::where('user_id', $this->student_id)
                        ->where('program_id', $this->program_id)
                        ->first();
    }

    // Group class methods
    public function isGroupClass(): bool
    {
        return $this->is_group_class;
    }

    public function getStudentCount(): int
    {
        if ($this->is_group_class) {
            return $this->students()->count();
        }
        
        return $this->student_id ? 1 : 0;
    }

    public function hasAvailableSpots(): bool
    {
        if (!$this->is_group_class) {
            return $this->student_id === null;
        }
        
        return $this->getStudentCount() < $this->max_students;
    }

    public function addStudent(User $student): bool
    {
        if (!$this->hasAvailableSpots()) {
            return false;
        }

        if ($this->is_group_class) {
            if (!$this->students()->where('student_id', $student->id)->exists()) {
                $this->students()->attach($student->id);
                return true;
            }
        }
        
        return false;
    }

    public function removeStudent(User $student): bool
    {
        if ($this->is_group_class) {
            return $this->students()->detach($student->id) > 0;
        }
        
        if ($this->student_id === $student->id) {
            $this->update(['student_id' => null]);
            return true;
        }
        
        return false;
    }

    // Check for scheduling conflicts for an admin
    public static function hasConflict($adminId, $scheduledAt, $durationMinutes, $excludeId = null)
    {
        $startTime = $scheduledAt;
        $endTime = $scheduledAt->copy()->addMinutes($durationMinutes);

        $query = static::where('admin_id', $adminId)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->where(function ($q) use ($startTime, $endTime) {
                // Check for overlapping time slots
                $q->where(function ($subQ) use ($startTime, $endTime) {
                    // New class starts during existing class
                    $subQ->where('scheduled_at', '<=', $startTime)
                         ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?', [$startTime]);
                })->orWhere(function ($subQ) use ($startTime, $endTime) {
                    // New class ends during existing class
                    $subQ->where('scheduled_at', '<', $endTime)
                         ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) >= ?', [$endTime]);
                })->orWhere(function ($subQ) use ($startTime, $endTime) {
                    // New class completely contains existing class
                    $subQ->where('scheduled_at', '>=', $startTime)
                         ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) <= ?', [$endTime]);
                });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    // Get conflicting schedules
    public static function getConflicts($adminId, $scheduledAt, $durationMinutes, $excludeId = null)
    {
        $startTime = $scheduledAt;
        $endTime = $scheduledAt->copy()->addMinutes($durationMinutes);

        $query = static::with(['student', 'students'])
            ->where('admin_id', $adminId)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where(function ($subQ) use ($startTime, $endTime) {
                    $subQ->where('scheduled_at', '<=', $startTime)
                         ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?', [$startTime]);
                })->orWhere(function ($subQ) use ($startTime, $endTime) {
                    $subQ->where('scheduled_at', '<', $endTime)
                         ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) >= ?', [$endTime]);
                })->orWhere(function ($subQ) use ($startTime, $endTime) {
                    $subQ->where('scheduled_at', '>=', $startTime)
                         ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) <= ?', [$endTime]);
                });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->get();
    }
}