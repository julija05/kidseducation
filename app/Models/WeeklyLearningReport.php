<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WeeklyLearningReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_user_id',
        'learning_group_id',
        'mentor_id',
        'class_schedule_id',
        'program_id',
        'week_number',
        'week_start_date',
        'week_end_date',
        'group_name',
        'what_we_learned',
        'what_to_practice',
        'next_focus',
        'individual_child_note',
        'published_at',
    ];

    protected $casts = [
        'week_start_date' => 'date',
        'week_end_date' => 'date',
        'published_at' => 'datetime',
    ];

    public function child(): BelongsTo
    {
        return $this->belongsTo(User::class, 'child_user_id');
    }

    public function learningGroup(): BelongsTo
    {
        return $this->belongsTo(LearningGroup::class);
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function childNotes(): HasMany
    {
        return $this->hasMany(WeeklyLearningReportNote::class);
    }

    public function classSchedule(): BelongsTo
    {
        return $this->belongsTo(ClassSchedule::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
