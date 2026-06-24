<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomeworkAssignmentStatus extends Model
{
    use HasFactory;

    public const STATUS_NOT_STARTED = 'not_started';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_NEEDS_HELP = 'needs_help';

    public const STATUSES = [
        self::STATUS_NOT_STARTED,
        self::STATUS_COMPLETED,
        self::STATUS_NEEDS_HELP,
    ];

    protected $fillable = [
        'homework_assignment_id',
        'student_id',
        'status',
        'completed_at',
        'help_requested_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'help_requested_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => self::STATUS_NOT_STARTED,
    ];

    public function homeworkAssignment(): BelongsTo
    {
        return $this->belongsTo(HomeworkAssignment::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function needsHelp(): bool
    {
        return $this->status === self::STATUS_NEEDS_HELP;
    }
}
