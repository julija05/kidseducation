<?php

namespace App\Constants;

/**
 * Payment status constants
 * Defines the lifecycle of a manual (offline) payment record.
 */
class PaymentStatus
{
    // Parent declared a payment that still needs admin verification.
    public const PENDING = 'pending';

    // Admin verified the money was received; grants access.
    public const CONFIRMED = 'confirmed';

    // Admin could not verify the payment; access stays blocked.
    public const REJECTED = 'rejected';

    /**
     * Get all valid payment statuses.
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::PENDING,
            self::CONFIRMED,
            self::REJECTED,
        ];
    }

    /**
     * Check whether the given status is a valid payment status.
     */
    public static function isValid(string $status): bool
    {
        return in_array($status, self::all(), true);
    }
}
