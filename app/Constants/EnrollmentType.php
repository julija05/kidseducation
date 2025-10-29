<?php

namespace App\Constants;

/**
 * Enrollment type constants
 * Defines the types of enrollments in the system
 */
class EnrollmentType
{
    public const STUDENT = 'student';
    public const MENTOR = 'mentor';

    /**
     * Get all valid enrollment types
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::STUDENT,
            self::MENTOR,
        ];
    }

    /**
     * Check if a type is valid
     *
     * @param string $type
     * @return bool
     */
    public static function isValid(string $type): bool
    {
        return in_array($type, self::all(), true);
    }
}
