<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'user_id',
        'started_at',
        'completed_at',
        'score',
        'total_points',
        'earned_points',
        'total_questions',
        'correct_answers',
        'time_taken',
        'status',
        'answers',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'score' => 'decimal:2',
        'answers' => 'array',
        'metadata' => 'array',
        'total_points' => 'integer',
        'earned_points' => 'integer',
        'total_questions' => 'integer',
        'correct_answers' => 'integer',
        'time_taken' => 'integer',
    ];

    // Relationships
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeByUser($query, User $user)
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeByQuiz($query, Quiz $quiz)
    {
        return $query->where('quiz_id', $quiz->id);
    }

    // Accessors
    public function getStatusDisplayAttribute(): string
    {
        return match ($this->status) {
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'abandoned' => 'Abandoned',
            'expired' => 'Expired',
            default => 'Unknown'
        };
    }

    public function getFormattedTimeTakenAttribute(): ?string
    {
        if (!$this->time_taken) return null;

        if ($this->time_taken < 60) {
            return $this->time_taken . ' second' . ($this->time_taken !== 1 ? 's' : '');
        }

        $minutes = floor($this->time_taken / 60);
        $seconds = $this->time_taken % 60;

        if ($seconds === 0) {
            return $minutes . ' minute' . ($minutes !== 1 ? 's' : '');
        }

        return $minutes . 'm ' . $seconds . 's';
    }

    public function getScorePercentageAttribute(): float
    {
        return $this->score ?? 0;
    }

    public function getPassedAttribute(): bool
    {
        return $this->status === 'completed' && 
               $this->score >= $this->quiz->passing_score;
    }

    // Helper methods
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isExpired(): bool
    {
        if ($this->status !== 'in_progress') return false;
        
        $timeLimit = $this->quiz->time_limit;
        if (!$timeLimit) return false;

        return $this->started_at->addSeconds($timeLimit)->isPast();
    }

    public function getRemainingTime(): ?int
    {
        if ($this->status !== 'in_progress') return null;
        
        $timeLimit = $this->quiz->time_limit;
        if (!$timeLimit) return null;

        $elapsed = now()->diffInSeconds($this->started_at);
        $remaining = $timeLimit - $elapsed;

        return max(0, $remaining);
    }

    public function calculateScore(): void
    {
        if (!$this->answers) {
            $this->update([
                'score' => 0,
                'earned_points' => 0,
                'correct_answers' => 0,
            ]);
            return;
        }

        $totalPoints = 0;
        $earnedPoints = 0;
        $correctAnswers = 0;

        // Handle mental arithmetic quizzes - check if we have temp answer first
        if ($this->quiz->type === 'mental_arithmetic' && isset($this->answers['temp_mental_arithmetic'])) {
            // For mental arithmetic quizzes with temporary questions, use fixed scoring
            $totalPoints = 100; // Fixed total points for mental arithmetic
            
            $userAnswer = $this->answers['temp_mental_arithmetic']['answer'] ?? '';
            
            // Try to parse the flash card results
            try {
                $answerData = json_decode($userAnswer, true);
                if ($answerData && isset($answerData['type']) && $answerData['type'] === 'flash_card_sessions') {
                    $percentage = $answerData['percentage'] ?? 0;
                    $earnedPoints = ($percentage / 100) * $totalPoints;
                    $correctAnswers = $percentage >= 50 ? 1 : 0;
                }
            } catch (Exception $e) {
                // Invalid answer format
                $earnedPoints = 0;
                $correctAnswers = 0;
            }
        } else {
            // Standard scoring for regular questions
            foreach ($this->quiz->questions as $question) {
                $totalPoints += $question->points;
                
                $answerKey = (string) $question->id;
                if (isset($this->answers[$answerKey])) {
                    $userAnswer = $this->answers[$answerKey]['answer'] ?? '';
                    
                    if ($question->isAnswerCorrect($userAnswer)) {
                        $earnedPoints += $question->points;
                        $correctAnswers++;
                    } else {
                        // Add partial credit for mental arithmetic
                        $partialCredit = $question->getPartialCredit($userAnswer);
                        $earnedPoints += $question->points * $partialCredit;
                    }
                }
            }
        }

        $scorePercentage = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;


        $this->update([
            'total_points' => $totalPoints,
            'earned_points' => $earnedPoints,
            'score' => $scorePercentage,
            'correct_answers' => $correctAnswers,
            'total_questions' => $this->quiz->type === 'mental_arithmetic' && isset($this->answers['temp_mental_arithmetic']) ? 1 : $this->quiz->questions->count(),
        ]);
    }

    public function complete(): void
    {
        $this->calculateScore();
        
        $timeTaken = $this->started_at ? 
            now()->diffInSeconds($this->started_at) : null;

        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'time_taken' => $timeTaken,
        ]);
    }

    public function abandon(): void
    {
        $this->update([
            'status' => 'abandoned',
            'completed_at' => now(),
        ]);
    }

    public function expire(): void
    {
        $this->calculateScore();
        
        $this->update([
            'status' => 'expired',
            'completed_at' => now(),
            'time_taken' => $this->quiz->time_limit,
        ]);
    }

    // Answer management
    public function recordAnswer($questionId, string $answer, ?int $timeTaken = null): void
    {
        $answers = $this->answers ?? [];
        
        $answers[(string) $questionId] = [
            'answer' => $answer,
            'answered_at' => now()->toISOString(),
            'time_taken' => $timeTaken,
        ];

        $this->update(['answers' => $answers]);
    }

    public function getAnswerForQuestion($questionId): ?array
    {
        $answers = $this->answers ?? [];
        return $answers[(string) $questionId] ?? null;
    }

    public function hasAnsweredQuestion($questionId): bool
    {
        return $this->getAnswerForQuestion($questionId) !== null;
    }

    // Formatting for frontend
    public function formatForStudent(): array
    {
        return [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'started_at' => $this->started_at->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'status' => $this->status,
            'status_display' => $this->status_display,
            'score' => $this->score,
            'score_percentage' => $this->score_percentage,
            'total_points' => $this->total_points,
            'earned_points' => $this->earned_points,
            'total_questions' => $this->total_questions,
            'correct_answers' => $this->correct_answers,
            'time_taken' => $this->time_taken,
            'formatted_time_taken' => $this->formatted_time_taken,
            'passed' => $this->passed,
            'remaining_time' => $this->getRemainingTime(),
            'is_expired' => $this->isExpired(),
        ];
    }

    public function formatForAdmin(): array
    {
        return [
            'id' => $this->id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'quiz' => [
                'id' => $this->quiz->id,
                'title' => $this->quiz->title,
            ],
            'started_at' => $this->started_at->format('M d, Y H:i'),
            'completed_at' => $this->completed_at?->format('M d, Y H:i'),
            'status' => $this->status,
            'status_display' => $this->status_display,
            'score' => $this->score,
            'total_points' => $this->total_points,
            'earned_points' => $this->earned_points,
            'total_questions' => $this->total_questions,
            'correct_answers' => $this->correct_answers,
            'time_taken' => $this->time_taken,
            'formatted_time_taken' => $this->formatted_time_taken,
            'passed' => $this->passed,
            'answers' => $this->answers,
            'metadata' => $this->metadata,
        ];
    }
}