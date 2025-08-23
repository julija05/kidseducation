<?php

namespace App\Repositories\Interfaces;

use App\Models\Lesson;
use Illuminate\Support\Collection;

interface LessonRepositoryInterface
{
    public function findById(int $id): ?Lesson;

    public function findByIdWithResources(int $id, ?string $language = null): ?Lesson;

    public function getNextLesson(Lesson $lesson): ?Lesson;

    public function getPreviousLesson(Lesson $lesson): ?Lesson;

    public function getLessonsByProgramAndLevel(int $programId, int $level): Collection;
}
