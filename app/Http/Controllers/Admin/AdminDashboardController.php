<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Program;
use App\Models\ClassSchedule;
use Illuminate\Http\Request;


class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        $admin = $request->user();
        
        $pendingEnrollmentsCount = Enrollment::where('approval_status', 'pending')->count();

        $stats = [
            'totalStudents' => User::role('student')->count(),
            'activePrograms' => Program::where('is_active', true)->count(),
            'activeEnrollments' => Enrollment::where('approval_status', 'approved')
                ->where('status', 'active')
                ->count(),
        ];

        // Get next scheduled lesson for this admin
        $nextScheduledLesson = ClassSchedule::with(['student', 'program', 'lesson'])
            ->where('admin_id', $admin->id)
            ->upcoming()
            ->orderBy('scheduled_at', 'asc')
            ->first();

        // Format next lesson data if it exists
        $formattedNextLesson = null;
        if ($nextScheduledLesson) {
            $scheduledAt = $nextScheduledLesson->scheduled_at;
            $dayName = $scheduledAt->isToday() ? 'today' : 
                      ($scheduledAt->isTomorrow() ? 'tomorrow' : $scheduledAt->format('l'));
            
            $formattedNextLesson = [
                'id' => $nextScheduledLesson->id,
                'title' => $nextScheduledLesson->title,
                'description' => $nextScheduledLesson->description,
                'student_name' => $nextScheduledLesson->student->name,
                'program_name' => $nextScheduledLesson->program ? $nextScheduledLesson->program->name : null,
                'lesson_name' => $nextScheduledLesson->lesson ? $nextScheduledLesson->lesson->title : null,
                'scheduled_at' => $nextScheduledLesson->scheduled_at,
                'formatted_time' => $nextScheduledLesson->getFormattedScheduledTime(),
                'day_description' => $dayName,
                'time_only' => $scheduledAt->format('g:i A'),
                'duration' => $nextScheduledLesson->getFormattedDuration(),
                'type' => $nextScheduledLesson->getTypeLabel(),
                'location' => $nextScheduledLesson->location,
                'meeting_link' => $nextScheduledLesson->meeting_link,
                'status' => $nextScheduledLesson->status,
            ];
        }

        return $this->createView('Admin/AdminDashboard/AdminDashboard', [
            'pendingEnrollmentsCount' => $pendingEnrollmentsCount,
            'stats' => $stats,
            'nextScheduledLesson' => $formattedNextLesson
        ]);
    }
}
