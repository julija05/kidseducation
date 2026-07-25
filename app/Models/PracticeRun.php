<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PracticeRun - the stored summary of one completed Mental Accelerator run.
 *
 * Each row is the outcome of a single practice session (settings + how many
 * rounds the student got right). Runs power the practice achievement badges.
 */
class PracticeRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'program_id',
        'operation',
        'min_digits',
        'max_digits',
        'display_time',
        'numbers_per_round',
        'total_rounds',
        'correct_rounds',
    ];

    protected $casts = [
        'min_digits' => 'integer',
        'max_digits' => 'integer',
        'display_time' => 'float',
        'numbers_per_round' => 'integer',
        'total_rounds' => 'integer',
        'correct_rounds' => 'integer',
    ];

    /**
     * The student who played the run.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The program the student was practicing under (may be null).
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Whether every round in the run was answered correctly.
     */
    public function isPerfect(): bool
    {
        return $this->total_rounds > 0 && $this->correct_rounds === $this->total_rounds;
    }
}
