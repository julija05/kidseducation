<?php

namespace App\Repositories;

use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use App\Repositories\Interfaces\LessonProgressRepositoryInterface;

class LessonProgressRepository implements LessonProgressRepositoryInterface
{
    public function findByLessonAndUser(Lesson $lesson, User $user): ?LessonProgress
    {
        return LessonProgress::where('lesson_id', $lesson->id)
            ->where('user_id', $user->id)
            ->first();
    }

    public function create(Lesson $lesson, User $user): LessonProgress
    {
        return LessonProgress::create([
            'lesson_id' => $lesson->id,
            'user_id' => $user->id,
            'started_at' => now(),
            'progress_percentage' => 0,
            'status' => 'in_progress',
        ]);
    }

    public function updateProgress(LessonProgress $progress, array $data): LessonProgress
    {
        $progress->update([
            'progress_percentage' => $data['progress_percentage'],
            'last_accessed_at' => now(),
            'session_data' => $data['session_data'] ?? $progress->session_data,
        ]);

        return $progress->fresh();
    }

    public function markAsCompleted(LessonProgress $progress, ?float $score = null): LessonProgress
    {
        $progress->update([
            'completed_at' => now(),
            'progress_percentage' => 100,
            'status' => 'completed',
            'score' => $score,
        ]);

        return $progress->fresh();
    }
}
