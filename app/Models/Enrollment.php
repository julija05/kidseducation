<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    /** @use HasFactory<\Database\Factories\EnrollmentFactory> */
    use HasFactory;
    protected $fillable = [
        'user_id',
        'program_id',
        'enrolled_at',
        'completed_at',
        'approval_status',
        'status', // active, completed, paused, cancelled
        'progress', // percentage
        'quiz_points',
        'highest_unlocked_level',
        'rejection_reason',
        'approved_at',
        'approved_by',
        'rejected_at',
        'rejected_by',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
        'progress' => 'float',
        'quiz_points' => 'integer',
        'highest_unlocked_level' => 'integer',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    // Update progress based on completed lessons
    public function updateProgress(): void
    {
        $totalLessons = $this->program->getTotalLessonsCount();

        if ($totalLessons === 0) {
            $this->update(['progress' => 0]);
            return;
        }

        $completedLessons = $this->program->getCompletedLessonsCountForUser($this->user);
        $progressPercentage = ($completedLessons / $totalLessons) * 100;

        $updateData = ['progress' => round($progressPercentage, 2)];

        // Mark as completed if all lessons are done
        if ($progressPercentage >= 100 && !$this->completed_at) {
            $updateData['completed_at'] = now();
            $updateData['status'] = 'completed';
        }

        $this->update($updateData);
    }

    // Check if enrollment is active and approved
    public function isActiveAndApproved(): bool
    {
        return $this->status === 'active' && $this->approval_status === 'approved';
    }

    // Get current level for this enrollment
    public function getCurrentLevel(): int
    {
        return $this->program->getCurrentLevelForUser($this->user);
    }

    // Get next available lesson for the user
    public function getNextLesson(): ?Lesson
    {
        // Get the last lesson the user was working on
        $lastProgress = LessonProgress::where('user_id', $this->user_id)
            ->whereHas('lesson', function ($query) {
                $query->where('program_id', $this->program_id);
            })
            ->orderBy('updated_at', 'desc')
            ->first();

        if ($lastProgress && !$lastProgress->isCompleted()) {
            // Continue with the lesson in progress
            return $lastProgress->lesson;
        }

        // Find the next uncompleted lesson
        $lessons = $this->program->lessons()
            ->active()
            ->ordered()
            ->get();

        foreach ($lessons as $lesson) {
            if (!$lesson->isUnlockedForUser($this->user)) {
                continue;
            }

            $progress = $lesson->userProgress($this->user);
            if (!$progress || !$progress->isCompleted()) {
                return $lesson;
            }
        }

        return null; // All lessons completed
    }
    
    // Add quiz points and check for level unlock
    public function addQuizPoints(int $points): void
    {
        $this->quiz_points += $points;
        $this->checkLevelUnlock();
        $this->save();
    }
    
    // Check if student has earned enough points to unlock next level
    private function checkLevelUnlock(): void
    {
        $requirements = $this->program->level_requirements ?? [];
        
        // If no requirements set, allow all levels
        if (empty($requirements)) {
            return;
        }
        
        // Check each level requirement
        foreach ($requirements as $level => $requiredPoints) {
            $levelNum = intval($level);
            
            // If user has enough points and level is higher than current
            if ($this->quiz_points >= $requiredPoints && $levelNum > $this->highest_unlocked_level) {
                $this->highest_unlocked_level = $levelNum;
            }
        }
    }
    
    // Check if a specific level is unlocked for this user
    public function isLevelUnlocked(int $level): bool
    {
        return $level <= $this->highest_unlocked_level;
    }
    
    // Get points required for next level
    public function getPointsForNextLevel(): ?int
    {
        $requirements = $this->program->level_requirements ?? [];
        
        if (empty($requirements)) {
            return null;
        }
        
        $nextLevel = $this->highest_unlocked_level + 1;
        
        return $requirements[$nextLevel] ?? null;
    }
    
    // Get points needed to unlock next level
    public function getPointsNeededForNextLevel(): ?int
    {
        $nextLevelPoints = $this->getPointsForNextLevel();
        
        if ($nextLevelPoints === null) {
            return null;
        }
        
        return max(0, $nextLevelPoints - $this->quiz_points);
    }
    
    // Recalculate quiz points based on actual quiz performance
    public function recalculateQuizPoints(): void
    {
        $totalPoints = 0;
        
        // Load the user relationship to ensure we have the User model
        $this->load('user');
        
        // Get all quizzes for this program
        $quizzes = \App\Models\Quiz::whereHas('lesson', function ($query) {
            $query->where('program_id', $this->program_id);
        })->get();
        
        foreach ($quizzes as $quiz) {
            // Get the best passing attempt for this user for this quiz
            $bestPassingAttempt = $quiz->userAttempts($this->user)
                ->where('status', 'completed')
                ->where('score', '>=', $quiz->passing_score)
                ->orderBy('earned_points', 'desc')
                ->first();
            
            if ($bestPassingAttempt) {
                $totalPoints += $bestPassingAttempt->earned_points ?? 0;
            }
        }
        
        $this->quiz_points = $totalPoints;
        $this->checkLevelUnlock();
        $this->save();
    }
}
