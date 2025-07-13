<?php

namespace App\Repositories;

use App\Models\Lesson;
use App\Models\User;
use App\Repositories\Interfaces\LessonRepositoryInterface;
use Illuminate\Support\Collection;

class LessonRepository implements LessonRepositoryInterface
{
    public function findById(int $id): ?Lesson
    {
        return Lesson::find($id);
    }

    public function findByIdWithResources(int $id): ?Lesson
    {
        return Lesson::with(['resources' => function ($query) {
            $query->ordered();
        }])->find($id);
    }

    public function getNextLesson(Lesson $lesson): ?Lesson
    {
        // First try to get next lesson in same level
        $nextInLevel = Lesson::where('program_id', $lesson->program_id)
            ->where('level', $lesson->level)
            ->where('order_in_level', '>', $lesson->order_in_level)
            ->orderBy('order_in_level')
            ->first();

        if ($nextInLevel) {
            return $nextInLevel;
        }

        // If no next lesson in level, get first lesson of next level
        return Lesson::where('program_id', $lesson->program_id)
            ->where('level', '>', $lesson->level)
            ->orderBy('level')
            ->orderBy('order_in_level')
            ->first();
    }

    public function getPreviousLesson(Lesson $lesson): ?Lesson
    {
        // First try to get previous lesson in same level
        $prevInLevel = Lesson::where('program_id', $lesson->program_id)
            ->where('level', $lesson->level)
            ->where('order_in_level', '<', $lesson->order_in_level)
            ->orderBy('order_in_level', 'desc')
            ->first();

        if ($prevInLevel) {
            return $prevInLevel;
        }

        // If no previous lesson in level, get last lesson of previous level
        return Lesson::where('program_id', $lesson->program_id)
            ->where('level', '<', $lesson->level)
            ->orderBy('level', 'desc')
            ->orderBy('order_in_level', 'desc')
            ->first();
    }

    public function getLessonsByProgramAndLevel(int $programId, int $level): Collection
    {
        return Lesson::where('program_id', $programId)
            ->where('level', $level)
            ->orderBy('order_in_level')
            ->get();
    }
}
