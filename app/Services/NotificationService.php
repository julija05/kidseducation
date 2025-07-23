<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

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
     * Create enrollment notification for admins
     */
    public function createEnrollmentNotification(
        \App\Models\Enrollment $enrollment,
        string $action = 'pending'
    ): Notification {
        $user = $enrollment->user;
        $program = $enrollment->program;

        $titles = [
            'pending' => 'New Enrollment Request',
            'approved' => 'Enrollment Approved',
            'rejected' => 'Enrollment Rejected',
        ];

        $messages = [
            'pending' => "{$user->name} has requested enrollment in the \"{$program->name}\" program.",
            'approved' => "{$user->name}'s enrollment in \"{$program->name}\" has been approved.",
            'rejected' => "{$user->name}'s enrollment in \"{$program->name}\" has been rejected.",
        ];

        return $this->create(
            $titles[$action] ?? 'Enrollment Update',
            $messages[$action] ?? 'An enrollment has been updated.',
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