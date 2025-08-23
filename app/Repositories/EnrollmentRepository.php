<?php

namespace App\Repositories;

use App\Models\Enrollment;
use App\Models\User;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface;

class EnrollmentRepository implements EnrollmentRepositoryInterface
{
    public function findActiveApprovedEnrollment(User $user, int $programId): ?Enrollment
    {
        // Allow access for both active and completed enrollments
        return $user->enrollments()
            ->where('program_id', $programId)
            ->whereIn('status', ['active', 'completed'])
            ->where('approval_status', 'approved')
            ->first();
    }

    public function userHasActiveApprovedEnrollment(User $user, int $programId): bool
    {
        // Allow access for both active and completed enrollments
        return $user->enrollments()
            ->where('program_id', $programId)
            ->whereIn('status', ['active', 'completed'])
            ->where('approval_status', 'approved')
            ->exists();
    }
}
