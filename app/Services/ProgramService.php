<?php

namespace App\Services;

use App\Models\LessonProgress;
use App\Models\Program;
use App\Models\User;
use App\Repositories\Interfaces\ProgramRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Str;

class ProgramService
{
    public function __construct(
        private ProgramRepositoryInterface $programRepository
    ) {}

    /**
     * Get all programs
     */
    public function getAllPrograms(): Collection
    {
        return $this->programRepository->getAll();
    }

    /**
     * Find a program by ID
     */
    public function findProgram(int $id): ?Program
    {
        return $this->programRepository->findById($id);
    }

    /**
     * Create a new program
     */
    public function createProgram(array $data): Program
    {
        // Remove _method field as it's not a database field
        unset($data['_method']);

        // Generate slug from name
        if (isset($data['name']) && ! isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return $this->programRepository->create($data);
    }

    /**
     * Update an existing program
     */
    public function updateProgram(Program $program, array $data): bool
    {
        return $this->programRepository->update($program, $data);
    }

    /**
     * Delete a program
     */
    public function deleteProgram(Program $program): bool
    {
        return $this->programRepository->delete($program);
    }

    /**
     * Get all levels available in a program
     */
    public function getProgramLevels(Program $program): array
    {
        return $program->lessons()
            ->active()
            ->distinct('level')
            ->orderBy('level')
            ->pluck('level')
            ->toArray();
    }

    /**
     * Get lessons for a specific level
     */
    public function getLessonsForLevel(Program $program, int $level): Collection
    {
        return $program->lessons()
            ->byLevel($level)
            ->active()
            ->ordered()
            ->get();
    }

    /**
     * Get the current level for a user in a program
     */
    public function getCurrentLevelForUser(Program $program, User $user): int
    {
        $completedLessons = LessonProgress::where('user_id', $user->id)
            ->whereHas('lesson', function ($query) use ($program) {
                $query->where('program_id', $program->id);
            })
            ->where('status', 'completed')
            ->with('lesson')
            ->get();

        if ($completedLessons->isEmpty()) {
            return 1;
        }

        // Group completed lessons by level
        $completedByLevel = $completedLessons->groupBy('lesson.level');

        // Find the highest level where all lessons are completed
        $levels = $this->getProgramLevels($program);
        $currentLevel = 1;

        foreach ($levels as $level) {
            $levelLessons = $this->getLessonsForLevel($program, $level);
            $completedInLevel = $completedByLevel->get($level, collect());

            if ($completedInLevel->count() === $levelLessons->count()) {
                $currentLevel = $level + 1; // User has completed this level
            } else {
                break; // User hasn't completed this level yet
            }
        }

        // Make sure we don't exceed available levels
        return min($currentLevel, max($levels) ?? 1);
    }

    /**
     * Get lessons with progress for a user, grouped by level
     */
    public function getLessonsWithProgressForUser(Program $program, User $user): SupportCollection
    {
        return $program->lessons()
            ->active()
            ->ordered()
            ->with(['progress' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get()
            ->map(function ($lesson) use ($user) {
                $progress = $lesson->progress->first();

                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'description' => $lesson->description,
                    'translated_title' => $lesson->translated_title,
                    'translated_description' => $lesson->translated_description,
                    'level' => $lesson->level,
                    'order_in_level' => $lesson->order_in_level,
                    'duration' => $lesson->formatted_duration,
                    'content_type' => $lesson->content_type,
                    'content_type_display' => $lesson->content_type_display,
                    'status' => $progress ? $progress->status : 'not_started',
                    'progress_percentage' => $progress ? $progress->progress_percentage : 0,
                    'score' => $progress ? $progress->score : null,
                    'is_unlocked' => $this->isLessonUnlockedForUser($lesson, $user),
                    'started_at' => $progress ? $progress->started_at : null,
                    'completed_at' => $progress ? $progress->completed_at : null,
                ];
            })
            ->groupBy('level');
    }

    /**
     * Calculate level progress for a user
     */
    public function calculateLevelProgressForUser(Program $program, User $user): array
    {
        $levels = $this->getProgramLevels($program);
        $levelProgressData = [];

        foreach ($levels as $level) {
            $levelLessons = $this->getLessonsForLevel($program, $level);
            $completedLessons = LessonProgress::where('user_id', $user->id)
                ->whereIn('lesson_id', $levelLessons->pluck('id'))
                ->where('status', 'completed')
                ->count();

            $totalLessons = $levelLessons->count();
            $progressPercentage = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;

            // Check if level is unlocked
            $isUnlocked = $this->isLevelUnlockedForUser($program, $level, $user);

            $levelProgressData[] = [
                'level' => $level,
                'completed' => $completedLessons,
                'total' => $totalLessons,
                'progress' => round($progressPercentage, 1),
                'isUnlocked' => $isUnlocked,
                'isCompleted' => $progressPercentage >= 100,
            ];
        }

        return $levelProgressData;
    }

    /**
     * Check if a level is unlocked for a user
     */
    public function isLevelUnlockedForUser(Program $program, int $level, User $user): bool
    {
        if ($level === 1) {
            return true;
        }

        // Check if previous level is completed
        $previousLevel = $level - 1;
        $previousLevelLessons = $this->getLessonsForLevel($program, $previousLevel);

        if ($previousLevelLessons->isEmpty()) {
            return true;
        }

        $previousLevelCompleted = LessonProgress::where('user_id', $user->id)
            ->whereIn('lesson_id', $previousLevelLessons->pluck('id'))
            ->where('status', 'completed')
            ->count();

        return $previousLevelCompleted === $previousLevelLessons->count();
    }

    /**
     * Check if a lesson is unlocked for a user (helper method)
     */
    private function isLessonUnlockedForUser($lesson, User $user): bool
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
     * Get total lessons count
     */
    public function getTotalLessonsCount(Program $program): int
    {
        return $program->lessons()->active()->count();
    }

    /**
     * Get completed lessons count for a user
     */
    public function getCompletedLessonsCountForUser(Program $program, User $user): int
    {
        return LessonProgress::where('user_id', $user->id)
            ->whereHas('lesson', function ($query) use ($program) {
                $query->where('program_id', $program->id);
            })
            ->where('status', 'completed')
            ->count();
    }

    /**
     * Format program data for frontend
     */
    public function formatProgramForFrontend(Program $program, ?User $user = null): array
    {
        $data = [
            'id' => $program->id,
            'name' => $program->name,
            'slug' => $program->slug,
            'description' => $program->description,
            'translated_name' => $program->translated_name,
            'translated_description' => $program->translated_description,
            'duration' => $program->duration,
            'price' => $program->price,
            'theme' => $program->theme_data,
        ];

        if ($user) {
            $data['lessonsCount'] = $this->getTotalLessonsCount($program);
            $data['completedLessons'] = $this->getCompletedLessonsCountForUser($program, $user);
        }

        return $data;
    }

    /**
     * Get active programs for frontend listing
     */
    public function getActiveProgramsForFrontend(): Collection
    {
        return Program::active()->get();
    }
}
