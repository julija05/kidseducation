<?php

namespace App\Constants;

/**
 * Proposal status constants
 * Defines all possible statuses in the proposal approval workflow
 */
class ProposalStatus
{
    public const PENDING = 'pending';
    public const APPROVED = 'approved';
    public const REJECTED = 'rejected';
    public const APPLIED = 'applied'; // Approved and changes have been applied

    /**
     * Get all valid proposal statuses
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::PENDING,
            self::APPROVED,
            self::REJECTED,
            self::APPLIED,
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
     * Get statuses that need admin attention
     *
     * @return array<string>
     */
    public static function pendingStatuses(): array
    {
        return [
            self::PENDING,
        ];
    }

    /**
     * Get statuses that have been reviewed
     *
     * @return array<string>
     */
    public static function reviewedStatuses(): array
    {
        return [
            self::APPROVED,
            self::REJECTED,
            self::APPLIED,
        ];
    }

    /**
     * Get human-readable labels for statuses
     *
     * @return array<string, string>
     */
    public static function labels(): array
    {
        return [
            self::PENDING => 'Pending Review',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::APPLIED => 'Applied',
        ];
    }

    /**
     * Get label for a specific status
     *
     * @param string $status
     * @return string
     */
    public static function getLabel(string $status): string
    {
        return self::labels()[$status] ?? 'Unknown';
    }

    /**
     * Get color classes for status badges (Tailwind CSS)
     *
     * @return array<string, string>
     */
    public static function colorClasses(): array
    {
        return [
            self::PENDING => 'bg-yellow-100 text-yellow-800 border-yellow-300',
            self::APPROVED => 'bg-green-100 text-green-800 border-green-300',
            self::REJECTED => 'bg-red-100 text-red-800 border-red-300',
            self::APPLIED => 'bg-blue-100 text-blue-800 border-blue-300',
        ];
    }

    /**
     * Get color class for a specific status
     *
     * @param string $status
     * @return string
     */
    public static function getColorClass(string $status): string
    {
        return self::colorClasses()[$status] ?? 'bg-gray-100 text-gray-800 border-gray-300';
    }
}
