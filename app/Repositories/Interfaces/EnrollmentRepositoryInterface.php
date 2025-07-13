<?php

namespace App\Repositories\Interfaces;

use App\Models\Enrollment;
use App\Models\User;

interface EnrollmentRepositoryInterface
{
    public function findActiveApprovedEnrollment(User $user, int $programId): ?Enrollment;
    public function userHasActiveApprovedEnrollment(User $user, int $programId): bool;
}
