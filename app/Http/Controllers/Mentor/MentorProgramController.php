<?php

namespace App\Http\Controllers\Mentor;

use App\Constants\EnrollmentType;
use App\Contracts\EnrollmentRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MentorProgramController extends Controller
{
    public function __construct(
        private EnrollmentRepositoryInterface $enrollmentRepository
    ) {}
    /**
     * Display the mentor's view of a specific program.
     * Shows enrolled students, program content, and teaching tools.
     */
    public function show(Program $program): Response
    {
        $user = auth()->user();

        // Verify mentor is enrolled in this program as a mentor
        $mentorEnrollment = $this->enrollmentRepository->findByUserAndProgram(
            $user->id,
            $program->id,
            EnrollmentType::MENTOR
        );

        if (!$mentorEnrollment) {
            abort(403, 'You are not authorized to teach this program.');
        }

        // Get students enrolled in this program using repository
        $students = $this->enrollmentRepository->getStudentsInProgram($program->id)
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

        // Get program lessons grouped by level with resources
        $lessons = $program->lessons()
            ->active()
            ->ordered()
            ->with(['resources' => function ($query) {
                $query->orderBy('order');
            }])
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
                        'resources' => $lesson->resources->map(function ($resource) {
                            return [
                                'id' => $resource->id,
                                'title' => $resource->title,
                                'description' => $resource->description,
                                'type' => $resource->type,
                                'resource_type' => $resource->type, // For backward compatibility
                                'resource_url' => $resource->resource_url,
                                'youtube_url' => $resource->resource_url, // For backward compatibility
                                'file_path' => $resource->file_path,
                                'file_name' => $resource->file_name,
                                'mime_type' => $resource->mime_type,
                                'is_downloadable' => $resource->is_downloadable,
                                'order' => $resource->order,
                            ];
                        }),
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
