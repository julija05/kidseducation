<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'type',
        'time_limit',
        'question_time_limit',
        'max_attempts',
        'passing_score',
        'show_results_immediately',
        'shuffle_questions',
        'shuffle_answers',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
        'passing_score' => 'decimal:2',
        'show_results_immediately' => 'boolean',
        'shuffle_questions' => 'boolean',
        'shuffle_answers' => 'boolean',
        'is_active' => 'boolean',
        'time_limit' => 'integer',
        'question_time_limit' => 'integer',
        'max_attempts' => 'integer',
    ];

    // Relationships
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeWithQuestions($query)
    {
        return $query->with(['questions' => function ($query) {
            $query->orderBy('order');
        }]);
    }

    // Accessors and helper methods
    public function getTypeDisplayAttribute(): string
    {
        return match ($this->type) {
            'mental_arithmetic' => 'Mental Arithmetic',
            'multiple_choice' => 'Multiple Choice',
            'text_answer' => 'Text Answer',
            'true_false' => 'True/False',
            'mixed' => 'Mixed Questions',
            default => 'Quiz'
        };
    }

    public function getFormattedTimeLimitAttribute(): ?string
    {
        if (!$this->time_limit) return null;

        if ($this->time_limit < 60) {
            return $this->time_limit . ' seconds';
        }

        $minutes = floor($this->time_limit / 60);
        $seconds = $this->time_limit % 60;

        // Handle hours
        if ($minutes >= 60) {
            $hours = (int) floor($minutes / 60);
            $remainingMinutes = $minutes % 60;
            
            if ($remainingMinutes === 0 && $seconds === 0) {
                return $hours . ' hour' . ($hours !== 1 ? 's' : '');
            } elseif ($seconds === 0) {
                return $hours . 'h ' . $remainingMinutes . 'm';
            } else {
                return $hours . 'h ' . $remainingMinutes . 'm ' . $seconds . 's';
            }
        }

        return $seconds === 0
            ? $minutes . ' minute' . ($minutes !== 1 ? 's' : '')
            : $minutes . 'm ' . $seconds . 's';
    }

    public function getFormattedQuestionTimeLimitAttribute(): ?string
    {
        if (!$this->question_time_limit) return null;

        return $this->question_time_limit . ' second' . ($this->question_time_limit !== 1 ? 's' : '') . ' per question';
    }

    public function getTotalPointsAttribute(): float
    {
        // For mental arithmetic quizzes without database questions, calculate from settings
        if ($this->type === 'mental_arithmetic' && $this->questions()->count() === 0) {
            $sessionCount = $this->settings['session_count'] ?? 3;
            $pointsPerSession = $this->settings['points_per_session'] ?? 10;
            
            // Auto-update quiz settings if points_per_session is missing (for existing quizzes)
            if (!isset($this->settings['points_per_session'])) {
                $this->updateQuietly([
                    'settings' => array_merge($this->settings ?? [], ['points_per_session' => 10])
                ]);
            }
            
            return $sessionCount * $pointsPerSession;
        }
        
        return $this->questions()->sum('points');
    }

    public function getTotalQuestionsAttribute(): int
    {
        // For mental arithmetic quizzes without database questions, return 1 (the flash card session)
        if ($this->type === 'mental_arithmetic' && $this->questions()->count() === 0) {
            return 1;
        }
        
        return $this->questions()->count();
    }

    // Mental arithmetic specific methods
    public function generateMentalArithmeticQuestion(int $difficulty = 1): array
    {
        $settings = $this->settings ?? [];
        $operations = $settings['operations'] ?? ['addition', 'subtraction'];
        $numberRange = $settings['number_range'] ?? ['min' => 1, 'max' => 10];
        $sequenceLength = $settings['sequence_length'] ?? 4;

        $numbers = [];
        $result = 0;

        // Generate first number
        $numbers[] = rand($numberRange['min'], $numberRange['max']);
        $result = $numbers[0];

        // Generate remaining numbers with operations
        for ($i = 1; $i < $sequenceLength; $i++) {
            $operation = $operations[array_rand($operations)];
            $number = rand($numberRange['min'], $numberRange['max']);

            if ($operation === 'subtraction') {
                $number = -$number;
            } elseif ($operation === 'multiplication' && in_array('multiplication', $operations)) {
                // For multiplication, use smaller numbers
                $number = rand(2, 5);
                $result *= $number;
                $numbers[] = "×{$number}";
                continue;
            } elseif ($operation === 'division' && in_array('division', $operations)) {
                // For division, ensure clean division
                $divisors = [2, 3, 4, 5];
                $divisor = $divisors[array_rand($divisors)];
                if ($result % $divisor === 0) {
                    $result /= $divisor;
                    $numbers[] = "÷{$divisor}";
                    continue;
                }
            }

            $result += $number;
            $numbers[] = $number;
        }

        return [
            'numbers' => $numbers,
            'correct_answer' => (string) $result,
            'display_sequence' => implode(', ', $numbers),
        ];
    }

    public function generateMentalArithmeticSessions(int $sessionCount = 3): array
    {
        $settings = $this->settings ?? [];
        $numberRange = $settings['number_range'] ?? ['min' => 1, 'max' => 10];
        $numbersPerSession = $settings['numbers_per_session'] ?? 5;
        $displayTime = $settings['display_time'] ?? 5;
        $allowNegative = $settings['allow_negative'] ?? true;
        $operations = $settings['operations'] ?? ['addition', 'subtraction'];
        
        $sessions = [];
        
        for ($s = 0; $s < $sessionCount; $s++) {
            $numbers = [];
            $operationsUsed = [];
            $result = 0;
            
            // Generate first number (always positive)
            $firstNumber = rand($numberRange['min'], $numberRange['max']);
            $numbers[] = $firstNumber;
            $operationsUsed[] = 'start';
            $result = $firstNumber;
            
            // Generate remaining numbers with operations based on settings
            for ($i = 1; $i < $numbersPerSession; $i++) {
                $number = rand($numberRange['min'], $numberRange['max']);
                $operation = $operations[array_rand($operations)];
                
                switch ($operation) {
                    case 'addition':
                        $numbers[] = $number;
                        $operationsUsed[] = 'addition';
                        $result += $number;
                        break;
                        
                    case 'subtraction':
                        if ($allowNegative || ($result - $number) >= 0) {
                            // Only subtract if negative results are allowed OR if result won't go negative
                            $numbers[] = -$number;
                            $operationsUsed[] = 'subtraction';
                            $result -= $number;
                        } else {
                            // If subtraction would make result negative and negative not allowed, use addition
                            $numbers[] = $number;
                            $operationsUsed[] = 'addition';
                            $result += $number;
                        }
                        break;
                        
                    case 'multiplication':
                        // Use smaller multipliers for mental math
                        $multiplier = rand(2, 9);
                        $numbers[] = ['operation' => 'multiply', 'value' => $multiplier];
                        $operationsUsed[] = 'multiplication';
                        $result *= $multiplier;
                        break;
                        
                    case 'division':
                        // Find divisors that result in whole numbers
                        $possibleDivisors = [];
                        for ($d = 2; $d <= 9; $d++) {
                            if ($result % $d === 0) {
                                $possibleDivisors[] = $d;
                            }
                        }
                        
                        if (!empty($possibleDivisors)) {
                            $divisor = $possibleDivisors[array_rand($possibleDivisors)];
                            $numbers[] = ['operation' => 'divide', 'value' => $divisor];
                            $operationsUsed[] = 'division';
                            $result /= $divisor;
                        } else {
                            // Fall back to addition if no clean division possible
                            $numbers[] = $number;
                            $operationsUsed[] = 'addition';
                            $result += $number;
                        }
                        break;
                        
                    default:
                        // Default to addition
                        $numbers[] = $number;
                        $operationsUsed[] = 'addition';
                        $result += $number;
                        break;
                }
            }
            
            $sessions[] = [
                'session_id' => $s + 1,
                'numbers' => $numbers,
                'operations_used' => $operationsUsed,
                'correct_answer' => round($result, 2), // Round to handle division decimals
                'display_time' => $displayTime,
                'total_time' => $numbersPerSession * $displayTime,
                'operations_sequence' => $this->buildOperationsSequence($numbers),
                'settings_used' => [
                    'operations' => $operations,
                    'number_range' => $numberRange,
                    'allow_negative' => $allowNegative,
                ],
            ];
        }
        
        return $sessions;
    }
    
    private function buildOperationsSequence(array $numbers): string
    {
        $sequence = [];
        
        for ($i = 0; $i < count($numbers); $i++) {
            if ($i === 0) {
                // First number is always just the number
                if (is_array($numbers[$i])) {
                    $sequence[] = (string) $numbers[$i]['value'];
                } else {
                    $sequence[] = (string) $numbers[$i];
                }
            } else {
                // Subsequent numbers show the operation
                if (is_array($numbers[$i])) {
                    // Handle multiplication/division operations
                    if ($numbers[$i]['operation'] === 'multiply') {
                        $sequence[] = "×{$numbers[$i]['value']}";
                    } elseif ($numbers[$i]['operation'] === 'divide') {
                        $sequence[] = "÷{$numbers[$i]['value']}";
                    }
                } else {
                    // Handle addition/subtraction
                    $sequence[] = $numbers[$i] > 0 ? "+{$numbers[$i]}" : (string) $numbers[$i];
                }
            }
        }
        
        return implode(' ', $sequence);
    }

    // User-specific methods
    public function userAttempts(User $user): HasMany
    {
        return $this->attempts()->where('user_id', $user->id);
    }

    public function getUserAttemptsCount(User $user): int
    {
        return $this->userAttempts($user)->count();
    }

    public function getUserBestScore(User $user): ?float
    {
        return $this->userAttempts($user)
            ->where('status', 'completed')
            ->max('score');
    }

    public function canUserTakeQuiz(User $user): bool
    {
        if (!$this->is_active) return false;

        // If user has already passed the quiz, they cannot take it again
        if ($this->hasUserPassed($user)) return false;

        $attemptsCount = $this->getUserAttemptsCount($user);
        return $attemptsCount < $this->max_attempts;
    }

    public function hasUserPassed(User $user): bool
    {
        $bestScore = $this->getUserBestScore($user);
        return $bestScore !== null && $bestScore >= $this->passing_score;
    }

    // Quiz statistics
    public function getAverageScore(): ?float
    {
        return $this->attempts()
            ->where('status', 'completed')
            ->avg('score');
    }

    public function getCompletionRate(): float
    {
        $totalAttempts = $this->attempts()->count();
        if ($totalAttempts === 0) return 0;

        $completedAttempts = $this->attempts()
            ->where('status', 'completed')
            ->count();

        return ($completedAttempts / $totalAttempts) * 100;
    }

    public function getPassRate(): float
    {
        $completedAttempts = $this->attempts()
            ->where('status', 'completed')
            ->count();

        if ($completedAttempts === 0) return 0;

        $passedAttempts = $this->attempts()
            ->where('status', 'completed')
            ->where('score', '>=', $this->passing_score)
            ->count();

        return ($passedAttempts / $completedAttempts) * 100;
    }
}