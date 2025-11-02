<?php

namespace App\Constants;

/**
 * Enrollment status constants
 * Defines all possible enrollment statuses in the system
 */
class EnrollmentStatus
{
    public const ACTIVE = 'active';
    public const COMPLETED = 'completed';
    public const PAUSED = 'paused';
    public const CANCELLED = 'cancelled';

    /**
     * Get all valid enrollment statuses
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::ACTIVE,
            self::COMPLETED,
            self::PAUSED,
            self::CANCELLED,
        ];
    }

    /**
     * Check if a status is valid
     *
     * @param string $status
     * @return bool
     */
    public static function isValid(string $status): bool
    {
        return in_array($status, self::all(), true);
    }

    /**
     * Get statuses that allow resource access
     *
     * @return array<string>
     */
    public static function activeStatuses(): array
    {
        return [
            self::ACTIVE,
            self::COMPLETED,
        ];
    }
}
