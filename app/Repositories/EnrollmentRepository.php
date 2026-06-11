<?php

namespace App\Repositories;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Contracts\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface as RepositoryEnrollmentInterface;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class EnrollmentRepository implements EnrollmentRepositoryInterface, RepositoryEnrollmentInterface
{
    public function findByUserAndProgram(int $userId, int $programId, string $enrollmentType): ?Enrollment
    {
        return Enrollment::where('user_id', $userId)
            ->where('program_id', $programId)
            ->where('enrollment_type', $enrollmentType)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->first();
    }

    public function getActiveEnrollments(User $user, string $enrollmentType): Collection
    {
        return $user->enrollments()
            ->where('enrollment_type', $enrollmentType)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->where(function ($query) use ($enrollmentType) {
                if ($enrollmentType === EnrollmentType::STUDENT) {
                    $query->whereIn('status', EnrollmentStatus::activeStatuses());
                }
            })
            ->with('program')
            ->get();
    }

    public function getStudentsInProgram(int $programId): Collection
    {
        return Enrollment::where('program_id', $programId)
            ->where('enrollment_type', EnrollmentType::STUDENT)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->with(['user' => function ($query) {
                $query->select('id', 'name', 'email', 'created_at');
            }])
            ->get();
    }

    public function countStudentsInProgram(int $programId): int
    {
        return Enrollment::where('program_id', $programId)
            ->where('enrollment_type', EnrollmentType::STUDENT)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->count();
    }

    public function countStudentsForMentorInProgram(int $programId, User $mentor): int
    {
        return $this->studentsForMentorQuery($mentor, [$programId])->count();
    }

    public function getAverageProgress(int $programId): float
    {
        $avgProgress = Enrollment::where('program_id', $programId)
            ->where('enrollment_type', EnrollmentType::STUDENT)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->avg('progress');

        return round($avgProgress ?? 0, 1);
    }

    public function getAverageProgressForMentorInProgram(int $programId, User $mentor): float
    {
        $avgProgress = $this->studentsForMentorQuery($mentor, [$programId])->avg('progress');

        return round($avgProgress ?? 0, 1);
    }

    public function getStudentsAcrossPrograms(array $programIds): Collection
    {
        return Enrollment::whereIn('program_id', $programIds)
            ->where('enrollment_type', EnrollmentType::STUDENT)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->with(['user', 'program'])
            ->get();
    }

    public function getStudentsForMentor(User $mentor, array $programIds = []): Collection
    {
        return $this->studentsForMentorQuery($mentor, $programIds)
            ->with(['user', 'program'])
            ->get();
    }

    /**
     * Find an active, approved enrollment for a user in a program
     * Implementation for App\Repositories\Interfaces\EnrollmentRepositoryInterface
     *
     * @param User $user
     * @param int $programId
     * @return Enrollment|null
     */
    public function findActiveApprovedEnrollment(User $user, int $programId): ?Enrollment
    {
        return $user->enrollments()
            ->where('program_id', $programId)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->whereIn('status', EnrollmentStatus::activeStatuses())
            ->where('access_blocked', false)
            ->first();
    }

    /**
     * Check if a user has an active, approved enrollment in a program
     * Implementation for App\Repositories\Interfaces\EnrollmentRepositoryInterface
     *
     * @param User $user
     * @param int $programId
     * @return bool
     */
    public function userHasActiveApprovedEnrollment(User $user, int $programId): bool
    {
        return $this->findActiveApprovedEnrollment($user, $programId) !== null;
    }

    private function studentsForMentorQuery(User $mentor, array $programIds = [])
    {
        return Enrollment::query()
            ->when(
                empty($programIds),
                fn ($query) => $query->whereRaw('1 = 0'),
                fn ($query) => $query->whereIn('program_id', $programIds)
            )
            ->where('enrollment_type', EnrollmentType::STUDENT)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->where(function ($query) use ($mentor) {
                $query->where('assigned_mentor_id', $mentor->id)
                    ->orWhere(function ($query) use ($mentor) {
                        $query->whereNull('assigned_mentor_id')
                            ->where('referred_by_mentor_id', $mentor->id);
                    });
            });
    }
}
