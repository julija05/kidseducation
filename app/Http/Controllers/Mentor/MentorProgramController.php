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

        // Get only students assigned to this mentor in this program
        $students = $this->enrollmentRepository->getStudentsForMentor($user, [$program->id])
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

    /**
     * Show program content overview for mentor who created/proposed it
     */
    public function showContent(Program $program): Response
    {
        $user = auth()->user();

        // Check if the mentor owns this program
        if ($program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Load program with all content
        $program->load(['lessons.resources', 'lessons.quizzes.questions']);

        // Organize lessons by level
        $lessonsByLevel = $program->lessons->groupBy('level')->map(function ($lessons, $level) {
            return [
                'level' => $level,
                'lessons' => $lessons->map(function ($lesson) {
                    return [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'description' => $lesson->description,
                        'order_in_level' => $lesson->order_in_level,
                        'resources_count' => $lesson->resources->count(),
                        'quizzes_count' => $lesson->quizzes->count(),
                        'resources' => $lesson->resources->map(function ($resource) {
                            return [
                                'id' => $resource->id,
                                'title' => $resource->title,
                                'description' => $resource->description,
                                'type' => $resource->type,
                                'order' => $resource->order,
                                'resource_url' => $resource->resource_url,
                                'file_path' => $resource->file_path,
                                'file_name' => $resource->file_name,
                                'file_size' => $resource->file_size,
                                'mime_type' => $resource->mime_type,
                                'is_downloadable' => $resource->is_downloadable,
                            ];
                        }),
                        'quizzes' => $lesson->quizzes->map(function ($quiz) {
                            return [
                                'id' => $quiz->id,
                                'title' => $quiz->title,
                                'type' => $quiz->type,
                                'questions_count' => $quiz->questions->count(),
                                'is_active' => $quiz->is_active,
                            ];
                        }),
                    ];
                })->sortBy('order_in_level')->values(),
            ];
        })->sortBy('level')->values();

        return Inertia::render('Mentor/ProgramContent', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'slug' => $program->slug,
                'description' => $program->description,
                'approval_status' => $program->approval_status,
                'can_add_content' => $program->canAddContent(),
                'can_submit_for_review' => $program->isInContentDevelopment() && $program->lessons->count() > 0,
            ],
            'lessonsByLevel' => $lessonsByLevel,
            'totalLessons' => $program->lessons->count(),
            'totalResources' => $program->lessons->sum(function ($lesson) {
                return $lesson->resources->count();
            }),
            'totalQuizzes' => $program->lessons->sum(function ($lesson) {
                return $lesson->quizzes->count();
            }),
        ]);
    }
}
