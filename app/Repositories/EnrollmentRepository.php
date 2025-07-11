<?php

namespace App\Repositories;

use App\Models\Enrollment;
use App\Models\User;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface;

class EnrollmentRepository implements EnrollmentRepositoryInterface
{
    public function findActiveApprovedEnrollment(User $user, int $programId): ?Enrollment
    {
        return $user->enrollments()
            ->where('program_id', $programId)
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->first();
    }

    public function userHasActiveApprovedEnrollment(User $user, int $programId): bool
    {
        return $user->enrollments()
            ->where('program_id', $programId)
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->exists();
    }
}
