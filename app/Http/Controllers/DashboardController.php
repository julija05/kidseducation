<?php

namespace App\Http\Controllers;

use App\Services\ResourceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Services\EnrollmentService;
use App\Services\LessonService;

class DashboardController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService,
        private LessonService $lessonService,
        private ResourceService $resourceService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        // Get approved enrollment if exists
        $approvedEnrollment = $user->enrollments()
            ->with(['program' => function ($query) {
                $query->with(['lessons' => function ($lessonQuery) {
                    $lessonQuery->with(['resources' => function ($resourceQuery) {
                        $resourceQuery->orderBy('order', 'asc');
                    }])
                        ->orderBy('level', 'asc')
                        ->orderBy('order_in_level', 'asc');
                }]);
            }])
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->first();

        // Get pending enrollments
        $pendingEnrollments = $user->enrollments()
            ->with('program')
            ->where('approval_status', 'pending')
            ->get();

        // If user has an approved enrollment
        if ($approvedEnrollment) {
            return $this->renderApprovedDashboard($user, $approvedEnrollment);
        }

        // If user has pending enrollments
        if ($pendingEnrollments->isNotEmpty()) {
            return $this->renderPendingDashboard($user, $pendingEnrollments);
        }

        // No enrollments - show available programs
        return $this->renderProgramSelection($user, $request);
    }

    private function renderApprovedDashboard($user, $enrollment)
    {
        // Format enrollment data for dashboard with resources
        $enrolledProgramData = $this->enrollmentService->formatEnrollmentForDashboard($enrollment);

        // Add lesson resources to each lesson using the ResourceService
        if (isset($enrolledProgramData['lessons'])) {
            foreach ($enrolledProgramData['lessons'] as $level => $lessons) {
                $enrolledProgramData['lessons'][$level] = collect($lessons)->map(function ($lesson) {
                    $lessonModel = Lesson::with(['resources' => function ($query) {
                        $query->orderBy('order', 'asc');
                    }])->find($lesson['id']);

                    // Add resources to the lesson data
                    $lesson['resources'] = $lessonModel && $lessonModel->resources->isNotEmpty()
                        ? $lessonModel->resources->map(fn($resource) => $this->resourceService->formatResourceForFrontend($resource))->toArray()
                        : [];

                    return $lesson;
                })->toArray();
            }
        }

        return $this->createView('Dashboard', [
            'enrolledProgram' => $enrolledProgramData,
            'nextClass' => '02-10-2025 10:00 AM', // Placeholder for next class
            'pendingEnrollments' => [],
            'availablePrograms' => [],
        ]);
    }

    private function renderPendingDashboard($user, $pendingEnrollments)
    {
        $formattedPending = $pendingEnrollments->map(function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'created_at' => $enrollment->created_at,
                'program' => [
                    'id' => $enrollment->program->id,
                    'name' => $enrollment->program->name,
                    'slug' => $enrollment->program->slug,
                    'description' => $enrollment->program->description,
                    'icon' => $enrollment->program->icon,
                    'color' => $enrollment->program->color,
                    'lightColor' => $enrollment->program->light_color,
                    'borderColor' => $enrollment->program->border_color,
                    'textColor' => $enrollment->program->text_color,
                ],
            ];
        });

        // Still get available programs in case they want to browse
        $availablePrograms = $this->enrollmentService->getAvailablePrograms($user);

        return $this->createView('Dashboard', [
            'enrolledProgram' => null,
            'pendingEnrollments' => $formattedPending,
            'availablePrograms' => $availablePrograms,
            'nextClass' => null,
        ]);
    }

    private function renderProgramSelection($user, $request)
    {
        $availablePrograms = $this->enrollmentService->getAvailablePrograms($user);

        // Check if user was redirected from registration with a program intent
        $pendingProgramId = session('pending_enrollment_program_id');
        if ($pendingProgramId) {
            session()->forget('pending_enrollment_program_id');
        }

        return $this->createView('Dashboard', [
            'enrolledProgram' => null,
            'pendingEnrollments' => [],
            'availablePrograms' => $availablePrograms,
            'nextClass' => null,
            'pendingProgramId' => $pendingProgramId,
        ]);
    }

    public function startLesson(Request $request, $lessonId)
    {
        $user = $request->user();
        $lesson = Lesson::findOrFail($lessonId);

        // Check if user is enrolled and approved
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

        return response()->json(['success' => true, 'progress' => $progress]);
    }

    public function completeLesson(Request $request, $lessonId)
    {
        $user = $request->user();
        $lesson = Lesson::findOrFail($lessonId);

        // Check enrollment and approval
        $enrollment = $user->enrollments()
            ->where('program_id', $lesson->program_id)
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->first();

        if (!$enrollment) {
            return response()->json(['error' => 'Not enrolled or approved in this program'], 403);
        }

        // Complete the lesson
        $progress = $this->lessonService->completeLessonForUser($lesson, $user, $request->score ?? null);

        return response()->json([
            'success' => true,
            'progress' => $progress,
            'enrollment_progress' => $enrollment->fresh()->progress
        ]);
    }
}
