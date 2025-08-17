<?php

namespace App\Http\Controllers;

use App\Services\ResourceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\ClassSchedule;
use App\Models\Notification;
use App\Models\User;
use App\Services\EnrollmentService;
use App\Services\LessonService;
use App\Services\NotificationService;
use App\Services\ProgramService;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService,
        private LessonService $lessonService,
        private ResourceService $resourceService,
        private NotificationService $notificationService,
        private ProgramService $programService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        // DEBUG: Log dashboard access attempt
        \Log::info('Dashboard index accessed', [
            'user_id' => $user->id,
            'has_demo_access' => $user->hasDemoAccess(),
            'demo_program_slug' => $user->demo_program_slug,
            'is_demo_account' => $user->isDemoAccount(),
            'enrollments_count' => $user->enrollments()->count(),
        ]);

        // Check if this is a demo account - redirect to demo dashboard
        // IMPORTANT: Only redirect to demo if user has NO enrollments at all (pending or approved)
        // Users with pending enrollments should see dashboard with option to return to demo
        if ($user->isDemoAccount() && !$user->enrollments()->exists()) {
            \Log::info('Redirecting demo account to demo dashboard - no enrollments', [
                'user_id' => $user->id,
                'demo_program_slug' => $user->demo_program_slug,
                'has_demo_access' => $user->hasDemoAccess(),
                'enrollments_count' => $user->enrollments()->count()
            ]);

            if ($user->isDemoExpired()) {
                Auth::logout();
                return redirect()->route('demo.expired');
            }

            return redirect()->route('demo.dashboard', $user->demo_program_slug);
        }

        // Log when demo user has enrollments (should NOT redirect to demo)
        if ($user->isDemoAccount() && $user->enrollments()->exists()) {
            \Log::info('Demo user with enrollments - staying on regular dashboard', [
                'user_id' => $user->id,
                'demo_program_slug' => $user->demo_program_slug,
                'enrollments_count' => $user->enrollments()->count(),
                'pending_enrollments' => $user->enrollments()->where('approval_status', 'pending')->count(),
                'approved_enrollments' => $user->enrollments()->where('approval_status', 'approved')->count()
            ]);
        }

        // Get approved enrollment if exists (active only - completed programs go to main dashboard)
        $currentLocale = app()->getLocale();
        $approvedEnrollment = $user->enrollments()
            ->with(['program' => function ($query) use ($currentLocale) {
                $query->with(['lessons' => function ($lessonQuery) use ($currentLocale) {
                    $lessonQuery->with(['resources' => function ($resourceQuery) use ($currentLocale) {
                        // Temporarily disable language filtering until migration is run
                        try {
                            $resourceQuery->where('language', $currentLocale)->orderBy('order', 'asc');
                        } catch (\Exception $e) {
                            // Fallback: load all resources without language filter
                            $resourceQuery->orderBy('order', 'asc');
                        }
                    }])
                        ->orderBy('level', 'asc')
                        ->orderBy('order_in_level', 'asc');
                }]);
            }])
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->first();

        // Get completed enrollments for certificate functionality
        $completedEnrollments = $user->enrollments()
            ->with('program')
            ->where('status', 'completed')
            ->where('approval_status', 'approved')
            ->get();

        // Get pending enrollments
        $pendingEnrollments = $user->enrollments()
            ->with('program')
            ->where('approval_status', 'pending')
            ->get();

        // Get student-specific data
        $studentData = $this->getStudentData($user);

        // If user has an approved enrollment
        if ($approvedEnrollment) {
            return $this->renderApprovedDashboard($user, $approvedEnrollment, $studentData);
        }

        // If user has pending enrollments
        if ($pendingEnrollments->isNotEmpty()) {
            return $this->renderPendingDashboard($user, $pendingEnrollments, $studentData, $completedEnrollments);
        }

        // If user has completed enrollments but no active ones - show main dashboard with certificate functionality
        if ($completedEnrollments->isNotEmpty()) {
            return $this->renderCompletedDashboard($user, $completedEnrollments, $request, $studentData);
        }

        // No enrollments - show available programs
        return $this->renderProgramSelection($user, $request, $studentData);
    }

    private function getStudentData($user)
    {
        // Get next scheduled class for the student
        $nextScheduledClass = ClassSchedule::with(['admin', 'program', 'lesson'])
            ->where(function ($query) use ($user) {
                // Check both individual and group classes
                $query->where('student_id', $user->id)
                    ->orWhereHas('students', function ($subQuery) use ($user) {
                        $subQuery->where('users.id', $user->id);
                    });
            })
            ->upcoming()
            ->orderBy('scheduled_at', 'asc')
            ->first();

        // Format next class data
        $formattedNextClass = null;
        if ($nextScheduledClass) {
            $scheduledAt = $nextScheduledClass->scheduled_at;
            $dayName = $scheduledAt->isToday() ? __('app.time.today') : ($scheduledAt->isTomorrow() ? __('app.time.tomorrow') : $scheduledAt->format('l'));

            $formattedNextClass = [
                'id' => $nextScheduledClass->id,
                'title' => $nextScheduledClass->title,
                'description' => $nextScheduledClass->description,
                'admin_name' => $nextScheduledClass->admin->name,
                'program_name' => $nextScheduledClass->program?->translated_name ?? $nextScheduledClass->program?->name,
                'lesson_name' => $nextScheduledClass->lesson?->translated_title ?? $nextScheduledClass->lesson?->title,
                'scheduled_at' => $nextScheduledClass->scheduled_at,
                'formatted_time' => $nextScheduledClass->getFormattedScheduledTime(),
                'day_description' => $dayName,
                'time_only' => $scheduledAt->format('g:i A'),
                'duration' => $nextScheduledClass->getFormattedDuration(),
                'type' => $nextScheduledClass->getTypeLabel(),
                'location' => $nextScheduledClass->location,
                'meeting_link' => $nextScheduledClass->meeting_link,
                'status' => $nextScheduledClass->status,
            ];
        }

        // Get student notifications using the service
        $notificationData = $this->notificationService->getForStudent($user);
        $notifications = $notificationData['notifications']->map(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type,
                'is_read' => $notification->is_read,
                'created_at' => $notification->created_at,
                'data' => $notification->data,
            ];
        });
        $unreadNotificationCount = $notificationData['unread_count'];

        return [
            'nextScheduledClass' => $formattedNextClass,
            'notifications' => $notifications,
            'unreadNotificationCount' => $unreadNotificationCount,
        ];
    }

    private function renderApprovedDashboard($user, $enrollment, $studentData = [])
    {
        // Format enrollment data for dashboard with resources
        $enrolledProgramData = $this->enrollmentService->formatEnrollmentForDashboard($enrollment);

        // Add lesson resources to each lesson using the ResourceService
        if (isset($enrolledProgramData['lessons'])) {
            $currentLocale = app()->getLocale();
            foreach ($enrolledProgramData['lessons'] as $level => $lessons) {
                $enrolledProgramData['lessons'][$level] = collect($lessons)->map(function ($lesson) use ($currentLocale) {
                    $lessonModel = Lesson::with(['resources' => function ($query) use ($currentLocale) {
                        // Temporarily disable language filtering until migration is run
                        try {
                            $query->where('language', $currentLocale)->orderBy('order', 'asc');
                        } catch (\Exception $e) {
                            // Fallback: load all resources without language filter
                            $query->orderBy('order', 'asc');
                        }
                    }])->find($lesson['id']);

                    // Add resources to the lesson data
                    $lesson['resources'] = $lessonModel && $lessonModel->resources->isNotEmpty()
                        ? $lessonModel->resources->map(fn($resource) => $this->resourceService->formatResourceForFrontend($resource))->toArray()
                        : [];

                    return $lesson;
                })->toArray();
            }
        }

        // Get review data for the enrolled program
        $program = $enrollment->program;
        $userReview = $user->reviews()
            ->where('reviewable_type', \App\Models\Program::class)
            ->where('reviewable_id', $program->id)
            ->first();

        $canReview = !$userReview;

        // Check if program was recently completed and user hasn't reviewed yet
        $shouldPromptReview = false;
        if (
            $enrollment->status === 'completed' &&
            $enrollment->completed_at &&
            $enrollment->completed_at->isAfter(now()->subDays(7)) &&
            !$userReview
        ) {
            $shouldPromptReview = true;
        }

        return $this->createView('Dashboard', [
            'enrolledProgram' => $enrolledProgramData,
            'nextClass' => $studentData['nextScheduledClass'] ?? null,
            'pendingEnrollments' => [],
            'availablePrograms' => [],
            'notifications' => $studentData['notifications'] ?? [],
            'unreadNotificationCount' => $studentData['unreadNotificationCount'] ?? 0,
            'showLanguageSelector' => !$user->language_selected,
            'canReview' => $canReview,
            'userReview' => $userReview ? [
                'id' => $userReview->id,
                'rating' => $userReview->rating,
                'comment' => $userReview->comment,
                'created_at' => $userReview->created_at,
            ] : null,
            'shouldPromptReview' => $shouldPromptReview,
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'translated_name' => $program->translated_name,
                'slug' => $program->slug,
                'description' => $program->description,
                'translated_description' => $program->translated_description,
            ],
        ]);
    }

    private function renderPendingDashboard($user, $pendingEnrollments, $studentData = [], $completedEnrollments = [])
    {
        $formattedPending = $pendingEnrollments->map(function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'created_at' => $enrollment->created_at,
                'program' => [
                    'id' => $enrollment->program->id,
                    'name' => $enrollment->program->name,
                    'translated_name' => $enrollment->program->translated_name,
                    'slug' => $enrollment->program->slug,
                    'description' => $enrollment->program->description,
                    'translated_description' => $enrollment->program->translated_description,
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

        // Format completed enrollments for certificate functionality
        $formattedCompleted = collect($completedEnrollments)->map(function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'progress' => $enrollment->progress,
                'completed_at' => $enrollment->completed_at,
                'quiz_points' => $enrollment->quiz_points,
                'highest_unlocked_level' => $enrollment->highest_unlocked_level,
                'program' => [
                    'id' => $enrollment->program->id,
                    'slug' => $enrollment->program->slug,
                    'name' => $enrollment->program->name,
                    'translated_name' => $enrollment->program->translated_name,
                ],
            ];
        });

        return $this->createView('Dashboard', [
            'enrolledProgram' => null,
            'pendingEnrollments' => $formattedPending,
            'availablePrograms' => $availablePrograms,
            'completedEnrollments' => $formattedCompleted,
            'nextClass' => $studentData['nextScheduledClass'] ?? null,
            'notifications' => $studentData['notifications'] ?? [],
            'unreadNotificationCount' => $studentData['unreadNotificationCount'] ?? 0,
            'showLanguageSelector' => !$user->language_selected,
            'userDemoAccess' => $this->getUserDemoAccessForPendingEnrollments($user),
        ]);
    }

    private function renderProgramSelection($user, $request, $studentData = [])
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
            'nextClass' => $studentData['nextScheduledClass'] ?? null,
            'pendingProgramId' => $pendingProgramId,
            'notifications' => $studentData['notifications'] ?? [],
            'unreadNotificationCount' => $studentData['unreadNotificationCount'] ?? 0,
            'showLanguageSelector' => !$user->language_selected,
            'userDemoAccess' => $user->hasDemoAccess() ? [
                'program_slug' => $user->demo_program_slug,
                'expires_at' => $user->demo_expires_at,
                'days_remaining' => $user->getDemoRemainingDays(),
            ] : null,
        ]);
    }

    private function renderCompletedDashboard($user, $completedEnrollments, $request, $studentData = [])
    {
        // Format completed enrollments for certificate functionality
        $formattedCompleted = $completedEnrollments->map(function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'progress' => $enrollment->progress,
                'completed_at' => $enrollment->completed_at,
                'quiz_points' => $enrollment->quiz_points,
                'highest_unlocked_level' => $enrollment->highest_unlocked_level,
                'status' => $enrollment->status,
                'program' => [
                    'id' => $enrollment->program->id,
                    'slug' => $enrollment->program->slug,
                    'name' => $enrollment->program->name,
                    'translated_name' => $enrollment->program->translated_name,
                    'description' => $enrollment->program->description,
                    'translated_description' => $enrollment->program->translated_description,
                ],
            ];
        });

        // Get available programs for new enrollments
        $availablePrograms = $this->enrollmentService->getAvailablePrograms($user);

        // Check for pending program enrollment from session
        $pendingProgramId = session('pending_enrollment_program_id');
        if ($pendingProgramId) {
            session()->forget('pending_enrollment_program_id');
        }

        return $this->createView('Dashboard', [
            'enrolledProgram' => null,
            'pendingEnrollments' => [],
            'availablePrograms' => $availablePrograms,
            'completedEnrollments' => $formattedCompleted,
            'nextClass' => $studentData['nextScheduledClass'] ?? null,
            'pendingProgramId' => $pendingProgramId,
            'notifications' => $studentData['notifications'] ?? [],
            'unreadNotificationCount' => $studentData['unreadNotificationCount'] ?? 0,
            'showLanguageSelector' => !$user->language_selected,
            'userDemoAccess' => $user->hasDemoAccess() ? [
                'program_slug' => $user->demo_program_slug,
                'expires_at' => $user->demo_expires_at,
                'days_remaining' => $user->getDemoRemainingDays(),
            ] : null,
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

        // Check if this lesson completion should trigger a review prompt
        $shouldPromptReview = $this->shouldPromptReviewAfterLesson($lesson, $user);

        return response()->json([
            'success' => true,
            'progress' => $progress,
            'enrollment_progress' => $enrollment->fresh()->progress,
            'shouldPromptReview' => $shouldPromptReview
        ]);
    }

    /**
     * Check if completing this lesson should prompt for a review
     */
    private function shouldPromptReviewAfterLesson(Lesson $lesson, User $user): bool
    {
        $program = $lesson->program;

        // Check if user already has a review for this program
        $existingReview = $user->reviews()
            ->where('reviewable_type', \App\Models\Program::class)
            ->where('reviewable_id', $program->id)
            ->exists();

        if ($existingReview) {
            return false; // User already reviewed this program
        }

        // Get total lessons in the program
        $totalLessons = $this->programService->getTotalLessonsCount($program);

        if ($totalLessons < 2) {
            return false; // Not enough lessons to have a "second-to-last"
        }

        // Get completed lessons count for this user (after this completion)
        $completedLessons = $this->programService->getCompletedLessonsCountForUser($program, $user);

        // Check if user just completed the second-to-last lesson
        // (completedLessons should equal totalLessons - 1)
        return $completedLessons === ($totalLessons - 1);
    }

    public function markAllNotificationsAsRead(Request $request)
    {
        $user = $request->user();
        $markedCount = $this->notificationService->markAllAsReadForStudent($user);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'marked_count' => $markedCount
            ]);
        }

        return back();
    }


    /**
     * Get demo access info for users with pending enrollments
     * Allow demo access even if technically expired, as long as user has demo_program_slug
     */
    private function getUserDemoAccessForPendingEnrollments($user)
    {
        // Check if user has regular demo access first
        if ($user->hasDemoAccess()) {
            Log::info('User has regular demo access', [
                'user_id' => $user->id,
                'program_slug' => $user->demo_program_slug,
                'days_remaining' => $user->getDemoRemainingDays(),
            ]);
            return [
                'program_slug' => $user->demo_program_slug,
                'expires_at' => $user->demo_expires_at,
                'days_remaining' => $user->getDemoRemainingDays(),
            ];
        }

        // If user has pending enrollments and a demo program slug, allow demo access
        if ($user->enrollments()->where('approval_status', 'pending')->exists() && $user->demo_program_slug) {
            Log::info('User has pending enrollment with demo access', [
                'user_id' => $user->id,
                'program_slug' => $user->demo_program_slug,
                'pending_enrollments_count' => $user->enrollments()->where('approval_status', 'pending')->count(),
            ]);
            return [
                'program_slug' => $user->demo_program_slug,
                'expires_at' => null, // No expiration while enrollment is pending
                'days_remaining' => 999, // Indicate unlimited access while pending
            ];
        }

        Log::info('User has no demo access', [
            'user_id' => $user->id,
            'has_regular_demo' => $user->hasDemoAccess(),
            'demo_program_slug' => $user->demo_program_slug,
            'pending_enrollments_count' => $user->enrollments()->where('approval_status', 'pending')->count(),
        ]);

        return null;
    }

    public function mySchedule(Request $request)
    {
        $user = $request->user();

        // Get all class schedules for the student (both individual and group classes)
        $schedules = ClassSchedule::with(['admin', 'program', 'lesson'])
            ->where(function ($query) use ($user) {
                // Individual classes
                $query->where('student_id', $user->id)
                    // Group classes
                    ->orWhereHas('students', function ($subQuery) use ($user) {
                        $subQuery->where('users.id', $user->id);
                    });
            })
            ->orderBy('scheduled_at', 'desc')
            ->get();

        // Group schedules by status and time
        $groupedSchedules = [
            'upcoming' => $schedules->filter(fn($s) => $s->isUpcoming())->sortBy('scheduled_at'),
            'past' => $schedules->filter(fn($s) => $s->isPast())->sortByDesc('scheduled_at'),
            'cancelled' => $schedules->filter(fn($s) => $s->isCancelled())->sortByDesc('scheduled_at'),
        ];

        // Format schedules for frontend
        $formattedSchedules = [];
        foreach ($groupedSchedules as $status => $scheduleCollection) {
            $formattedSchedules[$status] = $scheduleCollection->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,
                    'description' => $schedule->description,
                    'scheduled_at' => $schedule->scheduled_at,
                    'formatted_time' => $schedule->getFormattedScheduledTime(),
                    'duration' => $schedule->getFormattedDuration(),
                    'status' => $schedule->status,
                    'status_color' => $schedule->getStatusColor(),
                    'type' => $schedule->type,
                    'type_label' => $schedule->getTypeLabel(),
                    'location' => $schedule->location,
                    'meeting_link' => $schedule->meeting_link,
                    'is_group_class' => $schedule->is_group_class,
                    'student_count' => $schedule->getStudentCount(),
                    'can_be_cancelled' => $schedule->canBeCancelled(),
                    'admin' => [
                        'id' => $schedule->admin->id,
                        'name' => $schedule->admin->name,
                    ],
                    'program' => $schedule->program ? [
                        'id' => $schedule->program->id,
                        'name' => $schedule->program->name,
                        'slug' => $schedule->program->slug,
                    ] : null,
                    'lesson' => $schedule->lesson ? [
                        'id' => $schedule->lesson->id,
                        'title' => $schedule->lesson->title,
                        'level' => $schedule->lesson->level,
                    ] : null,
                    'cancellation_reason' => $schedule->cancellation_reason,
                    'session_notes' => $schedule->session_notes,
                ];
            })->values();
        }

        return $this->createView('Student/MySchedule', [
            'schedules' => $formattedSchedules,
            'upcoming_count' => $formattedSchedules['upcoming']->count(),
            'total_count' => $schedules->count(),
        ]);
    }
}
