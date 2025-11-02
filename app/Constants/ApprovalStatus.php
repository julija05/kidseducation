<?php

namespace App\Constants;

/**
 * Approval status constants
 * Defines all possible approval statuses in the system
 */
class ApprovalStatus
{
    public const PENDING = 'pending';
    public const APPROVED = 'approved';
    public const REJECTED = 'rejected';

    /**
     * Get all valid approval statuses
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::PENDING,
            self::APPROVED,
            self::REJECTED,
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
}
