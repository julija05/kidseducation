<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminLessonController extends Controller
{
    /**
     * Display lessons for a specific program
     */
    public function index(Program $program)
    {
        $program->load(['lessons' => function ($query) {
            $query->with('resources')
                ->orderBy('level', 'asc')
                ->orderBy('order_in_level', 'asc');
        }]);

        // Group lessons by level
        $lessonsByLevel = $program->lessons->groupBy('level')->map(function ($lessons, $level) {
            return [
                'level' => $level,
                'lessons' => $lessons->map(function ($lesson) {
                    return [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'description' => $lesson->description,
                        'content_type' => $lesson->content_type,
                        'content_type_display' => $lesson->content_type_display,
                        'duration_minutes' => $lesson->duration_minutes,
                        'formatted_duration' => $lesson->formatted_duration,
                        'order_in_level' => $lesson->order_in_level,
                        'is_active' => $lesson->is_active,
                        'resources_count' => $lesson->resources->count(),
                        'created_at' => $lesson->created_at,
                    ];
                })->values(),
            ];
        })->values();

        return Inertia::render('Admin/Programs/Lessons/Index', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'slug' => $program->slug,
                'description' => $program->description,
            ],
            'lessonsByLevel' => $lessonsByLevel,
            'availableLevels' => range(1, 10), // Allow up to 10 levels
        ]);
    }

    /**
     * Show the form for creating a new lesson
     */
    public function create(Program $program, Request $request)
    {
        $selectedLevel = $request->get('level', 1);

        // Get next order number for the selected level
        $nextOrderInLevel = $program->lessons()
            ->where('level', $selectedLevel)
            ->max('order_in_level') + 1;

        return Inertia::render('Admin/Programs/Lessons/Create', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'slug' => $program->slug,
            ],
            'selectedLevel' => $selectedLevel,
            'nextOrderInLevel' => $nextOrderInLevel,
            'availableLevels' => range(1, 10),
            'contentTypes' => [
                'video' => 'Video',
                'text' => 'Reading',
                'interactive' => 'Interactive',
                'quiz' => 'Quiz',
                'mixed' => 'Mixed Content',
            ],
        ]);
    }

    /**
     * Store a newly created lesson
     */
    public function store(Request $request, Program $program)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'level' => 'required|integer|min:1|max:10',
            'content_type' => ['required', Rule::in(['video', 'text', 'interactive', 'quiz', 'mixed'])],
            'content_url' => 'nullable|url',
            'content_body' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:1|max:480', // Max 8 hours
            'order_in_level' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        // If order_in_level is not provided, set it to the next available
        if (! isset($validated['order_in_level'])) {
            $validated['order_in_level'] = $program->lessons()
                ->where('level', $validated['level'])
                ->max('order_in_level') + 1;
        }

        $validated['program_id'] = $program->id;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $lesson = Lesson::create($validated);

        return redirect()
            ->route('admin.programs.lessons.index', $program)
            ->with('success', "Lesson '{$lesson->title}' created successfully!");
    }

    /**
     * Show the form for editing a lesson
     */
    public function edit(Program $program, Lesson $lesson)
    {

        // Ensure lesson belongs to the program
        if ($lesson->program_id != $program->id) {
            abort(404);
        }

        return Inertia::render('Admin/Programs/Lessons/Edit', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'slug' => $program->slug,
            ],
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'level' => $lesson->level,
                'content_type' => $lesson->content_type,
                'content_url' => $lesson->content_url,
                'content_body' => $lesson->content_body,
                'duration_minutes' => $lesson->duration_minutes,
                'order_in_level' => $lesson->order_in_level,
                'is_active' => $lesson->is_active,
            ],
            'availableLevels' => range(1, 10),
            'contentTypes' => [
                'video' => 'Video',
                'text' => 'Reading',
                'interactive' => 'Interactive',
                'quiz' => 'Quiz',
                'mixed' => 'Mixed Content',
            ],
        ]);
    }

    /**
     * Update the specified lesson
     */
    public function update(Request $request, Program $program, Lesson $lesson)
    {
        // Ensure lesson belongs to the program
        if ($lesson->program_id != $program->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'level' => 'required|integer|min:1|max:10',
            'content_type' => ['required', Rule::in(['video', 'text', 'interactive', 'quiz', 'mixed'])],
            'content_url' => 'nullable|url',
            'content_body' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:1|max:480',
            'order_in_level' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $lesson->update($validated);

        return redirect()
            ->route('admin.programs.lessons.index', $program)
            ->with('success', "Lesson '{$lesson->title}' updated successfully!");
    }

    /**
     * Remove the specified lesson
     */
    public function destroy(Program $program, Lesson $lesson)
    {
        // Ensure lesson belongs to the program
        if ($lesson->program_id != $program->id) {
            abort(404);
        }

        $lessonTitle = $lesson->title;
        $lesson->delete();

        return redirect()
            ->route('admin.programs.lessons.index', $program)
            ->with('success', "Lesson '{$lessonTitle}' deleted successfully!");
    }

    /**
     * Reorder lessons within levels
     */
    public function reorder(Request $request, Program $program)
    {
        $validated = $request->validate([
            'lessons' => 'required|array',
            'lessons.*.id' => 'required|exists:lessons,id',
            'lessons.*.level' => 'required|integer|min:1|max:10',
            'lessons.*.order_in_level' => 'required|integer|min:1',
        ]);

        foreach ($validated['lessons'] as $lessonData) {
            Lesson::where('id', $lessonData['id'])
                ->where('program_id', $program->id)
                ->update([
                    'level' => $lessonData['level'],
                    'order_in_level' => $lessonData['order_in_level'],
                ]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Get lessons for a specific level (AJAX endpoint)
     */
    public function getLessonsForLevel(Program $program, int $level)
    {
        $lessons = $program->lessons()
            ->where('level', $level)
            ->orderBy('order_in_level')
            ->get(['id', 'title', 'order_in_level']);

        return response()->json($lessons);
    }
}
