<?php

namespace App\Services;

use App\Models\LessonResource;
use App\Models\User;

class ResourceService
{
    /**
     * Format resource data for frontend
     */
    public function formatResourceForFrontend(LessonResource $resource): array
    {
        return [
            'id' => $resource->id,
            'title' => $resource->title,
            'description' => $resource->description,
            'type' => $resource->type,
            'type_display' => $resource->type_display,
            'icon' => $resource->icon,
            'resource_url' => $resource->resource_url,
            'is_downloadable' => $resource->is_downloadable,
            'is_required' => $resource->is_required,
            'file_name' => $resource->file_name,
            'file_size' => $resource->formatted_file_size,
            'download_url' => $resource->getDownloadUrl(),
            'youtube_embed_url' => $resource->getYouTubeEmbedUrl(),
            // 'youtube_thumbnail' => $resource->getYouTubeThumbnail(),
            'is_youtube_video' => $resource->isYouTubeVideo(),
            'order' => $resource->order,
        ];
    }

    /**
     * Check if user can access a resource
     */
    public function canUserAccessResource(LessonResource $resource, User $user): bool
    {
        // Handle demo users
        if ($user->isDemoAccount()) {
            // Demo users can only access resources from their demo lesson
            return $user->canAccessLessonInDemo($resource->lesson);
        }

        // Check if user is enrolled and approved for this lesson's program
        $enrollment = $user->enrollments()
            ->where('program_id', $resource->lesson->program_id)
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->first();

        if (! $enrollment) {
            return false;
        }

        // Check if lesson is unlocked (avoiding circular dependency)
        return $this->isLessonUnlockedForUser($resource->lesson, $user);
    }

    /**
     * Mark resource as viewed for user
     */
    public function markResourceAsViewed(LessonResource $resource, User $user): array
    {
        // Check access first
        if (! $this->canUserAccessResource($resource, $user)) {
            return [
                'success' => false,
                'message' => 'You do not have access to this resource',
            ];
        }

        // Get or create lesson progress
        $progress = \App\Models\LessonProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'lesson_id' => $resource->lesson_id,
            ],
            [
                'status' => 'not_started',
                'progress_percentage' => 0,
            ]
        );

        // Update session data to track viewed resources
        $sessionData = $progress->session_data ?? [];
        $sessionData['viewed_resources'] = $sessionData['viewed_resources'] ?? [];

        if (! in_array($resource->id, $sessionData['viewed_resources'])) {
            $sessionData['viewed_resources'][] = $resource->id;
        }

        $progress->update(['session_data' => $sessionData]);

        // Calculate progress based on required resources viewed
        $requiredResources = $resource->lesson->resources()->required()->get();
        $viewedRequired = array_intersect(
            $sessionData['viewed_resources'],
            $requiredResources->pluck('id')->toArray()
        );

        $resourceProgress = count($viewedRequired) / max(1, $requiredResources->count()) * 100;

        // Update lesson progress if resource viewing indicates progress
        if ($resourceProgress > $progress->progress_percentage) {
            $progress->updateProgress(min(99, $resourceProgress)); // Don't auto-complete
        }

        return [
            'success' => true,
            'message' => 'Resource marked as viewed',
            'progress' => $progress->fresh(),
            'viewed_at' => now(),
            'already_viewed' => in_array($resource->id, ($sessionData['viewed_resources'] ?? [])),
        ];
    }

    /**
     * Get video resources for a lesson
     */
    public function getVideoResources(\App\Models\Lesson $lesson): \Illuminate\Support\Collection
    {
        return $lesson->resources()
            ->byType('video')
            ->ordered()
            ->get();
    }

    /**
     * Get downloadable resources for a lesson
     */
    public function getDownloadableResources(\App\Models\Lesson $lesson): \Illuminate\Support\Collection
    {
        return $lesson->resources()
            ->where('is_downloadable', true)
            ->ordered()
            ->get();
    }

    /**
     * Get required resources for a lesson
     */
    public function getRequiredResources(\App\Models\Lesson $lesson): \Illuminate\Support\Collection
    {
        return $lesson->resources()
            ->required()
            ->ordered()
            ->get();
    }

    /**
     * Get resource statistics for a user
     */
    public function getResourceStatsForUser(User $user, $programId = null): array
    {
        $query = $user->enrollments()
            ->where('status', 'active')
            ->where('approval_status', 'approved');

        if ($programId) {
            $query->where('program_id', $programId);
        }

        $enrollments = $query->with(['program.lessons.resources'])->get();

        $stats = [
            'total_resources' => 0,
            'viewed_resources' => 0,
            'resources_by_type' => [],
            'viewed_by_type' => [],
        ];

        foreach ($enrollments as $enrollment) {
            foreach ($enrollment->program->lessons as $lesson) {
                foreach ($lesson->resources as $resource) {
                    $stats['total_resources']++;

                    $type = $resource->type;
                    $stats['resources_by_type'][$type] = ($stats['resources_by_type'][$type] ?? 0) + 1;

                    // Check if resource was viewed by checking lesson progress session data
                    $progress = $lesson->userProgress($user);
                    if ($progress && isset($progress->session_data['viewed_resources'])) {
                        if (in_array($resource->id, $progress->session_data['viewed_resources'])) {
                            $stats['viewed_resources']++;
                            $stats['viewed_by_type'][$type] = ($stats['viewed_by_type'][$type] ?? 0) + 1;
                        }
                    }
                }
            }
        }

        return $stats;
    }

    /**
     * Get available resource types
     */
    public function getResourceTypes(): array
    {
        return [
            'video' => 'Video (YouTube, Vimeo, etc.)',
            'document' => 'Document (PDF, Word, etc.)',
            'link' => 'External Link',
            'download' => 'Downloadable File',
            'interactive' => 'Interactive Content',
            'quiz' => 'Quiz/Assessment',
        ];
    }

    /**
     * Validate resource data
     */
    public function validateResourceData(array $data): array
    {
        $errors = [];

        // Check required fields
        if (empty($data['title'])) {
            $errors[] = 'Title is required';
        }

        if (empty($data['type']) || ! array_key_exists($data['type'], $this->getResourceTypes())) {
            $errors[] = 'Valid resource type is required';
        }

        // Type-specific validation
        if (isset($data['type'])) {
            switch ($data['type']) {
                case 'video':
                case 'link':
                    if (empty($data['resource_url'])) {
                        $errors[] = 'URL is required for '.$data['type'].' resources';
                    } elseif (! filter_var($data['resource_url'], FILTER_VALIDATE_URL)) {
                        $errors[] = 'Invalid URL format';
                    }
                    break;

                case 'document':
                case 'download':
                    if (empty($data['resource_url']) && empty($data['file'])) {
                        $errors[] = 'Either URL or file upload is required for '.$data['type'].' resources';
                    }
                    break;
            }
        }

        return $errors;
    }

    /**
     * Check if lesson is unlocked for user (helper to avoid circular dependency)
     */
    private function isLessonUnlockedForUser($lesson, User $user): bool
    {
        // Level 1 lessons are always unlocked
        if ($lesson->level === 1) {
            return true;
        }

        // Check if user has completed all lessons in the previous level
        $previousLevel = $lesson->level - 1;
        $previousLevelLessons = $lesson->program->lessons()
            ->byLevel($previousLevel)
            ->active()
            ->pluck('id');

        if ($previousLevelLessons->isEmpty()) {
            return true;
        }

        // Count completed lessons in previous level
        $completedCount = \App\Models\LessonProgress::where('user_id', $user->id)
            ->whereIn('lesson_id', $previousLevelLessons)
            ->where('status', 'completed')
            ->count();

        return $completedCount === $previousLevelLessons->count();
    }
}
