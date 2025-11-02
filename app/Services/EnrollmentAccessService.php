<?php

namespace App\Services;

use App\Constants\EnrollmentType;
use App\Contracts\EnrollmentRepositoryInterface;
use App\Contracts\ResourceAccessInterface;
use App\Models\LessonResource;
use App\Models\User;

class EnrollmentAccessService implements ResourceAccessInterface
{
    public function __construct(
        private EnrollmentRepositoryInterface $enrollmentRepository
    ) {}

    public function canAccess(LessonResource $resource, User $user): bool
    {
        if ($user->isDemoAccount()) {
            return $user->canAccessLessonInDemo($resource->lesson);
        }

        $programId = $resource->lesson->program_id;

        $studentEnrollment = $this->enrollmentRepository->findByUserAndProgram(
            $user->id,
            $programId,
            EnrollmentType::STUDENT
        );

        if ($studentEnrollment && $this->isLessonUnlockedForUser($resource->lesson, $user)) {
            return true;
        }

        $mentorEnrollment = $this->enrollmentRepository->findByUserAndProgram(
            $user->id,
            $programId,
            EnrollmentType::MENTOR
        );

        return $mentorEnrollment !== null;
    }

    public function validateAccess(LessonResource $resource, User $user): void
    {
        if (!$this->canAccess($resource, $user)) {
            abort(403, 'You do not have access to this resource.');
        }
    }

    private function isLessonUnlockedForUser($lesson, User $user): bool
    {
        if ($lesson->level === 1) {
            return true;
        }

        $previousLevel = $lesson->level - 1;
        $previousLevelLessons = $lesson->program->lessons()
            ->byLevel($previousLevel)
            ->active()
            ->pluck('id');

        if ($previousLevelLessons->isEmpty()) {
            return true;
        }

        $completedCount = \App\Models\LessonProgress::where('user_id', $user->id)
            ->whereIn('lesson_id', $previousLevelLessons)
            ->where('status', 'completed')
            ->count();

        return $completedCount === $previousLevelLessons->count();
    }
}
