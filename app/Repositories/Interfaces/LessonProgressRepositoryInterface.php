<?php

namespace App\Repositories\Interfaces;

use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;

interface LessonProgressRepositoryInterface
{
    public function findByLessonAndUser(Lesson $lesson, User $user): ?LessonProgress;
    public function create(Lesson $lesson, User $user): LessonProgress;
    public function updateProgress(LessonProgress $progress, array $data): LessonProgress;
    public function markAsCompleted(LessonProgress $progress, ?float $score = null): LessonProgress;
}
