<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\ClassSchedule;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

abstract class Controller
{
    protected Collection $programs;
    protected array $cachedControllerData = [];
    protected array $templateValues = [];

    public function __construct()
    {
        $this->setCachedControllerData();
        $this->setUpAllPrograms();
    }



    private function getCachedControllerDataForPrograms(): Collection
    {
        return Cache::rememberForever('controllerData.programs', function () {
            return Program::all()->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'description' => $program->description,
                    'price' => number_format($program->price, 2),
                    'duration' => $program->duration,
                    'image' => $program->image ? asset('storage/' . $program->image) : null,
                ];
            });
        });
    }

    protected function setCachedControllerData(): void
    {
        $this->cachedControllerData['programs'] = $this->getCachedControllerDataForPrograms();
    }

    /**
     * Takes data from cache by filtering cachedControllerData['programs']
     * @return void
     */
    private function setUpAllPrograms(): void
    {
        $this->templateValues['programs'] = $this->cachedControllerData['programs']
            ->sortBy('name')
            ->values()
            ->toArray();
    }

    protected function createView(string $templateName, array $values = [])
    {
        $template = $this->templateValues;
        
        // Add notifications for admin pages
        if (str_starts_with($templateName, 'Admin/') && auth()->check()) {
            $notificationService = new NotificationService();
            $template['notifications'] = $notificationService->getForAdminDashboard();
        }
        
        // Add notifications for student pages (only if not already provided)
        if (auth()->check() && auth()->user()->hasRole('student') && !isset($values['notifications'])) {
            $user = auth()->user();
            
            // Get student notifications (schedule-related)
            $notifications = Notification::where('type', 'schedule')
                ->whereJsonContains('data->student_id', (int) $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($notification) {
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

            // Get unread notification count
            $unreadNotificationCount = Notification::where('type', 'schedule')
                ->whereJsonContains('data->student_id', (int) $user->id)
                ->unread()
                ->count();

            $template['notifications'] = $notifications;
            $template['unreadNotificationCount'] = $unreadNotificationCount;
        }
        
        return Inertia::render($templateName, array_merge($template, $values));
    }
}
