<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HomeworkAssignment extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_ASSIGNED = 'assigned';

    public const STATUS_ARCHIVED = 'archived';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_ASSIGNED,
        self::STATUS_ARCHIVED,
    ];

    protected $fillable = [
        'title',
        'instructions',
        'learning_group_id',
        'lesson_id',
        'live_session_id',
        'due_date',
        'estimated_practice_minutes',
        'status',
        'created_by',
    ];

    protected $casts = [
        'due_date' => 'date',
        'estimated_practice_minutes' => 'integer',
    ];

    protected $attributes = [
        'status' => self::STATUS_ASSIGNED,
        'estimated_practice_minutes' => 15,
    ];

    public function learningGroup(): BelongsTo
    {
        return $this->belongsTo(LearningGroup::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function liveSession(): BelongsTo
    {
        return $this->belongsTo(ClassSchedule::class, 'live_session_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function studentStatuses(): HasMany
    {
        return $this->hasMany(HomeworkAssignmentStatus::class);
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ASSIGNED);
    }
}
