<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentorNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'mentor_id',
        'student_id',
        'learning_group_id',
        'lesson_id',
        'live_session_id',
        'note',
        'visible_to_parent',
    ];

    protected $casts = [
        'visible_to_parent' => 'boolean',
    ];

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

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
}
