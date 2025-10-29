<?php

namespace App\Repositories;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Contracts\EnrollmentRepositoryInterface;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class EnrollmentRepository implements EnrollmentRepositoryInterface
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

    public function getAverageProgress(int $programId): float
    {
        $avgProgress = Enrollment::where('program_id', $programId)
            ->where('enrollment_type', EnrollmentType::STUDENT)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->avg('progress');

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
}
