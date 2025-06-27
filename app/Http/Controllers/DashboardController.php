<?php

// app/Http/Controllers/DashboardController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Program;
use App\Models\Lesson;
use App\Models\LessonProgress;

class DashboardController extends Controller
{

    public function index(Request $request)
    {
        $user = $request->user();
        $programs = Program::all();
        // Get approved enrollment if exists
        $approvedEnrollment = $user->enrollments()
            ->with('program')
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
        // Calculate next class if you have that functionality
        // $nextClass = $this->calculateNextClass($enrollment->program_id);

        return Inertia::render('Dashboard', [
            'enrolledProgram' => [
                'id' => $enrollment->program->id,
                'slug' => $enrollment->program->slug,
                'name' => $enrollment->program->name,
                'description' => $enrollment->program->description,
                'theme' => [
                    'icon' => $enrollment->program->icon,
                    'color' => $enrollment->program->color,
                    'lightColor' => $enrollment->program->light_color,
                    'borderColor' => $enrollment->program->border_color,
                    'textColor' => $enrollment->program->text_color,
                ],
                'progress' => round($enrollment->progress, 0),
                'status' => $enrollment->status,
                'approvalStatus' => $enrollment->approval_status,
                'enrolledAt' => $enrollment->enrolled_at->format('M d, Y'),
                // Removed lessons and resources
            ],
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
        $availablePrograms = $this->getAvailablePrograms($user);

        return $this->createView('Dashboard', [
            'enrolledProgram' => null,
            'pendingEnrollments' => $formattedPending,
            'availablePrograms' => $availablePrograms,
            'nextClass' => null,
        ]);
    }

    private function renderProgramSelection($user, $request)
    {
        $availablePrograms = $this->getAvailablePrograms($user);

        // Check if user was redirected from registration with a program intent
        $pendingProgramId = session('pending_enrollment_program_id');
        if ($pendingProgramId) {
            session()->forget('pending_enrollment_program_id');
        }

        return Inertia::render('Dashboard', [
            'enrolledProgram' => null,
            'pendingEnrollments' => [],
            'availablePrograms' => $availablePrograms,
            'nextClass' => null,
            'pendingProgramId' => $pendingProgramId,
        ]);
    }

    private function getAvailablePrograms($user)
    {
        // Get all active programs
        $programs = Program::where('is_active', true)->get();

        // Get user's enrollment program IDs
        $enrolledProgramIds = $user->enrollments()->pluck('program_id');

        return $programs->map(function ($program) use ($enrolledProgramIds) {
            return [
                'id' => $program->id,
                'name' => $program->name,
                'slug' => $program->slug,
                'description' => $program->description,
                'duration' => $program->duration,
                'price' => $program->price,
                'icon' => $program->icon,
                'color' => $program->color,
                'lightColor' => $program->light_color,
                'borderColor' => $program->border_color,
                'textColor' => $program->text_color,
                // Removed lessonsCount
                'isEnrolled' => $enrolledProgramIds->contains($program->id),
            ];
        });
    }

    // private function calculateNextClass($programId)
    // {
    //     // Check if there are scheduled classes for this program
    //     $schedules = \App\Models\ClassSchedule::where('program_id', $programId)
    //         ->where('is_active', true)
    //         ->get();

    //     if ($schedules->isEmpty()) {
    //         return null;
    //     }

    //     $now = Carbon::now();
    //     $nextClass = null;

    //     foreach ($schedules as $schedule) {
    //         $dayOfWeek = $this->getDayNumber($schedule->day_of_week);
    //         $classTime = Carbon::parse($schedule->start_time);

    //         // Calculate next occurrence of this class
    //         $nextPossible = $now->copy()->next($dayOfWeek)
    //             ->setTime($classTime->hour, $classTime->minute, 0);

    //         // If it's today and the time hasn't passed, use today
    //         if (
    //             $now->dayOfWeek === $dayOfWeek &&
    //             $now->lt($now->copy()->setTime($classTime->hour, $classTime->minute, 0))
    //         ) {
    //             $nextPossible = $now->copy()->setTime($classTime->hour, $classTime->minute, 0);
    //         }

    //         if (!$nextClass || $nextPossible->lt($nextClass)) {
    //             $nextClass = $nextPossible;
    //         }
    //     }

    //     return $nextClass ? $nextClass->format('Y-m-d h:i A') : null;
    // }

    //     private function getDayNumber($dayName)
    //     {
    //         $days = [
    //             'sunday' => 0,
    //             'monday' => 1,
    //             'tuesday' => 2,
    //             'wednesday' => 3,
    //             'thursday' => 4,
    //             'friday' => 5,
    //             'saturday' => 6,
    //         ];

    //         return $days[strtolower($dayName)] ?? 0;
    //     }

    //     public function startLesson(Request $request, $lessonId)
    //     {
    //         $user = $request->user();
    //         $lesson = Lesson::findOrFail($lessonId);

    //         // Check if user is enrolled and approved
    //         $enrollment = $user->enrollments()
    //             ->where('program_id', $lesson->program_id)
    //             ->where('status', 'active')
    //             ->where('approval_status', 'approved')
    //             ->first();

    //         if (!$enrollment) {
    //             return response()->json(['error' => 'Not enrolled or approved in this program'], 403);
    //         }

    //         // Create or update lesson progress
    //         $progress = LessonProgress::firstOrCreate(
    //             [
    //                 'user_id' => $user->id,
    //                 'lesson_id' => $lessonId,
    //             ],
    //             [
    //                 'status' => 'not_started',
    //             ]
    //         );

    //         $progress->update([
    //             'status' => 'in_progress',
    //             'started_at' => $progress->started_at ?? now(),
    //         ]);

    //         return response()->json(['success' => true, 'progress' => $progress]);
    //     }

    //     public function completeLesson(Request $request, $lessonId)
    //     {
    //         $user = $request->user();
    //         $lesson = Lesson::findOrFail($lessonId);

    //         // Check enrollment and approval
    //         $enrollment = $user->enrollments()
    //             ->where('program_id', $lesson->program_id)
    //             ->where('status', 'active')
    //             ->where('approval_status', 'approved')
    //             ->first();

    //         if (!$enrollment) {
    //             return response()->json(['error' => 'Not enrolled or approved in this program'], 403);
    //         }

    //         // Update lesson progress
    //         $progress = LessonProgress::updateOrCreate(
    //             [
    //                 'user_id' => $user->id,
    //                 'lesson_id' => $lessonId,
    //             ],
    //             [
    //                 'status' => 'completed',
    //                 'completed_at' => now(),
    //                 'score' => $request->score ?? null,
    //             ]
    //         );

    //         // Update enrollment progress
    //         $enrollment->updateProgress();

    //         return response()->json([
    //             'success' => true,
    //             'progress' => $progress,
    //             'enrollment_progress' => $enrollment->progress
    //         ]);
    //     }
}
