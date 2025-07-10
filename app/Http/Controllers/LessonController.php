<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Services\LessonService;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    public function __construct(
        private LessonService $lessonService,
        private EnrollmentService $enrollmentService
    ) {}

    public function show(Lesson $lesson)
    {
        $user = Auth::user();

        // Check if user is enrolled and approved for this program
        $enrollment = $user->enrollments()
            ->where('program_id', $lesson->program_id)
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->first();

        if (!$enrollment) {
            return redirect()->route('programs.show', $lesson->program->slug)
                ->with('error', 'You need to be enrolled and approved to access lessons.');
        }

        // Check if lesson is unlocked
        if (!$this->lessonService->isLessonUnlockedForUser($lesson, $user)) {
            return redirect()->route('dashboard.programs.show', $lesson->program->slug)
                ->with('error', 'You need to complete previous level lessons to unlock this lesson.');
        }

        // Load lesson with resources
        $lesson->load(['resources' => function ($query) {
            $query->ordered();
        }]);

        // Get or create lesson progress
        $progress = $lesson->userProgress($user) ??
            $this->lessonService->startLessonForUser($lesson, $user);

        // Get next and previous lessons
        $nextLesson = $this->lessonService->getNextLessonForUser($lesson, $user);
        $previousLesson = $this->lessonService->getPreviousLessonForUser($lesson, $user);

        // Format lesson data for frontend INCLUDING RESOURCES
        $lessonData = [
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
            // Enhanced resource formatting with proper URLs
            'resources' => $lesson->resources->map(function ($resource) {
                $resourceData = [
                    'id' => $resource->id,
                    'title' => $resource->title,
                    'description' => $resource->description,
                    'type' => $resource->type,
                    'file_name' => $resource->file_name,
                    'mime_type' => $resource->mime_type,
                    'is_downloadable' => $resource->is_downloadable,
                    'is_required' => $resource->is_required,
                    'metadata' => $resource->metadata,
                ];

                // Handle resource_url - prioritize external URL, then secure preview route
                if ($resource->resource_url) {
                    // External URL provided
                    $resourceData['resource_url'] = $resource->resource_url;
                } elseif ($resource->file_path && Storage::exists($resource->file_path)) {
                    // File stored locally - create secure preview URL
                    $resourceData['resource_url'] = route('lesson-resources.preview', $resource->id);
                } else {
                    $resourceData['resource_url'] = null;
                }

                // Handle download URL - use existing download route
                if ($resource->canDownload()) {
                    $resourceData['download_url'] = route('lesson-resources.download', $resource->id);
                } else {
                    $resourceData['download_url'] = null;
                }

                // Handle stream URL
                if ($resource->canStream()) {
                    $resourceData['stream_url'] = route('lesson-resources.stream', $resource->id);
                } else {
                    $resourceData['stream_url'] = null;
                }

                // Add debug information
                $resourceData['debug_info'] = [
                    'has_resource_url' => !empty($resource->resource_url),
                    'has_file_path' => !empty($resource->file_path),
                    'file_exists' => $resource->file_path ? Storage::exists($resource->file_path) : false,
                    'can_download' => $resource->canDownload(),
                    'can_stream' => $resource->canStream(),
                ];

                return $resourceData;
            })->toArray()
        ];

        // Debug logging
        \Log::info('Lesson resources loaded:', [
            'lesson_id' => $lesson->id,
            'resources_count' => $lesson->resources->count(),
            'resources' => $lessonData['resources']
        ]);

        return \Inertia\Inertia::render('Dashboard/Lessons/Show', [
            'lesson' => $lessonData,
            'program' => [
                'id' => $lesson->program->id,
                'name' => $lesson->program->name,
                'slug' => $lesson->program->slug,
                'description' => $lesson->program->description,
            ],
            'progress' => $progress,
            'nextLesson' => $nextLesson ? [
                'id' => $nextLesson->id,
                'title' => $nextLesson->title,
                'level' => $nextLesson->level,
            ] : null,
            'previousLesson' => $previousLesson ? [
                'id' => $previousLesson->id,
                'title' => $previousLesson->title,
                'level' => $previousLesson->level,
            ] : null,
            'enrollment' => $enrollment,
        ]);
    }

    public function start(Request $request, Lesson $lesson)
    {
        $user = $request->user();

        // Verify enrollment and approval
        $enrollment = $user->enrollments()
            ->where('program_id', $lesson->program_id)
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->first();

        if (!$enrollment) {
            return response()->json(['error' => 'Not enrolled or approved in this program'], 403);
        }

        // Check if lesson is unlocked
        if (!$this->lessonService->isLessonUnlockedForUser($lesson, $user)) {
            return response()->json(['error' => 'Lesson is not unlocked'], 403);
        }

        // Start the lesson
        $progress = $this->lessonService->startLessonForUser($lesson, $user);

        return response()->json([
            'success' => true,
            'progress' => $progress,
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'content_type' => $lesson->content_type,
                'content_url' => $lesson->content_url,
                'content_body' => $lesson->content_body,
            ]
        ]);
    }

    public function updateProgress(Request $request, Lesson $lesson)
    {
        $request->validate([
            'progress_percentage' => 'required|integer|min:0|max:100',
            'session_data' => 'nullable|array',
        ]);

        $user = $request->user();

        // Verify enrollment
        if (!$this->verifyUserEnrollment($lesson, $user)) {
            return response()->json(['error' => 'Not enrolled or approved in this program'], 403);
        }

        try {
            // Update progress
            $progress = $this->lessonService->updateLessonProgress(
                $lesson,
                $user,
                $request->progress_percentage,
                $request->session_data
            );

            // Update enrollment progress
            $enrollment = $user->enrollments()
                ->where('program_id', $lesson->program_id)
                ->first();

            if ($enrollment) {
                $this->enrollmentService->updateEnrollmentProgress($enrollment);
            }

            return response()->json([
                'success' => true,
                'progress' => $progress,
                'enrollment_progress' => $enrollment?->fresh()->progress
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Lesson not started'], 404);
        }
    }

    public function complete(Request $request, Lesson $lesson)
    {
        $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
        ]);

        $user = $request->user();

        // Verify enrollment
        if (!$this->verifyUserEnrollment($lesson, $user)) {
            return response()->json(['error' => 'Not enrolled or approved in this program'], 403);
        }

        // Complete the lesson
        $progress = $this->lessonService->completeLessonForUser($lesson, $user, $request->score);

        // Get next lesson if available
        $nextLesson = $this->lessonService->getNextLessonForUser($lesson, $user);

        // Check if level is completed
        $levelCompleted = $this->lessonService->isLevelCompletedByUser($lesson, $user);

        return response()->json([
            'success' => true,
            'progress' => $progress,
            'enrollment_progress' => $user->enrollments()
                ->where('program_id', $lesson->program_id)
                ->first()?->fresh()->progress,
            'next_lesson' => $nextLesson ? [
                'id' => $nextLesson->id,
                'title' => $nextLesson->title,
                'level' => $nextLesson->level,
                'url' => route('lessons.show', $nextLesson->id)
            ] : null,
            'level_completed' => $levelCompleted,
        ]);
    }

    private function verifyUserEnrollment(Lesson $lesson, $user): bool
    {
        return $user->enrollments()
            ->where('program_id', $lesson->program_id)
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->exists();
    }
}
