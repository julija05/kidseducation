<?php

namespace App\Constants;

/**
 * Proposal type constants
 * Defines all types of proposals that can be submitted by mentors
 */
class ProposalType
{
    // Resource-related proposals
    public const RESOURCE_CREATE = 'resource_create';
    public const RESOURCE_UPDATE = 'resource_update';
    public const RESOURCE_DELETE = 'resource_delete';

    // Lesson-related proposals
    public const LESSON_CREATE = 'lesson_create';
    public const LESSON_UPDATE = 'lesson_update';
    public const LESSON_DELETE = 'lesson_delete';

    // Level-related proposals
    public const LEVEL_CREATE = 'level_create';
    public const LEVEL_UPDATE = 'level_update';

    /**
     * Get all valid proposal types
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::RESOURCE_CREATE,
            self::RESOURCE_UPDATE,
            self::RESOURCE_DELETE,
            self::LESSON_CREATE,
            self::LESSON_UPDATE,
            self::LESSON_DELETE,
            self::LEVEL_CREATE,
            self::LEVEL_UPDATE,
        ];
    }

    /**
     * Check if a proposal type is valid
     *
     * @param string $type
     * @return bool
     */
    public static function isValid(string $type): bool
    {
        return in_array($type, self::all(), true);
    }

    /**
     * Get resource-related proposal types
     *
     * @return array<string>
     */
    public static function resourceTypes(): array
    {
        return [
            self::RESOURCE_CREATE,
            self::RESOURCE_UPDATE,
            self::RESOURCE_DELETE,
        ];
    }

    /**
     * Get lesson-related proposal types
     *
     * @return array<string>
     */
    public static function lessonTypes(): array
    {
        return [
            self::LESSON_CREATE,
            self::LESSON_UPDATE,
            self::LESSON_DELETE,
        ];
    }

    /**
     * Get level-related proposal types
     *
     * @return array<string>
     */
    public static function levelTypes(): array
    {
        return [
            self::LEVEL_CREATE,
            self::LEVEL_UPDATE,
        ];
    }

    /**
     * Get human-readable labels for proposal types
     *
     * @return array<string, string>
     */
    public static function labels(): array
    {
        return [
            self::RESOURCE_CREATE => 'Add New Resource',
            self::RESOURCE_UPDATE => 'Update Resource',
            self::RESOURCE_DELETE => 'Delete Resource',
            self::LESSON_CREATE => 'Add New Lesson',
            self::LESSON_UPDATE => 'Update Lesson',
            self::LESSON_DELETE => 'Delete Lesson',
            self::LEVEL_CREATE => 'Add New Level',
            self::LEVEL_UPDATE => 'Update Level',
        ];
    }

    /**
     * Get label for a specific proposal type
     *
     * @param string $type
     * @return string
     */
    public static function getLabel(string $type): string
    {
        return self::labels()[$type] ?? 'Unknown';
    }
}
