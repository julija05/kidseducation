<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'type',
        'question_text',
        'question_data',
        'answer_options',
        'correct_answer',
        'explanation',
        'points',
        'time_limit',
        'order',
        'settings',
    ];

    protected $casts = [
        'question_data' => 'array',
        'answer_options' => 'array',
        'settings' => 'array',
        'points' => 'decimal:2',
        'time_limit' => 'integer',
        'order' => 'integer',
    ];

    // Relationships
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    // Scopes
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Accessors
    public function getTypeDisplayAttribute(): string
    {
        return match ($this->type) {
            'mental_arithmetic' => 'Mental Arithmetic',
            'multiple_choice' => 'Multiple Choice',
            'text_answer' => 'Text Answer',
            'true_false' => 'True/False',
            default => 'Question'
        };
    }

    public function getFormattedTimeLimitAttribute(): ?string
    {
        $timeLimit = $this->time_limit ?? $this->quiz->question_time_limit;

        if (! $timeLimit) {
            return null;
        }

        return $timeLimit.' second'.($timeLimit !== 1 ? 's' : '');
    }

    // Question validation methods
    public function isAnswerCorrect(string $userAnswer): bool
    {
        // Handle flash card sessions
        if ($this->correct_answer === 'flash_card_sessions') {
            try {
                $answerData = json_decode($userAnswer, true);
                if ($answerData && isset($answerData['type']) && $answerData['type'] === 'flash_card_sessions') {
                    // For flash cards, consider it correct if they got > 50% of sessions right
                    return ($answerData['percentage'] ?? 0) >= 50;
                }
            } catch (Exception $e) {
                return false;
            }
        }

        // Normalize answers for comparison
        $userAnswer = trim(strtolower($userAnswer));
        $correctAnswer = trim(strtolower($this->correct_answer));

        switch ($this->type) {
            case 'mental_arithmetic':
            case 'text_answer':
                return $userAnswer === $correctAnswer;

            case 'multiple_choice':
                // For multiple choice, answer could be the option key or value
                $options = $this->answer_options ?? [];
                foreach ($options as $key => $value) {
                    if (strtolower($key) === $userAnswer || strtolower($value) === $userAnswer) {
                        return strtolower($key) === $correctAnswer || strtolower($value) === $correctAnswer;
                    }
                }

                return false;

            case 'true_false':
                $userBool = in_array($userAnswer, ['true', '1', 'yes', 'correct']);
                $correctBool = in_array($correctAnswer, ['true', '1', 'yes', 'correct']);

                return $userBool === $correctBool;

            default:
                return $userAnswer === $correctAnswer;
        }
    }

    public function getPartialCredit(string $userAnswer): float
    {
        // Handle flash card sessions partial credit first (before checking isAnswerCorrect)
        if ($this->correct_answer === 'flash_card_sessions') {
            $answerData = json_decode($userAnswer, true);
            if ($answerData && isset($answerData['type']) && $answerData['type'] === 'flash_card_sessions') {
                // Give partial credit based on percentage correct
                return ($answerData['percentage'] ?? 0) / 100;
            }

            // Return 0.0 for invalid JSON or incorrect format
            return 0.0;
        }

        if ($this->isAnswerCorrect($userAnswer)) {
            return 1.0; // Full credit
        }

        // For mental arithmetic, give partial credit for close answers
        if ($this->type === 'mental_arithmetic') {
            $userNum = (float) $userAnswer;
            $correctNum = (float) $this->correct_answer;

            if ($userNum == $correctNum) {
                return 1.0;
            }

            $difference = abs($userNum - $correctNum);
            $tolerance = abs($correctNum * 0.1); // 10% tolerance

            if ($difference <= $tolerance) {
                return 0.5; // Half credit for close answers
            }
        }

        return 0.0; // No credit
    }

    // Mental arithmetic specific methods
    public function getMentalArithmeticDisplay(): array
    {
        $questionData = $this->question_data ?? [];

        return [
            'numbers' => $questionData['numbers'] ?? [],
            'sequence' => $questionData['display_sequence'] ?? '',
            'operation_type' => $questionData['operation_type'] ?? 'mixed',
        ];
    }

    // Multiple choice methods
    public function getShuffledOptions(): array
    {
        $options = $this->answer_options ?? [];

        if ($this->quiz->shuffle_answers) {
            $keys = array_keys($options);
            shuffle($keys);
            $shuffled = [];
            foreach ($keys as $key) {
                $shuffled[$key] = $options[$key];
            }

            return $shuffled;
        }

        return $options;
    }

    // Question formatting for frontend
    public function formatForFrontend(): array
    {
        $baseData = [
            'id' => $this->id,
            'type' => $this->type,
            'type_display' => $this->type_display,
            'question_text' => $this->question_text,
            'question_data' => $this->question_data,
            'points' => $this->points,
            'time_limit' => $this->time_limit ?? $this->quiz->question_time_limit,
            'formatted_time_limit' => $this->formatted_time_limit,
            'order' => $this->order,
        ];

        switch ($this->type) {
            case 'mental_arithmetic':
                $baseData['mental_arithmetic'] = $this->getMentalArithmeticDisplay();
                break;

            case 'multiple_choice':
                $baseData['answer_options'] = $this->getShuffledOptions();
                break;

            case 'true_false':
                $baseData['answer_options'] = [
                    'true' => 'True',
                    'false' => 'False',
                ];
                break;

            case 'text_answer':
                $baseData['placeholder'] = $this->settings['placeholder'] ?? 'Enter your answer';
                break;
        }

        return $baseData;
    }

    // Admin display methods
    public function formatForAdmin(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'type_display' => $this->type_display,
            'question_text' => $this->question_text,
            'question_data' => $this->question_data,
            'answer_options' => $this->answer_options,
            'correct_answer' => $this->correct_answer,
            'explanation' => $this->explanation,
            'points' => $this->points,
            'time_limit' => $this->time_limit,
            'order' => $this->order,
            'settings' => $this->settings,
        ];
    }
}
