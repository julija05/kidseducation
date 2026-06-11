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
     * Count students assigned to a mentor in a program
     *
     * @param int $programId
     * @param User $mentor
     * @return int
     */
    public function countStudentsForMentorInProgram(int $programId, User $mentor): int;

    /**
     * Get average progress for program
     *
     * @param int $programId
     * @return float
     */
    public function getAverageProgress(int $programId): float;

    /**
     * Get average progress for students assigned to a mentor in a program
     *
     * @param int $programId
     * @param User $mentor
     * @return float
     */
    public function getAverageProgressForMentorInProgram(int $programId, User $mentor): float;

    /**
     * Get students assigned to a mentor across programs
     *
     * @param User $mentor
     * @param array<int> $programIds
     * @return Collection<Enrollment>
     */
    public function getStudentsForMentor(User $mentor, array $programIds = []): Collection;
}
