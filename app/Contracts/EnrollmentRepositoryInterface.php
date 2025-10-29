<?php

namespace App\Contracts;

use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface for enrollment data access
 * Follows the Dependency Inversion Principle
 */
interface EnrollmentRepositoryInterface
{
    /**
     * Find enrollment by user and program
     *
     * @param int $userId
     * @param int $programId
     * @param string $enrollmentType
     * @return Enrollment|null
     */
    public function findByUserAndProgram(int $userId, int $programId, string $enrollmentType): ?Enrollment;

    /**
     * Get active enrollments for user
     *
     * @param User $user
     * @param string $enrollmentType
     * @return Collection<Enrollment>
     */
    public function getActiveEnrollments(User $user, string $enrollmentType): Collection;

    /**
     * Get students enrolled in program
     *
     * @param int $programId
     * @return Collection<Enrollment>
     */
    public function getStudentsInProgram(int $programId): Collection;

    /**
     * Count students in program
     *
     * @param int $programId
     * @return int
     */
    public function countStudentsInProgram(int $programId): int;

    /**
     * Get average progress for program
     *
     * @param int $programId
     * @return float
     */
    public function getAverageProgress(int $programId): float;
}
