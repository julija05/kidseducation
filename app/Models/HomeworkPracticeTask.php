<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HomeworkPracticeTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'homework_assignment_id',
        'prompt',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function homeworkAssignment(): BelongsTo
    {
        return $this->belongsTo(HomeworkAssignment::class);
    }

    public function completions(): HasMany
    {
        return $this->hasMany(HomeworkPracticeTaskCompletion::class);
    }
}
