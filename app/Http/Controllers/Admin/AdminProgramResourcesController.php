<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\Lesson;
use App\Models\LessonResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminProgramResourcesController extends Controller
{
    /**
     * Create a view response.
     */
    protected function createView(string $component, array $props = [])
    {
        return Inertia::render($component, $props);
    }

    /**
     * Display program resources overview
     */
    public function index()
    {
        try {
            $programs = Program::with(['lessons' => function ($query) {
                $query->withCount('resources')
                    ->orderBy('level', 'asc')
                    ->orderBy('order_in_level', 'asc');
            }])
                ->withCount('lessons')
                ->get();

            $stats = [
                'totalPrograms' => $programs->count(),
                'totalLessons' => Lesson::count(),
                'totalResources' => LessonResource::count(),
                'resourcesByType' => LessonResource::selectRaw('type, count(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray(),
            ];

            // Ensure all programs have a lessons array AND include slug
            $programsArray = $programs->map(function ($program) {
                return [
                    'id' => $program->id,
                    'slug' => $program->slug, // ADD SLUG HERE
                    'name' => $program->name,
                    'description' => $program->description,
                    'lessons_count' => $program->lessons_count,
                    'lessons' => $program->lessons ? $program->lessons->map(function ($lesson) {
                        return [
                            'id' => $lesson->id,
                            'title' => $lesson->title,
                            'level' => $lesson->level ?? 1,
                            'resources_count' => $lesson->resources_count ?? 0,
                        ];
                    })->toArray() : [],
                ];
            })->toArray();

            return $this->createView('Admin/Resources/Index', [
                'programs' => $programsArray,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in AdminProgramResourcesController@index: ' . $e->getMessage());

            return $this->createView('Admin/Resources/Index', [
                'programs' => [],
                'stats' => [
                    'totalPrograms' => 0,
                    'totalLessons' => 0,
                    'totalResources' => 0,
                    'resourcesByType' => [],
                ],
                'error' => 'Failed to load programs data.'
            ]);
        }
    }

    /**
     * Show resources for a specific program
     */
    public function show(Program $program)
    {
        try {

            // Load lessons with their resources
            $program->load(['lessons' => function ($query) {
                $query->with(['resources' => function ($q) {
                    $q->orderBy('order', 'asc');
                }])
                    ->orderBy('level', 'asc')
                    ->orderBy('order_in_level', 'asc');
            }]);

            // Initialize stats
            $resourceStats = [
                'totalResources' => 0,
                'videoCount' => 0,
                'documentCount' => 0,
                'quizCount' => 0,
            ];

            // Calculate stats if lessons exist
            if ($program->lessons) {
                foreach ($program->lessons as $lesson) {
                    if ($lesson->resources) {
                        $resourceStats['totalResources'] += $lesson->resources->count();
                        $resourceStats['videoCount'] += $lesson->resources->where('type', 'video')->count();
                        $resourceStats['documentCount'] += $lesson->resources->where('type', 'document')->count();
                        $resourceStats['quizCount'] += $lesson->resources->where('type', 'quiz')->count();
                    }
                }
            }

            // Convert to array and ensure structure
            $programData = [
                'id' => $program->id,
                'slug' => $program->slug, // ADD SLUG HERE
                'name' => $program->name,
                'description' => $program->description,
                'lessons' => []
            ];

            // Add lessons if they exist
            if ($program->lessons) {
                $programData['lessons'] = $program->lessons->map(function ($lesson) {
                    return [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'description' => $lesson->description,
                        'level' => $lesson->level ?? 1,
                        'order_in_level' => $lesson->order_in_level ?? 1,
                        'resources' => $lesson->resources ? $lesson->resources->toArray() : []
                    ];
                })->toArray();
            }

            return $this->createView('Admin/Resources/ProgramResources', [
                'program' => $programData,
                'resourceStats' => $resourceStats,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in AdminProgramResourcesController@show: ' . $e->getMessage());

            return $this->createView('Admin/Resources/ProgramResources', [
                'program' => [
                    'id' => $program->id,
                    'slug' => $program->slug, // ADD SLUG HERE
                    'name' => $program->name,
                    'lessons' => []
                ],
                'resourceStats' => [
                    'totalResources' => 0,
                    'videoCount' => 0,
                    'documentCount' => 0,
                    'quizCount' => 0,
                ],
                'error' => 'Failed to load program resources.'
            ]);
        }
    }

    /**
     * Quick add resource form
     */
    public function quickAdd(Program $program)
    {
        try {

            $program->load(['lessons' => function ($query) {
                $query->orderBy('level', 'asc')
                    ->orderBy('order_in_level', 'asc');
            }]);

            $lessons = $program->lessons ? $program->lessons->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'level' => $lesson->level ?? 1,
                ];
            })->toArray() : [];

            return $this->createView('Admin/Resources/QuickAdd', [
                'program' => [
                    'id' => $program->id,
                    'slug' => $program->slug, // ADD SLUG HERE
                    'name' => $program->name,
                ],
                'lessons' => $lessons,
                'resourceTypes' => [
                    'video' => 'Video (YouTube, Vimeo, etc.)',
                    'document' => 'Document (PDF, Word, etc.)',
                    'link' => 'External Link',
                    'download' => 'Downloadable File',
                    'interactive' => 'Interactive Content',
                    'quiz' => 'Quiz/Assessment',
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in AdminProgramResourcesController@quickAdd: ' . $e->getMessage());

            return redirect()
                ->route('admin.resources.program.show', $program)
                ->with('error', 'Failed to load quick add form.');
        }
    }

    /**
     * Store resource via quick add
     */
    public function storeQuickAdd(Request $request, Program $program)
    {
        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:video,document,link,download,interactive,quiz',
            'resource_url' => 'nullable|url',
            'file' => 'nullable|file|max:102400',
            'is_required' => 'boolean',
            'is_downloadable' => 'boolean',
        ]);

        // Verify lesson belongs to program
        $lesson = Lesson::where('id', $validated['lesson_id'])
            ->where('program_id', $program->id)
            ->firstOrFail();

        // Get the next order number
        $nextOrder = $lesson->resources()->max('order') ?? 0;
        $nextOrder++;

        $resourceData = [
            'lesson_id' => $lesson->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'resource_url' => $validated['resource_url'],
            'order' => $nextOrder,
            'is_downloadable' => $validated['is_downloadable'] ?? false,
            'is_required' => $validated['is_required'] ?? true,
        ];

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('lesson-resources/' . $lesson->id);

            $resourceData['file_path'] = $path;
            $resourceData['file_name'] = $file->getClientOriginalName();
            $resourceData['file_size'] = $file->getSize();
            $resourceData['mime_type'] = $file->getMimeType();
        }

        // Handle specific resource type metadata
        if ($validated['type'] === 'quiz') {
            $resourceData['metadata'] = [
                'quiz_type' => $request->input('quiz_type', 'multiple_choice'),
                'passing_score' => $request->input('passing_score', 70),
                'time_limit' => $request->input('time_limit'),
                'attempts_allowed' => $request->input('attempts_allowed', 3),
            ];
        }

        LessonResource::create($resourceData);

        return redirect()
            ->route('admin.resources.program.show', $program)
            ->with('success', 'Resource added successfully to ' . $lesson->title);
    }

    /**
     * Bulk import resources
     */
    public function bulkImport(Request $request, Program $program)
    {
        $validated = $request->validate([
            'import_file' => 'required|file|mimes:csv,xlsx',
        ]);

        // Process the import file
        // This is a placeholder - you'd implement the actual import logic

        return redirect()
            ->route('admin.resources.program.show', $program)
            ->with('success', 'Resources imported successfully');
    }

    /**
     * Get resource templates
     */
    public function templates()
    {
        $templates = [
            'video' => [
                [
                    'name' => 'Introduction Video',
                    'description' => 'Welcome and course overview video',
                    'suggested_duration' => '5-10 minutes',
                ],
                [
                    'name' => 'Tutorial Video',
                    'description' => 'Step-by-step instructional video',
                    'suggested_duration' => '10-20 minutes',
                ],
            ],
            'document' => [
                [
                    'name' => 'Course Syllabus',
                    'description' => 'Detailed course outline and objectives',
                ],
                [
                    'name' => 'Reading Material',
                    'description' => 'Supplementary reading documents',
                ],
                [
                    'name' => 'Worksheet',
                    'description' => 'Practice exercises and activities',
                ],
            ],
            'quiz' => [
                [
                    'name' => 'Pre-Assessment',
                    'description' => 'Test prior knowledge before the lesson',
                ],
                [
                    'name' => 'Practice Quiz',
                    'description' => 'Reinforce learning with practice questions',
                ],
                [
                    'name' => 'Final Assessment',
                    'description' => 'Evaluate understanding of the material',
                ],
            ],
        ];

        return $this->createView('Admin/Resources/Templates', [
            'templates' => $templates,
        ]);
    }
}
