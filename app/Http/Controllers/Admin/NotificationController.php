<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Display all notifications
     */
    public function index(Request $request): Response
    {
        $type = $request->get('type', 'all');
        $limit = $request->get('limit', 50);

        if ($type === 'all') {
            $notifications = $this->notificationService->getAll($limit);
        } else {
            $notifications = $this->notificationService->getByType($type, $limit);
        }

        return $this->createView('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'unread_count' => $this->notificationService->getUnreadCount(),
            'current_type' => $type,
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Notification $notification)
    {
        $notification->markAsRead();

        if (request()->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return back();
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $this->notificationService->markAllAsRead();

        if (request()->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return back();
    }

    /**
     * Delete a notification
     */
    public function destroy(Notification $notification): RedirectResponse
    {
        $notification->delete();

        return back()->with('success', 'Notification deleted.');
    }

    /**
     * Delete old notifications
     */
    public function cleanup(Request $request): RedirectResponse
    {
        $days = $request->get('days', 30);
        $deletedCount = $this->notificationService->deleteOld($days);

        return back()->with('success', "Deleted {$deletedCount} old notifications.");
    }
}
