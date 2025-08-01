<?php

namespace App\Http\Controllers;

use App\Services\ResourceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\ClassSchedule;
use App\Models\Notification;
use App\Services\EnrollmentService;
use App\Services\LessonService;
use App\Services\NotificationService;

class DashboardController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService,
        private LessonService $lessonService,
        private ResourceService $resourceService,
        private NotificationService $notificationService
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

        // Get student-specific data
        $studentData = $this->getStudentData($user);

        // If user has an approved enrollment
        if ($approvedEnrollment) {
            return $this->renderApprovedDashboard($user, $approvedEnrollment, $studentData);
        }

        // If user has pending enrollments
        if ($pendingEnrollments->isNotEmpty()) {
            return $this->renderPendingDashboard($user, $pendingEnrollments, $studentData);
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
            $dayName = $scheduledAt->isToday() ? __('app.time.today') : 
                      ($scheduledAt->isTomorrow() ? __('app.time.tomorrow') : $scheduledAt->format('l'));
            
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
            'nextClass' => $studentData['nextScheduledClass'] ?? null,
            'pendingEnrollments' => [],
            'availablePrograms' => [],
            'notifications' => $studentData['notifications'] ?? [],
            'unreadNotificationCount' => $studentData['unreadNotificationCount'] ?? 0,
            'showLanguageSelector' => !$user->language_selected,
        ]);
    }

    private function renderPendingDashboard($user, $pendingEnrollments, $studentData = [])
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

        return $this->createView('Dashboard', [
            'enrolledProgram' => null,
            'pendingEnrollments' => $formattedPending,
            'availablePrograms' => $availablePrograms,
            'nextClass' => $studentData['nextScheduledClass'] ?? null,
            'notifications' => $studentData['notifications'] ?? [],
            'unreadNotificationCount' => $studentData['unreadNotificationCount'] ?? 0,
            'showLanguageSelector' => !$user->language_selected,
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
