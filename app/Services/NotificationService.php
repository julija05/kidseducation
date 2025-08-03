<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Mail\LessonScheduled;
use App\Jobs\SendLessonReminder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Create a new notification
     */
    public function create(
        string $title,
        string $message,
        string $type,
        ?array $data = null,
        ?Model $relatedModel = null,
        ?User $createdBy = null
    ): Notification {
        return Notification::create([
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
            'related_model_type' => $relatedModel ? get_class($relatedModel) : null,
            'related_model_id' => $relatedModel?->id,
            'created_by' => $createdBy?->id,
        ]);
    }

    /**
     * Create a new notification with translation keys (preferred method)
     */
    public function createWithTranslationKeys(
        string $titleKey,
        string $messageKey,
        string $type,
        ?array $translationData = null,
        ?array $additionalData = null,
        ?Model $relatedModel = null,
        ?User $createdBy = null
    ): Notification {
        $data = array_merge($additionalData ?? [], [
            'title_key' => $titleKey,
            'message_key' => $messageKey,
            'translation_data' => $translationData ?? [],
        ]);

        return Notification::create([
            'title' => $titleKey, // Store key as fallback
            'message' => $messageKey, // Store key as fallback
            'type' => $type,
            'data' => $data,
            'related_model_type' => $relatedModel ? get_class($relatedModel) : null,
            'related_model_id' => $relatedModel?->id,
            'created_by' => $createdBy?->id,
        ]);
    }

    /**
     * Create enrollment notification for admins
     */
    public function createEnrollmentNotification(
        \App\Models\Enrollment $enrollment,
        string $action = 'pending'
    ): Notification {
        $user = $enrollment->user;
        $program = $enrollment->program;

        $titles = [
            'pending' => __('app.notifications.new_enrollment_request'),
            'approved' => __('app.notifications.enrollment_approved'),
            'rejected' => __('app.notifications.enrollment_rejected'),
        ];

        $messages = [
            'pending' => __('app.notifications.enrollment_pending_message', [
                'user' => $user->name,
                'program' => $program->name
            ]),
            'approved' => __('app.notifications.enrollment_approved_message', [
                'user' => $user->name,
                'program' => $program->name
            ]),
            'rejected' => __('app.notifications.enrollment_rejected_message', [
                'user' => $user->name,
                'program' => $program->name
            ]),
        ];

        return $this->create(
            $titles[$action] ?? __('app.notifications.enrollment_update'),
            $messages[$action] ?? __('app.notifications.enrollment_updated'),
            'enrollment',
            [
                'action' => $action,
                'user_name' => $user->name,
                'user_id' => $user->id,
                'program_name' => $program->name,
                'program_id' => $program->id,
                'enrollment_id' => $enrollment->id,
            ],
            $enrollment,
            $enrollment->user
        );
    }

    /**
     * Get all notifications (latest first)
     */
    public function getAll(int $limit = 50): Collection
    {
        return Notification::with('createdBy')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get unread notifications
     */
    public function getUnread(int $limit = 20): Collection
    {
        return Notification::with('createdBy')
            ->unread()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get notifications by type
     */
    public function getByType(string $type, int $limit = 20): Collection
    {
        return Notification::with('createdBy')
            ->byType($type)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(int $notificationId): bool
    {
        $notification = Notification::find($notificationId);
        return $notification ? $notification->markAsRead() : false;
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): int
    {
        return Notification::unread()->update(['is_read' => true]);
    }

    /**
     * Get unread count
     */
    public function getUnreadCount(): int
    {
        return Notification::unread()->count();
    }

    /**
     * Delete old notifications (older than specified days)
     */
    public function deleteOld(int $days = 30): int
    {
        return Notification::where('created_at', '<', now()->subDays($days))->delete();
    }

    /**
     * Create class schedule notification
     */
    public function createScheduleNotification(
        \App\Models\ClassSchedule $schedule,
        string $action = 'scheduled'
    ): Notification {
        $student = $schedule->student;
        $admin = $schedule->admin;

        $titleKeys = [
            'scheduled' => 'notifications.class_scheduled',
            'rescheduled' => 'notifications.class_rescheduled',
            'cancelled' => 'notifications.class_cancelled',
            'completed' => 'notifications.class_completed',
            'reminder' => 'notifications.class_reminder',
        ];

        $messageKeys = [
            'scheduled' => 'notifications.class_scheduled_message',
            'rescheduled' => 'notifications.class_rescheduled_message',
            'cancelled' => 'notifications.class_cancelled_message',
            'completed' => 'notifications.class_completed_message',
            'reminder' => 'notifications.class_reminder_message',
        ];

        // Translation data for message placeholders
        $translationData = [
            'title' => $schedule->title,
            'admin' => $admin->name,
            'time' => $schedule->getFormattedScheduledTime()
        ];

        // Send email notification for scheduled lessons
        if ($action === 'scheduled' && $student) {
            try {
                Mail::to($student->email)->send(new LessonScheduled($schedule));
            } catch (\Exception $e) {
                \Log::warning('Failed to send lesson scheduled email', [
                    'student_email' => $student->email,
                    'schedule_id' => $schedule->id,
                    'error' => $e->getMessage()
                ]);
                // Continue execution even if email fails
            }
        }
        
        // Schedule reminder email for 24 hours before the lesson (only once per schedule)
        if ($action === 'scheduled' && !$schedule->reminder_sent_at) {
            try {
                $reminderTime = $schedule->scheduled_at->copy()->subHours(24);
                if ($reminderTime->isFuture()) {
                    SendLessonReminder::dispatch($schedule)->delay($reminderTime);
                }
            } catch (\Exception $e) {
                \Log::warning('Failed to schedule lesson reminder', [
                    'schedule_id' => $schedule->id,
                    'error' => $e->getMessage()
                ]);
                // Continue execution even if reminder scheduling fails
            }
        }

        return $this->createWithTranslationKeys(
            $titleKeys[$action] ?? 'notifications.class_update',
            $messageKeys[$action] ?? 'notifications.class_schedule_updated',
            'schedule',
            $translationData,
            [
                'action' => $action,
                'schedule_id' => $schedule->id,
                'student_name' => $student->name,
                'student_id' => (int) $student->id,
                'admin_name' => $admin->name,
                'admin_id' => $admin->id,
                'title' => $schedule->title,
                'scheduled_at' => $schedule->scheduled_at->toISOString(),
                'duration_minutes' => $schedule->duration_minutes,
                'type' => $schedule->type,
                'program_name' => $schedule->program?->name,
                'lesson_title' => $schedule->lesson?->title,
                'meeting_link' => $schedule->meeting_link,
                'location' => $schedule->location,
            ],
            $schedule,
            $admin
        );
    }

    /**
     * Create next lesson notification for students
     */
    public function createNextLessonNotification(
        User $student,
        \App\Models\Lesson $nextLesson,
        \App\Models\Program $program,
        ?\App\Models\ClassSchedule $nextClass = null
    ): Notification {
        $message = __('app.notifications.next_lesson_message', [
            'lesson' => $nextLesson->title,
            'program' => $program->name
        ]);
        
        if ($nextClass && $nextClass->meeting_link) {
            $message .= ' ' . __('app.notifications.next_lesson_with_class', [
                'time' => $nextClass->getFormattedScheduledTime()
            ]);
        }

        return $this->create(
            __('app.notifications.next_lesson_available'),
            $message,
            'lesson',
            [
                'lesson_id' => $nextLesson->id,
                'lesson_title' => $nextLesson->title,
                'program_id' => $program->id,
                'program_name' => $program->name,
                'student_id' => (int) $student->id,
                'student_name' => $student->name,
                'next_class' => $nextClass ? [
                    'id' => $nextClass->id,
                    'title' => $nextClass->title,
                    'scheduled_at' => $nextClass->scheduled_at->toDateTimeString(),
                    'meeting_link' => $nextClass->meeting_link,
                    'admin_name' => $nextClass->admin->name,
                ] : null,
            ],
            $nextLesson,
            null
        );
    }

    /**
     * Get notifications for student
     */
    public function getForStudent(User $student): array
    {
        $notifications = Notification::whereIn('type', ['schedule', 'lesson'])
            ->where(function ($query) use ($student) {
                $query->whereJsonContains('data->student_id', (int) $student->id);
            })
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $unreadCount = Notification::whereIn('type', ['schedule', 'lesson'])
            ->where(function ($query) use ($student) {
                $query->whereJsonContains('data->student_id', (int) $student->id);
            })
            ->unread()
            ->count();

        return [
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ];
    }

    /**
     * Mark all notifications for a specific student as read
     */
    public function markAllAsReadForStudent(User $student): int
    {
        return Notification::whereIn('type', ['schedule', 'lesson'])
            ->where(function ($query) use ($student) {
                $query->whereJsonContains('data->student_id', (int) $student->id);
            })
            ->unread()
            ->update(['is_read' => true]);
    }

    /**
     * Get notifications for admin dashboard
     */
    public function getForAdminDashboard(): array
    {
        return [
            'recent' => $this->getAll(10),
            'unread_count' => $this->getUnreadCount(),
            'pending_enrollments' => $this->getByType('enrollment')->where('data.action', 'pending'),
        ];
    }
}