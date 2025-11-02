<?php

namespace App\Contracts;

use App\Models\LessonResource;

/**
 * Interface for resource formatting
 * Follows the Single Responsibility Principle
 */
interface ResourceFormatterInterface
{
    /**
     * Format resource for frontend consumption
     *
     * @param LessonResource $resource
     * @return array<string, mixed>
     */
    public function format(LessonResource $resource): array;

    /**
     * Format multiple resources
     *
     * @param iterable<LessonResource> $resources
     * @return array<array<string, mixed>>
     */
    public function formatMany(iterable $resources): array;
}
