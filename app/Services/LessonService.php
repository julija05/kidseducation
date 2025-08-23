<?php

namespace App\Services;

use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;

class LessonService
{
    public function __construct(
        private EnrollmentService $enrollmentService
    ) {}

    /**
     * Check if a lesson is unlocked for a user
     */
    public function isLessonUnlockedForUser(Lesson $lesson, User $user): bool
    {
        // Level 1 lessons are always unlocked
        if ($lesson->level === 1) {
            return true;
        }

        // Check if user has completed all lessons in the previous level
        $previousLevel = $lesson->level - 1;
        $previousLevelLessons = $lesson->program->lessons()
            ->byLevel($previousLevel)
            ->active()
            ->pluck('id');

        if ($previousLevelLessons->isEmpty()) {
            return true;
        }

        // Count completed lessons in previous level
        $completedCount = LessonProgress::where('user_id', $user->id)
            ->whereIn('lesson_id', $previousLevelLessons)
            ->where('status', 'completed')
            ->count();

        return $completedCount === $previousLevelLessons->count();
    }

    /**
     * Get the next lesson for a user
     */
    public function getNextLessonForUser(Lesson $lesson, User $user): ?Lesson
    {
        // First, try to find the next lesson in the same level
        $nextInLevel = $lesson->program->lessons()
            ->byLevel($lesson->level)
            ->active()
            ->where('order_in_level', '>', $lesson->order_in_level)
            ->ordered()
            ->first();

        if ($nextInLevel && $this->isLessonUnlockedForUser($nextInLevel, $user)) {
            return $nextInLevel;
        }

        // If no more lessons in current level, try next level
        $nextLevel = $lesson->program->lessons()
            ->byLevel($lesson->level + 1)
            ->active()
            ->ordered()
            ->first();

        if ($nextLevel && $this->isLessonUnlockedForUser($nextLevel, $user)) {
            return $nextLevel;
        }

        return null;
    }

    /**
     * Get the previous lesson for a user
     */
    public function getPreviousLessonForUser(Lesson $lesson, User $user): ?Lesson
    {
        // First, try to find the previous lesson in the same level
        $prevInLevel = $lesson->program->lessons()
            ->byLevel($lesson->level)
            ->active()
            ->where('order_in_level', '<', $lesson->order_in_level)
            ->orderBy('order_in_level', 'desc')
            ->first();

        if ($prevInLevel) {
            return $prevInLevel;
        }

        // If no previous lesson in current level, try previous level
        if ($lesson->level > 1) {
            return $lesson->program->lessons()
                ->byLevel($lesson->level - 1)
                ->active()
                ->orderBy('order_in_level', 'desc')
                ->first();
        }

        return null;
    }

    /**
     * Start a lesson for a user
     */
    public function startLessonForUser(Lesson $lesson, User $user): LessonProgress
    {
        $progress = LessonProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'status' => 'not_started',
                'progress_percentage' => 0,
            ]
        );

        if ($progress->isNotStarted()) {
            $progress->markAsStarted();
        }

        return $progress;
    }

    /**
     * Complete a lesson for a user
     */
    public function completeLessonForUser(Lesson $lesson, User $user, ?float $score = null): LessonProgress
    {
        $progress = LessonProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'status' => 'not_started',
                'progress_percentage' => 0,
            ]
        );

        $progress->markAsCompleted($score);

        // Update enrollment progress
        $enrollment = $user->enrollments()
            ->where('program_id', $lesson->program_id)
            ->first();

        if ($enrollment) {
            $this->enrollmentService->updateEnrollmentProgress($enrollment);
        }

        return $progress;
    }

    /**
     * Update lesson progress for a user
     */
    public function updateLessonProgress(Lesson $lesson, User $user, int $percentage, ?array $sessionData = null): LessonProgress
    {
        $progress = LessonProgress::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->firstOrFail();

        $progress->updateProgress($percentage);

        if ($sessionData) {
            $progress->update([
                'session_data' => array_merge($progress->session_data ?? [], $sessionData),
            ]);
        }

        return $progress;
    }

    /**
     * Check if a level is completed by a user
     */
    public function isLevelCompletedByUser(Lesson $lesson, User $user): bool
    {
        $levelLessons = $lesson->program->lessons()
            ->byLevel($lesson->level)
            ->active()
            ->get();

        foreach ($levelLessons as $levelLesson) {
            if (! $levelLesson->hasUserCompleted($user)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Format lesson data for frontend
     */
    public function formatLessonForFrontend(Lesson $lesson): array
    {
        return [
            'id' => $lesson->id,
            'title' => $lesson->title,
            'description' => $lesson->description,
            'level' => $lesson->level,
            'order_in_level' => $lesson->order_in_level,
            'content_type' => $lesson->content_type,
            'content_type_display' => $lesson->content_type_display,
            'duration_minutes' => $lesson->duration_minutes,
            'formatted_duration' => $lesson->formatted_duration,
            'resources' => $lesson->resources->map(function ($resource) {
                return app(ResourceService::class)->formatResourceForFrontend($resource);
            }),
        ];
    }

    /**
     * Verify user has access to lesson
     */
    public function verifyUserCanAccessLesson(Lesson $lesson, User $user): bool
    {
        // Check if user is enrolled and approved
        // Allow access for both active and completed enrollments
        $enrollment = $user->enrollments()
            ->where('program_id', $lesson->program_id)
            ->whereIn('status', ['active', 'completed'])
            ->where('approval_status', 'approved')
            ->first();

        if (! $enrollment) {
            return false;
        }

        // Check if lesson is unlocked
        return $this->isLessonUnlockedForUser($lesson, $user);
    }
}
