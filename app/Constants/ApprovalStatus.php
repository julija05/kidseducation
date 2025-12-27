<?php

namespace App\Constants;

/**
 * Approval status constants for multi-step program approval workflow
 *
 * Workflow:
 * 1. Mentor creates program → PENDING_INITIAL_REVIEW
 * 2. Admin approves → CONTENT_DEVELOPMENT (mentor can add lessons/resources)
 * 3. Mentor submits for final review → PENDING_FINAL_REVIEW
 * 4. Admin gives final approval → APPROVED (appears on front-end)
 * OR Admin rejects at any stage → REJECTED
 */
class ApprovalStatus
{
    // Program submitted by mentor, waiting for admin initial review
    public const PENDING_INITIAL_REVIEW = 'pending_initial_review';

    // Admin approved, mentor can now add content (lessons, levels, resources)
    public const CONTENT_DEVELOPMENT = 'content_development';

    // Mentor finished adding content, waiting for admin final approval
    public const PENDING_FINAL_REVIEW = 'pending_final_review';

    // Fully approved and public (appears on front-end)
    public const APPROVED = 'approved';

    // Rejected by admin
    public const REJECTED = 'rejected';

    // Legacy status for backward compatibility
    public const PENDING = 'pending';

    /**
     * Get all valid approval statuses
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::PENDING_INITIAL_REVIEW,
            self::CONTENT_DEVELOPMENT,
            self::PENDING_FINAL_REVIEW,
            self::APPROVED,
            self::REJECTED,
            self::PENDING, // For backward compatibility
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
     * Get human-readable label for status
     *
     * @param string $status
     * @return string
     */
    public static function getLabel(string $status): string
    {
        return match($status) {
            self::PENDING_INITIAL_REVIEW => 'Pending Initial Review',
            self::CONTENT_DEVELOPMENT => 'Content Development',
            self::PENDING_FINAL_REVIEW => 'Pending Final Review',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::PENDING => 'Pending',
            default => 'Unknown',
        };
    }

    /**
     * Get color class for status badge
     *
     * @param string $status
     * @return string
     */
    public static function getColorClass(string $status): string
    {
        return match($status) {
            self::PENDING_INITIAL_REVIEW => 'bg-yellow-100 text-yellow-800',
            self::CONTENT_DEVELOPMENT => 'bg-blue-100 text-blue-800',
            self::PENDING_FINAL_REVIEW => 'bg-orange-100 text-orange-800',
            self::APPROVED => 'bg-green-100 text-green-800',
            self::REJECTED => 'bg-red-100 text-red-800',
            self::PENDING => 'bg-yellow-100 text-yellow-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }
}
