<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    /** @use HasFactory<\Database\Factories\EnrollmentFactory> */
    use HasFactory;
    protected $fillable = [
        'user_id',
        'program_id',
        'enrolled_at',
        'completed_at',
        'approval_status',
        'status', // active, completed, paused, cancelled
        'progress', // percentage
        'rejection_reason',
        'approved_at',
        'approved_by',
        'rejected_at',
        'rejected_by',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
        'progress' => 'float',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',

    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    // Update progress based on completed lessons
    public function updateProgress(): void
    {
        $totalLessons = $this->program->getTotalLessonsCount();

        if ($totalLessons === 0) {
            $this->update(['progress' => 0]);
            return;
        }

        $completedLessons = $this->program->getCompletedLessonsCountForUser($this->user);
        $progressPercentage = ($completedLessons / $totalLessons) * 100;

        $updateData = ['progress' => round($progressPercentage, 2)];

        // Mark as completed if all lessons are done
        if ($progressPercentage >= 100 && !$this->completed_at) {
            $updateData['completed_at'] = now();
            $updateData['status'] = 'completed';
        }

        $this->update($updateData);
    }

    // Check if enrollment is active and approved
    public function isActiveAndApproved(): bool
    {
        return $this->status === 'active' && $this->approval_status === 'approved';
    }

    // Get current level for this enrollment
    public function getCurrentLevel(): int
    {
        return $this->program->getCurrentLevelForUser($this->user);
    }

    // Get next available lesson for the user
    public function getNextLesson(): ?Lesson
    {
        // Get the last lesson the user was working on
        $lastProgress = LessonProgress::where('user_id', $this->user_id)
            ->whereHas('lesson', function ($query) {
                $query->where('program_id', $this->program_id);
            })
            ->orderBy('updated_at', 'desc')
            ->first();

        if ($lastProgress && !$lastProgress->isCompleted()) {
            // Continue with the lesson in progress
            return $lastProgress->lesson;
        }

        // Find the next uncompleted lesson
        $lessons = $this->program->lessons()
            ->active()
            ->ordered()
            ->get();

        foreach ($lessons as $lesson) {
            if (!$lesson->isUnlockedForUser($this->user)) {
                continue;
            }

            $progress = $lesson->userProgress($this->user);
            if (!$progress || !$progress->isCompleted()) {
                return $lesson;
            }
        }

        return null; // All lessons completed
    }
}
