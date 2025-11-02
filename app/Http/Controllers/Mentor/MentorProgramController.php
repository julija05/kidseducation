<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MentorProgramController extends Controller
{
    /**
     * Display the mentor's view of a specific program.
     * Shows enrolled students, program content, and teaching tools.
     */
    public function show(Program $program): Response
    {
        $user = auth()->user();

        // Verify mentor is enrolled in this program as a mentor
        $mentorEnrollment = $user->enrollments()
            ->where('program_id', $program->id)
            ->where('enrollment_type', 'mentor')
            ->where('approval_status', 'approved')
            ->first();

        if (!$mentorEnrollment) {
            abort(403, 'You are not authorized to teach this program.');
        }

        // Get students enrolled in this program
        $students = Enrollment::where('program_id', $program->id)
            ->where('enrollment_type', 'student')
            ->where('approval_status', 'approved')
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'created_at');
                },
            ])
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->user->id,
                    'name' => $enrollment->user->name,
                    'email' => $enrollment->user->email,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'progress' => $enrollment->progress,
                    'status' => $enrollment->status,
                    'quiz_points' => $enrollment->quiz_points,
                    'highest_unlocked_level' => $enrollment->highest_unlocked_level,
                ];
            });

        // Get program details with lessons
        $programData = [
            'id' => $program->id,
            'name' => $program->name,
            'slug' => $program->slug,
            'description' => $program->description,
            'icon' => $program->icon,
            'color' => $program->color,
            'lessons_count' => $program->lessons()->count(),
        ];

        // Get program lessons grouped by level
        $lessons = $program->lessons()
            ->active()
            ->ordered()
            ->get()
            ->groupBy('level')
            ->map(function ($levelLessons) {
                return $levelLessons->map(function ($lesson) {
                    return [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'description' => $lesson->description,
                        'level' => $lesson->level,
                        'order_in_level' => $lesson->order_in_level,
                        'resources_count' => $lesson->resources()->count(),
                    ];
                });
            });

        return Inertia::render('Mentor/ProgramView', [
            'program' => $programData,
            'students' => $students,
            'lessons' => $lessons,
            'mentorEnrollment' => [
                'id' => $mentorEnrollment->id,
                'enrolled_at' => $mentorEnrollment->enrolled_at,
                'status' => $mentorEnrollment->status,
            ],
        ]);
    }
}
