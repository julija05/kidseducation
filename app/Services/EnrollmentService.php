<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Collection;

class EnrollmentService
{
    public function __construct(
        private ProgramService $programService
    ) {}

    /**
     * Update enrollment progress based on completed lessons
     */
    public function updateEnrollmentProgress(Enrollment $enrollment): void
    {
        $totalLessons = $this->programService->getTotalLessonsCount($enrollment->program);

        if ($totalLessons === 0) {
            $enrollment->update(['progress' => 0]);

            return;
        }

        $completedLessons = $this->programService->getCompletedLessonsCountForUser($enrollment->program, $enrollment->user);
        $progressPercentage = ($completedLessons / $totalLessons) * 100;

        $updateData = ['progress' => round($progressPercentage, 2)];

        // Mark as completed if all lessons are done
        if ($progressPercentage >= 100 && ! $enrollment->completed_at) {
            $updateData['completed_at'] = now();
            $updateData['status'] = 'completed';
        }

        $enrollment->update($updateData);
    }

    /**
     * Check if enrollment is active and approved
     */
    public function isEnrollmentActiveAndApproved(Enrollment $enrollment): bool
    {
        // An enrollment is considered "active and approved" if it's approved and either active or paused
        // 'paused' is for approved users who haven't started yet
        // 'active' is for users currently learning
        // 'completed' users should not be redirected to dashboard automatically
        // 'access_blocked' users should not have learning access
        return $enrollment->approval_status === 'approved' &&
               in_array($enrollment->status, ['active', 'paused']) &&
               ! $enrollment->access_blocked;
    }

    /**
     * Get current level for an enrollment
     */
    public function getCurrentLevel(Enrollment $enrollment): int
    {
        return $this->programService->getCurrentLevelForUser($enrollment->program, $enrollment->user);
    }

    /**
     * Get next available lesson for the user
     */
    public function getNextLesson(Enrollment $enrollment): ?\App\Models\Lesson
    {
        $user = $enrollment->user;
        $program = $enrollment->program;

        // Get the last lesson the user was working on
        $lastProgress = LessonProgress::where('user_id', $user->id)
            ->whereHas('lesson', function ($query) use ($program) {
                $query->where('program_id', $program->id);
            })
            ->orderBy('updated_at', 'desc')
            ->first();

        if ($lastProgress && ! $lastProgress->isCompleted()) {
            // Continue with the lesson in progress
            return $lastProgress->lesson;
        }

        // Find the next uncompleted lesson
        $lessons = $program->lessons()
            ->active()
            ->ordered()
            ->get();

        foreach ($lessons as $lesson) {
            // We'll need to inject LessonService later to avoid circular dependency
            if (! $this->isLessonUnlockedForUser($lesson, $user)) {
                continue;
            }

            $progress = $lesson->userProgress($user);
            if (! $progress || ! $progress->isCompleted()) {
                return $lesson;
            }
        }

        return null; // All lessons completed
    }

    /**
     * Format enrollment data for dashboard
     */
    public function formatEnrollmentForDashboard(Enrollment $enrollment): array
    {
        $program = $enrollment->program;
        $user = $enrollment->user;

        // Get lessons with progress grouped by level
        $lessonsWithProgress = $this->programService->getLessonsWithProgressForUser($program, $user);

        // Get current level
        $currentLevel = $this->getCurrentLevel($enrollment);

        // Get next lesson
        $nextLesson = $this->getNextLesson($enrollment);

        // Calculate level progress
        $levelProgress = $this->programService->calculateLevelProgressForUser($program, $user);

        return [
            'id' => $program->id,
            'slug' => $program->slug,
            'name' => $program->name,
            'description' => $program->description,
            'translated_name' => $program->translated_name,
            'translated_description' => $program->translated_description,
            'theme' => $program->theme_data,
            'progress' => round($enrollment->progress, 0),
            'status' => $enrollment->status,
            'approvalStatus' => $enrollment->approval_status,
            'accessBlocked' => $enrollment->access_blocked,
            'blockReason' => $enrollment->block_reason,
            'blockedAt' => $enrollment->blocked_at?->format('M d, Y'),
            'enrolledAt' => $enrollment->enrolled_at->format('M d, Y'),
            'currentLevel' => $currentLevel,
            'totalLevels' => count($this->programService->getProgramLevels($program)),
            'levelProgress' => $levelProgress,
            'lessons' => $lessonsWithProgress,
            'nextLesson' => $nextLesson ? [
                'id' => $nextLesson->id,
                'title' => $nextLesson->title,
                'translated_title' => $nextLesson->translated_title,
                'level' => $nextLesson->level,
            ] : null,
            // Points system information
            'quizPoints' => $enrollment->quiz_points ?? 0,
            'highestUnlockedLevel' => $enrollment->highest_unlocked_level ?? 1,
            'levelRequirements' => $program->getEffectiveLevelRequirements(),
            'pointsForNextLevel' => $enrollment->getPointsForNextLevel(),
            'pointsNeededForNextLevel' => $enrollment->getPointsNeededForNextLevel(),
        ];
    }

    /**
     * Get available programs for a user
     */
    public function getAvailablePrograms(User $user): Collection
    {
        // Get all active programs
        $programs = $this->programService->getActiveProgramsForFrontend();

        // Get user's enrollment program IDs
        $enrolledProgramIds = $user->enrollments()->pluck('program_id');

        return $programs->map(function ($program) use ($enrolledProgramIds, $user) {
            $data = $this->programService->formatProgramForFrontend($program, $user);
            $data['isEnrolled'] = $enrolledProgramIds->contains($program->id);

            return $data;
        });
    }

    /**
     * Get user's enrollments with program data
     */
    public function getUserEnrollmentsWithPrograms(User $user): Collection
    {
        return $user->enrollments()
            ->with('program')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'approval_status' => $enrollment->approval_status,
                    'progress' => $enrollment->progress,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'program' => $this->programService->formatProgramForFrontend($enrollment->program),
                ];
            });
    }

    /**
     * Check if lesson is unlocked for user (helper to avoid circular dependency)
     */
    private function isLessonUnlockedForUser($lesson, User $user): bool
    {
        // Use the new points-based system for level unlocking
        return $lesson->isUnlockedForUser($user);
    }
}
