<?php

namespace App\Services;

use App\Models\Lesson;

class LessonFormatterService
{
    public function __construct(
        private ResourceFormatterService $resourceFormatter
    ) {}

    public function formatLessonData(Lesson $lesson): array
    {
        return [
            'id' => $lesson->id,
            'title' => $lesson->title,
            'description' => $lesson->description,
            'level' => $lesson->level,
            'order_in_level' => $lesson->order_in_level,
            'content_type' => $lesson->content_type,
            'content_url' => $lesson->content_url,
            'content_body' => $lesson->content_body,
            'duration_minutes' => $lesson->duration_minutes,
            'formatted_duration' => $lesson->formatted_duration,
            'resources' => $this->resourceFormatter->formatResources($lesson->resources),
        ];
    }

    public function formatLessonSummary(?Lesson $lesson): ?array
    {
        if (!$lesson) {
            return null;
        }

        return [
            'id' => $lesson->id,
            'title' => $lesson->title,
            'level' => $lesson->level,
        ];
    }

    public function formatProgramData($program): array
    {
        return [
            'id' => $program->id,
            'name' => $program->name,
            'slug' => $program->slug,
            'description' => $program->description,
        ];
    }
}
