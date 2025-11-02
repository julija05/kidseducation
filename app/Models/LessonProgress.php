<?php

namespace App\Models;

use App\Constants\LessonProgressStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'status',
        'progress_percentage',
        'score',
        'started_at',
        'completed_at',
        'session_data',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'progress_percentage' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'session_data' => 'array',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    // Status check methods
    public function isCompleted(): bool
    {
        return $this->status === LessonProgressStatus::COMPLETED;
    }

    public function isInProgress(): bool
    {
        return $this->status === LessonProgressStatus::IN_PROGRESS;
    }

    public function isNotStarted(): bool
    {
        return $this->status === LessonProgressStatus::NOT_STARTED;
    }

    // Progress actions
    public function markAsStarted(): void
    {
        $this->update([
            'status' => LessonProgressStatus::IN_PROGRESS,
            'started_at' => $this->started_at ?? now(),
            'progress_percentage' => max($this->progress_percentage, 1),
        ]);
    }

    public function markAsCompleted(?float $score = null): void
    {
        $this->update([
            'status' => LessonProgressStatus::COMPLETED,
            'completed_at' => now(),
            'progress_percentage' => 100,
            'score' => $score,
        ]);
    }

    public function updateProgress(int $percentage): void
    {
        $this->update([
            'progress_percentage' => min(max($percentage, 0), 100),
            'status' => $percentage >= 100 ? LessonProgressStatus::COMPLETED : LessonProgressStatus::IN_PROGRESS,
            'started_at' => $this->started_at ?? now(),
            'completed_at' => $percentage >= 100 ? now() : null,
        ]);
    }
}
