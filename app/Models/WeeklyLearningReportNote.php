<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeeklyLearningReportNote extends Model
{
    protected $fillable = ['weekly_learning_report_id', 'child_user_id', 'note'];

    public function report(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningReport::class, 'weekly_learning_report_id');
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(User::class, 'child_user_id');
    }
}
