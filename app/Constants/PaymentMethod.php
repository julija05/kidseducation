<?php

namespace App\Constants;

/**
 * Payment method constants
 * Supported manual payment channels (no online gateway).
 */
class PaymentMethod
{
    // Money sent to the organisation's bank account.
    public const BANK_TRANSFER = 'bank_transfer';

    // Cash handed over in person.
    public const CASH = 'cash';

    // Any other agreed manual arrangement.
    public const OTHER = 'other';

    /**
     * Get all valid payment methods.
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::BANK_TRANSFER,
            self::CASH,
            self::OTHER,
        ];
    }

    /**
     * Check whether the given method is a valid payment method.
     */
    public static function isValid(string $method): bool
    {
        return in_array($method, self::all(), true);
    }
}
