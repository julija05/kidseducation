<?php

namespace App\Constants;

/**
 * Lesson progress status constants
 * Defines all possible lesson progress statuses in the system
 */
class LessonProgressStatus
{
    public const NOT_STARTED = 'not_started';
    public const IN_PROGRESS = 'in_progress';
    public const COMPLETED = 'completed';

    /**
     * Get all valid lesson progress statuses
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::NOT_STARTED,
            self::IN_PROGRESS,
            self::COMPLETED,
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
     * Get statuses that indicate progress has been made
     *
     * @return array<string>
     */
    public static function activeStatuses(): array
    {
        return [
            self::IN_PROGRESS,
            self::COMPLETED,
        ];
    }
}
