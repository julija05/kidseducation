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
            'quizzes' => $lesson->quizzes ? $lesson->quizzes->map(fn($quiz) => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'type' => $quiz->type,
                'type_display' => $quiz->type_display,
                'total_questions' => $quiz->questions->count(),
                'total_points' => $quiz->total_points,
                'passing_score' => $quiz->passing_score,
                'time_limit' => $quiz->time_limit,
                'formatted_time_limit' => $quiz->formatted_time_limit,
                'max_attempts' => $quiz->max_attempts,
            ])->toArray() : [],
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
