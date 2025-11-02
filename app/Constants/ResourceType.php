<?php

namespace App\Constants;

/**
 * Resource type constants
 * Defines all possible lesson resource types
 */
class ResourceType
{
    public const VIDEO = 'video';
    public const DOCUMENT = 'document';
    public const LINK = 'link';
    public const DOWNLOAD = 'download';
    public const INTERACTIVE = 'interactive';
    public const QUIZ = 'quiz';

    /**
     * Get all valid resource types
     *
     * @return array<string>
     */
    public static function all(): array
    {
        return [
            self::VIDEO,
            self::DOCUMENT,
            self::LINK,
            self::DOWNLOAD,
            self::INTERACTIVE,
            self::QUIZ,
        ];
    }

    /**
     * Get resource types with descriptions
     *
     * @return array<string, string>
     */
    public static function withDescriptions(): array
    {
        return [
            self::VIDEO => 'Video (YouTube, Vimeo, etc.)',
            self::DOCUMENT => 'Document (PDF, Word, etc.)',
            self::LINK => 'External Link',
            self::DOWNLOAD => 'Downloadable File',
            self::INTERACTIVE => 'Interactive Content',
            self::QUIZ => 'Quiz/Assessment',
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

    /**
     * Get types that support file uploads
     *
     * @return array<string>
     */
    public static function fileBasedTypes(): array
    {
        return [
            self::DOCUMENT,
            self::DOWNLOAD,
        ];
    }

    /**
     * Get types that use external URLs
     *
     * @return array<string>
     */
    public static function urlBasedTypes(): array
    {
        return [
            self::VIDEO,
            self::LINK,
        ];
    }
}
