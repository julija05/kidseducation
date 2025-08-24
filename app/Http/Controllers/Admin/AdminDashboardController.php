<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassSchedule;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
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

        // Get next scheduled lesson for this admin - with safety check
        $formattedNextLesson = null;
        try {
            // Check if ClassSchedule table exists before querying
            if (\Schema::hasTable('class_schedules')) {
                $nextScheduledLesson = ClassSchedule::with(['student', 'students', 'program', 'lesson'])
                    ->where('admin_id', $admin->id)
                    ->upcoming()
                    ->orderBy('scheduled_at', 'asc')
                    ->first();

                // Format next lesson data if it exists
                if ($nextScheduledLesson) {
                    $scheduledAt = $nextScheduledLesson->scheduled_at;
                    $dayName = $scheduledAt->isToday() ? 'today' :
                              ($scheduledAt->isTomorrow() ? 'tomorrow' : $scheduledAt->format('l'));

                    // Get student name(s) - handle both individual and group classes
                    $studentName = 'No student assigned';
                    if ($nextScheduledLesson->is_group_class) {
                        $students = $nextScheduledLesson->students;
                        if ($students->count() > 0) {
                            $studentName = $students->count() === 1
                                ? $students->first()->name
                                : $students->count().' students';
                        }
                    } elseif ($nextScheduledLesson->student) {
                        $studentName = $nextScheduledLesson->student->name;
                    }

                    $formattedNextLesson = [
                        'id' => $nextScheduledLesson->id,
                        'title' => $nextScheduledLesson->title,
                        'description' => $nextScheduledLesson->description,
                        'student_name' => $studentName,
                        'program_name' => $nextScheduledLesson->program?->name,
                        'lesson_name' => $nextScheduledLesson->lesson?->title,
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
            }
        } catch (\Exception $e) {
            // Log the error but don't break the dashboard
            \Log::warning('ClassSchedule query failed in AdminDashboard', [
                'error' => $e->getMessage(),
                'admin_id' => $admin->id,
            ]);
        }

        return $this->createView('Admin/AdminDashboard/AdminDashboard', [
            'pendingEnrollmentsCount' => $pendingEnrollmentsCount,
            'stats' => $stats,
            'nextScheduledLesson' => $formattedNextLesson,
        ]);
    }
}
