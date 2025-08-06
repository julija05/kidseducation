<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Services\LessonService;
use App\Services\EnrollmentService;
use App\Services\LessonFormatterService;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\LessonRepositoryInterface;
use App\Repositories\Interfaces\LessonProgressRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LessonController extends Controller
{
    public function __construct(
        private LessonService $lessonService,
        private EnrollmentService $enrollmentService,
        private LessonFormatterService $formatterService,
        private EnrollmentRepositoryInterface $enrollmentRepository,
        private LessonRepositoryInterface $lessonRepository,
        private LessonProgressRepositoryInterface $progressRepository
    ) {}

    public function show(Lesson $lesson)
    {
        $user = Auth::user();
        
        // Initialize enrollment variable
        $enrollment = null;

        // Check demo access first
        if ($user->isDemoAccount()) {
            if (!$user->canAccessLessonInDemo($lesson)) {
                return redirect()->route('demo.dashboard', $user->demo_program_slug)
                    ->with('error', 'Demo access is limited to the first lesson only. Enroll for full access.');
            }

            // Check if demo has expired
            if ($user->isDemoExpired()) {
                Auth::logout();
                return redirect()->route('demo.expired');
            }
        } else {
            // Regular enrollment check for non-demo users
            $enrollment = $this->enrollmentRepository->findActiveApprovedEnrollment($user, $lesson->program_id);

            if (!$enrollment) {
                return redirect()->route('programs.show', $lesson->program->slug)
                    ->with('error', 'You need to be enrolled and approved to access lessons.');
            }

            // Check if lesson is unlocked for regular users
            if (!$this->lessonService->isLessonUnlockedForUser($lesson, $user)) {
                return redirect()->route('dashboard.programs.show', $lesson->program->slug)
                    ->with('error', 'You need to complete previous level lessons to unlock this lesson.');
            }
        }

        // Load lesson with resources and quizzes
        $lesson = $this->lessonRepository->findByIdWithResources($lesson->id);
        $lesson->load(['quizzes' => function ($query) {
            $query->where('is_active', true)->with('questions');
        }]);

        // Get or create lesson progress
        $progress = $lesson->userProgress($user) ??
            $this->lessonService->startLessonForUser($lesson, $user);

        // Get navigation lessons
        $nextLesson = $this->lessonService->getNextLessonForUser($lesson, $user);
        $previousLesson = $this->lessonService->getPreviousLessonForUser($lesson, $user);

        // Format lesson data
        $lessonData = $this->formatterService->formatLessonData($lesson);

        // Debug logging
        Log::info('Lesson resources loaded:', [
            'lesson_id' => $lesson->id,
            'resources_count' => $lesson->resources->count(),
            'resources' => $lessonData['resources']
        ]);

        return $this->createView('Dashboard/Lessons/Show', [
            'lesson' => $lessonData,
            'program' => $this->formatterService->formatProgramData($lesson->program),
            'progress' => $progress,
            'nextLesson' => $this->formatterService->formatLessonSummary($nextLesson),
            'previousLesson' => $this->formatterService->formatLessonSummary($previousLesson),
            'enrollment' => $enrollment,
        ]);
    }

    public function start(Request $request, Lesson $lesson)
    {
        $user = $request->user();

        // Check demo access first
        if ($user->isDemoAccount()) {
            if (!$user->canAccessLessonInDemo($lesson)) {
                return response()->json(['error' => 'Demo access is limited to the first lesson only'], 403);
            }

            if ($user->isDemoExpired()) {
                return response()->json(['error' => 'Demo access has expired'], 403);
            }
        } else {
            // Regular enrollment check for non-demo users
            if (!$this->enrollmentRepository->userHasActiveApprovedEnrollment($user, $lesson->program_id)) {
                return response()->json(['error' => 'Not enrolled or approved in this program'], 403);
            }

            if (!$this->lessonService->isLessonUnlockedForUser($lesson, $user)) {
                return response()->json(['error' => 'Lesson is not unlocked'], 403);
            }
        }

        $progress = $this->lessonService->startLessonForUser($lesson, $user);

        return response()->json([
            'success' => true,
            'progress' => $progress,
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'translated_title' => $lesson->translated_title,
                'content_type' => $lesson->content_type,
                'content_url' => $lesson->content_url,
                'content_body' => $lesson->content_body,
                'translated_content_body' => $lesson->translated_content_body,
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

        if (!$this->enrollmentRepository->userHasActiveApprovedEnrollment($user, $lesson->program_id)) {
            return response()->json(['error' => 'Not enrolled or approved in this program'], 403);
        }

        DB::beginTransaction();
        try {
            $progress = $this->lessonService->updateLessonProgress(
                $lesson,
                $user,
                $request->progress_percentage,
                $request->session_data
            );

            $enrollment = $this->enrollmentRepository->findActiveApprovedEnrollment($user, $lesson->program_id);

            if ($enrollment) {
                $this->enrollmentService->updateEnrollmentProgress($enrollment);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'progress' => $progress,
                'enrollment_progress' => $enrollment?->fresh()->progress
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Lesson not started'], 404);
        }
    }

    public function complete(Request $request, Lesson $lesson)
    {
        $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
        ]);

        $user = $request->user();

        // Check demo access first
        if ($user->isDemoAccount()) {
            if (!$user->canAccessLessonInDemo($lesson)) {
                return response()->json(['error' => 'Demo access is limited to the first lesson only'], 403);
            }

            if ($user->isDemoExpired()) {
                return response()->json(['error' => 'Demo access has expired'], 403);
            }
        } else {
            // Regular enrollment check for non-demo users
            if (!$this->enrollmentRepository->userHasActiveApprovedEnrollment($user, $lesson->program_id)) {
                return response()->json(['error' => 'Not enrolled or approved in this program'], 403);
            }
        }

        DB::beginTransaction();
        try {
            $progress = $this->lessonService->completeLessonForUser($lesson, $user, $request->score);

            $enrollment = $this->enrollmentRepository->findActiveApprovedEnrollment($user, $lesson->program_id);

            if ($enrollment) {
                $this->enrollmentService->updateEnrollmentProgress($enrollment);
            }

            $nextLesson = $this->lessonService->getNextLessonForUser($lesson, $user);
            $levelCompleted = $this->lessonService->isLevelCompletedByUser($lesson, $user);

            DB::commit();

            return response()->json([
                'success' => true,
                'progress' => $progress,
                'enrollment_progress' => $enrollment?->fresh()->progress,
                'next_lesson' => $nextLesson ? [
                    'id' => $nextLesson->id,
                    'title' => $nextLesson->title,
                    'translated_title' => $nextLesson->translated_title,
                    'level' => $nextLesson->level,
                    'url' => route('lessons.show', $nextLesson->id)
                ] : null,
                'level_completed' => $levelCompleted,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
