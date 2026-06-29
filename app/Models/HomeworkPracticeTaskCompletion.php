<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomeworkPracticeTaskCompletion extends Model
{
    use HasFactory;

    protected $fillable = [
        'homework_practice_task_id',
        'student_id',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function practiceTask(): BelongsTo
    {
        return $this->belongsTo(HomeworkPracticeTask::class, 'homework_practice_task_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
