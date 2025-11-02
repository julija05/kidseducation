<?php

namespace App\Services;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\LessonProgressStatus;
use App\Constants\ResourceType;
use App\Contracts\ResourceAccessInterface;
use App\Models\LessonResource;
use App\Models\User;

/**
 * Service for resource-related business logic
 * Focuses on resource operations and statistics
 */
class ResourceService
{
    public function __construct(
        private ResourceAccessInterface $accessService
    ) {}

    /**
     * Format resource data for frontend display
     * Delegates to ResourceFormatterService for consistent formatting
     *
     * @param LessonResource $resource
     * @return array
     */
    public function formatResourceForFrontend(LessonResource $resource): array
    {
        $formatter = app(\App\Services\ResourceFormatterService::class);
        return $formatter->formatResource($resource);
    }

    /**
     * Mark resource as viewed for user
     */
    public function markResourceAsViewed(LessonResource $resource, User $user): array
    {
        // Check access first using the access service
        if (! $this->accessService->canAccess($resource, $user)) {
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
                'status' => LessonProgressStatus::NOT_STARTED,
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
            ->whereIn('status', EnrollmentStatus::activeStatuses())
            ->where('approval_status', ApprovalStatus::APPROVED);

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
     * Validate resource data
     */
    public function validateResourceData(array $data): array
    {
        $errors = [];

        // Check required fields
        if (empty($data['title'])) {
            $errors[] = 'Title is required';
        }

        if (empty($data['type']) || ! ResourceType::isValid($data['type'])) {
            $errors[] = 'Valid resource type is required';
        }

        // Type-specific validation
        if (isset($data['type'])) {
            if (in_array($data['type'], ResourceType::urlBasedTypes())) {
                if (empty($data['resource_url'])) {
                    $errors[] = 'URL is required for '.$data['type'].' resources';
                } elseif (! filter_var($data['resource_url'], FILTER_VALIDATE_URL)) {
                    $errors[] = 'Invalid URL format';
                }
            } elseif (in_array($data['type'], ResourceType::fileBasedTypes())) {
                if (empty($data['resource_url']) && empty($data['file'])) {
                    $errors[] = 'Either URL or file upload is required for '.$data['type'].' resources';
                }
            }
        }

        return $errors;
    }
}
