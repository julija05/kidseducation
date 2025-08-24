<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\LessonProgressRepositoryInterface;
use App\Repositories\Interfaces\LessonRepositoryInterface;
use App\Services\EnrollmentService;
use App\Services\LessonFormatterService;
use App\Services\LessonService;
use App\Services\ProgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LessonController extends Controller
{
    public function __construct(
        private LessonService $lessonService,
        private EnrollmentService $enrollmentService,
        private LessonFormatterService $formatterService,
        private EnrollmentRepositoryInterface $enrollmentRepository,
        private LessonRepositoryInterface $lessonRepository,
        private LessonProgressRepositoryInterface $progressRepository,
        private ProgramService $programService
    ) {}

    public function show(Lesson $lesson)
    {
        // TEMPORARY DEBUG - Remove after fixing
        \Log::info('=== LESSON CONTROLLER REACHED ===', [
            'lesson_id' => $lesson->id,
            'lesson_title' => $lesson->title,
            'user_id' => Auth::id(),
            'user_email' => Auth::user()?->email,
            'timestamp' => now(),
        ]);
        
        $user = Auth::user();

        // Check if user is suspended - deny access to lessons
        if ($user->isSuspended()) {
            return redirect()->route('dashboard')
                ->with('error', 'Your account is suspended. Please contact admin@abacoding.com to resolve this issue.');
        }

        // Initialize enrollment variable
        $enrollment = null;

        // PRIORITY 1: Check for regular enrollment first (trumps demo access)
        $enrollment = $this->enrollmentRepository->findActiveApprovedEnrollment($user, $lesson->program_id);

        if ($enrollment) {
            // User has approved enrollment - use regular enrollment logic
            if (! $this->lessonService->isLessonUnlockedForUser($lesson, $user)) {
                return redirect()->route('dashboard')
                    ->with('error', 'You need to complete previous level lessons to unlock this lesson.');
            }
        } else {
            // PRIORITY 2: Check demo access (including pending enrollments with demo access)
            $hasDemoAccess = $user->hasDemoAccess();
            $hasPendingEnrollmentDemoAccess = $user->enrollments()->where('approval_status', 'pending')->exists() 
                                            && $user->demo_program_slug;
            $isDemoAccount = $user->isDemoAccount();
            
            // Log demo access check for debugging
            Log::info('Demo access check', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'lesson_id' => $lesson->id,
                'lesson_title' => $lesson->title,
                'has_demo_access' => $hasDemoAccess,
                'has_pending_enrollment_demo_access' => $hasPendingEnrollmentDemoAccess,
                'is_demo_account' => $isDemoAccount,
                'demo_program_slug' => $user->demo_program_slug,
                'demo_expires_at' => $user->demo_expires_at,
                'is_demo_expired' => $user->isDemoExpired(),
            ]);

            if ($isDemoAccount || $hasDemoAccess || $hasPendingEnrollmentDemoAccess) {
                // Check if demo has expired first
                if ($user->isDemoExpired() && !$hasPendingEnrollmentDemoAccess) {
                    Log::info('Demo expired, logging out user', ['user_id' => $user->id]);
                    Auth::logout();
                    return redirect()->route('demo.expired');
                }
                
                // Check if user can access this specific lesson in demo mode
                if (! $user->canAccessLessonInDemo($lesson)) {
                    Log::info('Demo user cannot access lesson', [
                        'user_id' => $user->id,
                        'lesson_id' => $lesson->id,
                        'lesson_level' => $lesson->level,
                        'lesson_order' => $lesson->order_in_level,
                        'lesson_program_id' => $lesson->program_id,
                    ]);
                    
                    return redirect()->route('demo.dashboard', $user->demo_program_slug)
                        ->with('error', 'Demo access is limited to the first lesson only. Enroll for full access.');
                }
                
                Log::info('Demo user granted lesson access', [
                    'user_id' => $user->id,
                    'lesson_id' => $lesson->id,
                ]);
            } else {
                // PRIORITY 3: Check if user has pending enrollment - redirect to dashboard
                if ($user->enrollments()->where('approval_status', 'pending')->exists()) {
                    return redirect()->route('dashboard')
                        ->with('error', 'You have a pending enrollment. Please wait for approval to access lessons.');
                }

                // User has no enrollment and no demo access
                return redirect()->route('programs.show', $lesson->program->slug)
                    ->with('error', 'You need to be enrolled and approved to access lessons.');
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
            'resources' => $lessonData['resources'],
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

        // PRIORITY 1: Check for regular enrollment first (trumps demo access)
        if ($this->enrollmentRepository->userHasActiveApprovedEnrollment($user, $lesson->program_id)) {
            // User has approved enrollment - use regular enrollment logic
            if (! $this->lessonService->isLessonUnlockedForUser($lesson, $user)) {
                return response()->json(['error' => 'Lesson is not unlocked'], 403);
            }
        } else {
            // PRIORITY 2: Check demo access (even with pending enrollments)
            if ($user->isDemoAccount()) {
                if (! $user->canAccessLessonInDemo($lesson)) {
                    return response()->json(['error' => 'Demo access is limited to the first lesson only'], 403);
                }

                if ($user->isDemoExpired()) {
                    return response()->json(['error' => 'Demo access has expired'], 403);
                }
            } else {
                // PRIORITY 3: Check if user has pending enrollment
                if ($user->enrollments()->where('approval_status', 'pending')->exists()) {
                    return response()->json(['error' => 'You have a pending enrollment. Please wait for approval to access lessons.'], 403);
                }

                // User has no enrollment and no demo access
                return response()->json(['error' => 'Not enrolled or approved in this program'], 403);
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
            ],
        ]);
    }

    public function updateProgress(Request $request, Lesson $lesson)
    {
        $request->validate([
            'progress_percentage' => 'required|integer|min:0|max:100',
            'session_data' => 'nullable|array',
        ]);

        $user = $request->user();

        if (! $this->enrollmentRepository->userHasActiveApprovedEnrollment($user, $lesson->program_id)) {
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
                'enrollment_progress' => $enrollment?->fresh()->progress,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Lesson not started'], 404);
        }
    }

    public function complete(Request $request, Lesson $lesson)
    {
        \Log::info('=== LESSON COMPLETION ENDPOINT CALLED ===', [
            'lesson_id' => $lesson->id,
            'user_id' => $request->user()->id,
            'method' => $request->method(),
            'url' => $request->url(),
            'all_input' => $request->all(),
        ]);

        $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
        ]);

        $user = $request->user();

        // PRIORITY 1: Check for regular enrollment first (trumps demo access)
        if ($this->enrollmentRepository->userHasActiveApprovedEnrollment($user, $lesson->program_id)) {
            // User has approved enrollment - proceed with completion
        } else {
            // PRIORITY 2: Check demo access (even with pending enrollments)
            if ($user->isDemoAccount()) {
                if (! $user->canAccessLessonInDemo($lesson)) {
                    return response()->json(['error' => 'Demo access is limited to the first lesson only'], 403);
                }

                if ($user->isDemoExpired()) {
                    return response()->json(['error' => 'Demo access has expired'], 403);
                }
            } else {
                // PRIORITY 3: Check if user has pending enrollment
                if ($user->enrollments()->where('approval_status', 'pending')->exists()) {
                    return response()->json(['error' => 'You have a pending enrollment. Please wait for approval to access lessons.'], 403);
                }

                // User has no enrollment and no demo access
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

            // Check if this lesson completion should trigger a review prompt
            $shouldPromptReview = $this->shouldPromptReviewAfterLesson($lesson, $user);

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
                    'url' => route('lessons.show', $nextLesson->id),
                ] : null,
                'level_completed' => $levelCompleted,
                'shouldPromptReview' => $shouldPromptReview,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Check if completing this lesson should prompt for a review
     */
    private function shouldPromptReviewAfterLesson(Lesson $lesson, $user): bool
    {
        $program = $lesson->program;

        // Check if user already has a review for this program
        $existingReview = $user->reviews()
            ->where('reviewable_type', \App\Models\Program::class)
            ->where('reviewable_id', $program->id)
            ->exists();

        if ($existingReview) {
            Log::info('Review prompt: User already has review', [
                'user_id' => $user->id,
                'program_id' => $program->id,
            ]);

            return false; // User already reviewed this program
        }

        // Get total lessons in the program
        $totalLessons = $this->programService->getTotalLessonsCount($program);

        if ($totalLessons < 2) {
            Log::info('Review prompt: Not enough lessons', [
                'user_id' => $user->id,
                'program_id' => $program->id,
                'total_lessons' => $totalLessons,
            ]);

            return false; // Not enough lessons to have a "second-to-last"
        }

        // Get completed lessons count for this user (after this completion)
        $completedLessons = $this->programService->getCompletedLessonsCountForUser($program, $user);

        // Check if user just completed the second-to-last lesson
        // (completedLessons should equal totalLessons - 1)
        $shouldPrompt = $completedLessons === ($totalLessons - 1);

        Log::info('Review prompt decision', [
            'user_id' => $user->id,
            'program_id' => $program->id,
            'lesson_id' => $lesson->id,
            'total_lessons' => $totalLessons,
            'completed_lessons' => $completedLessons,
            'should_prompt' => $shouldPrompt,
            'calculation' => "completed_lessons ($completedLessons) === (total_lessons ($totalLessons) - 1)",
        ]);

        return $shouldPrompt;
    }
}
