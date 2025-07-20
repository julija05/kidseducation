<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\Lesson;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminQuizController extends Controller
{
    public function index()
    {
        $quizzes = Quiz::with(['lesson.program', 'questions'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Quizzes/Index', [
            'quizzes' => [
                'data' => collect($quizzes->items())->map(fn($quiz) => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'type' => $quiz->type,
                    'type_display' => $quiz->type_display,
                    'lesson' => $quiz->lesson ? [
                        'id' => $quiz->lesson->id,
                        'title' => $quiz->lesson->title,
                        'program' => $quiz->lesson->program ? [
                            'id' => $quiz->lesson->program->id,
                            'title' => $quiz->lesson->program->title,
                        ] : null
                    ] : null,
                    'questions_count' => $quiz->questions->count(),
                    'total_points' => $quiz->total_points,
                    'time_limit' => $quiz->formatted_time_limit,
                    'is_active' => $quiz->is_active,
                    'created_at' => $quiz->created_at->format('M d, Y'),
                ])->toArray(),
            ],
            'pagination' => [
                'current_page' => $quizzes->currentPage(),
                'last_page' => $quizzes->lastPage(),
                'per_page' => $quizzes->perPage(),
                'total' => $quizzes->total(),
            ]
        ]);
    }

    public function create()
    {
        $programs = Program::active()
            ->orderBy('name')
            ->get()
            ->map(fn($program) => [
                'id' => $program->id,
                'name' => $program->name,
                'title' => $program->name,
            ]);

        $lessons = Lesson::with('program')
            ->orderBy('level')
            ->orderBy('order_in_level')
            ->get()
            ->map(fn($lesson) => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'level' => $lesson->level,
                'program_id' => $lesson->program_id,
                'program_title' => $lesson->program->name ?? 'Unknown Program',
                'display_name' => "Level {$lesson->level} - {$lesson->title}",
                'full_display_name' => $lesson->program->name . ' - Level ' . $lesson->level . ' - ' . $lesson->title,
            ]);

        return Inertia::render('Admin/Quizzes/Create', [
            'programs' => $programs,
            'lessons' => $lessons,
            'quiz_types' => [
                'mental_arithmetic' => 'Mental Arithmetic',
                'multiple_choice' => 'Multiple Choice',
                'text_answer' => 'Text Answer',
                'true_false' => 'True/False',
                'mixed' => 'Mixed Questions',
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:mental_arithmetic,multiple_choice,text_answer,true_false,mixed',
            'time_limit' => 'nullable|integer|min:1|max:7200',
            'question_time_limit' => 'nullable|integer|min:1|max:300',
            'max_attempts' => 'required|integer|min:1|max:10',
            'passing_score' => 'required|numeric|min:0|max:100',
            'show_results_immediately' => 'boolean',
            'shuffle_questions' => 'boolean',
            'shuffle_answers' => 'boolean',
            'is_active' => 'boolean',
            'settings' => 'nullable|array',
            'settings.operations' => 'nullable|array',
            'settings.operations.*' => 'string|in:addition,subtraction,multiplication,division',
            'settings.number_range' => 'nullable|array',
            'settings.number_range.min' => 'nullable|integer|min:1|max:999',
            'settings.number_range.max' => 'nullable|integer|min:1|max:999',
            'settings.display_time' => 'nullable|integer|min:2|max:10',
            'settings.numbers_per_session' => 'nullable|integer|min:3|max:15',
            'settings.session_count' => 'nullable|integer|min:1|max:10',
            'settings.allow_negative' => 'nullable|boolean',
            'settings.points_per_session' => 'nullable|integer|min:1|max:100',
        ]);

        $quiz = Quiz::create($validated);

        return redirect()
            ->route('admin.quizzes.show', $quiz)
            ->with('success', 'Quiz created successfully!');
    }

    public function show(Quiz $quiz)
    {
        $quiz->load(['lesson.program', 'questions' => fn($query) => $query->orderBy('order')]);

        return Inertia::render('Admin/Quizzes/Show', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'type' => $quiz->type,
                'type_display' => $quiz->type_display,
                'time_limit' => $quiz->time_limit,
                'formatted_time_limit' => $quiz->formatted_time_limit,
                'question_time_limit' => $quiz->question_time_limit,
                'formatted_question_time_limit' => $quiz->formatted_question_time_limit,
                'max_attempts' => $quiz->max_attempts,
                'passing_score' => $quiz->passing_score,
                'show_results_immediately' => $quiz->show_results_immediately,
                'shuffle_questions' => $quiz->shuffle_questions,
                'shuffle_answers' => $quiz->shuffle_answers,
                'is_active' => $quiz->is_active,
                'settings' => $quiz->settings,
                'total_points' => $quiz->total_points,
                'total_questions' => $quiz->total_questions,
                'lesson' => $quiz->lesson ? [
                    'id' => $quiz->lesson->id,
                    'title' => $quiz->lesson->title,
                    'program' => $quiz->lesson->program ? [
                        'id' => $quiz->lesson->program->id,
                        'title' => $quiz->lesson->program->title,
                    ] : null
                ] : null,
                'questions' => $quiz->questions->map(fn($question) => $question->formatForAdmin()),
                'created_at' => $quiz->created_at->format('M d, Y H:i'),
                'updated_at' => $quiz->updated_at->format('M d, Y H:i'),
            ],
            'quiz_types' => [
                'mental_arithmetic' => 'Mental Arithmetic',
                'multiple_choice' => 'Multiple Choice',
                'text_answer' => 'Text Answer',
                'true_false' => 'True/False',
                'mixed' => 'Mixed Questions',
            ]
        ]);
    }

    public function edit(Quiz $quiz)
    {
        $quiz->load(['lesson.program']);

        $programs = Program::active()
            ->orderBy('name')
            ->get()
            ->map(fn($program) => [
                'id' => $program->id,
                'name' => $program->name,
                'title' => $program->name,
            ]);

        $lessons = Lesson::with('program')
            ->orderBy('level')
            ->orderBy('order_in_level')
            ->get()
            ->map(fn($lesson) => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'level' => $lesson->level,
                'program_id' => $lesson->program_id,
                'program_title' => $lesson->program->name ?? 'Unknown Program',
                'display_name' => "Level {$lesson->level} - {$lesson->title}",
                'full_display_name' => $lesson->program->name . ' - Level ' . $lesson->level . ' - ' . $lesson->title,
            ]);

        return Inertia::render('Admin/Quizzes/Edit', [
            'quiz' => [
                'id' => $quiz->id,
                'lesson_id' => $quiz->lesson_id,
                'program_id' => $quiz->lesson->program_id,
                'level' => $quiz->lesson->level,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'type' => $quiz->type,
                'time_limit' => $quiz->time_limit,
                'question_time_limit' => $quiz->question_time_limit,
                'max_attempts' => $quiz->max_attempts,
                'passing_score' => $quiz->passing_score,
                'show_results_immediately' => $quiz->show_results_immediately,
                'shuffle_questions' => $quiz->shuffle_questions,
                'shuffle_answers' => $quiz->shuffle_answers,
                'is_active' => $quiz->is_active,
                'settings' => $quiz->settings,
            ],
            'programs' => $programs,
            'lessons' => $lessons,
            'quiz_types' => [
                'mental_arithmetic' => 'Mental Arithmetic',
                'multiple_choice' => 'Multiple Choice',
                'text_answer' => 'Text Answer',
                'true_false' => 'True/False',
                'mixed' => 'Mixed Questions',
            ]
        ]);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:mental_arithmetic,multiple_choice,text_answer,true_false,mixed',
            'time_limit' => 'nullable|integer|min:1|max:7200',
            'question_time_limit' => 'nullable|integer|min:1|max:300',
            'max_attempts' => 'required|integer|min:1|max:10',
            'passing_score' => 'required|numeric|min:0|max:100',
            'show_results_immediately' => 'boolean',
            'shuffle_questions' => 'boolean',
            'shuffle_answers' => 'boolean',
            'is_active' => 'boolean',
            'settings' => 'nullable|array',
            'settings.operations' => 'nullable|array',
            'settings.operations.*' => 'string|in:addition,subtraction,multiplication,division',
            'settings.number_range' => 'nullable|array',
            'settings.number_range.min' => 'nullable|integer|min:1|max:999',
            'settings.number_range.max' => 'nullable|integer|min:1|max:999',
            'settings.display_time' => 'nullable|integer|min:2|max:10',
            'settings.numbers_per_session' => 'nullable|integer|min:3|max:15',
            'settings.session_count' => 'nullable|integer|min:1|max:10',
            'settings.allow_negative' => 'nullable|boolean',
            'settings.points_per_session' => 'nullable|integer|min:1|max:100',
        ]);

        $quiz->update($validated);

        return redirect()
            ->route('admin.quizzes.show', $quiz)
            ->with('success', 'Quiz updated successfully!');
    }

    public function destroy(Quiz $quiz)
    {
        $quiz->delete();

        return redirect()
            ->route('admin.quizzes.index')
            ->with('success', 'Quiz deleted successfully!');
    }

    // Question management methods
    public function addQuestion(Request $request, Quiz $quiz)
    {
        $rules = [
            'type' => 'required|in:mental_arithmetic,multiple_choice,text_answer,true_false',
            'question_data' => 'nullable|array',
            'answer_options' => 'nullable|array',
            'explanation' => 'nullable|string',
            'points' => 'required|numeric|min:0.01',
            'time_limit' => 'nullable|integer|min:1|max:300',
            'settings' => 'nullable|array',
        ];

        // For mental arithmetic, question_text and correct_answer are auto-generated
        if ($request->input('type') === 'mental_arithmetic') {
            $rules['question_text'] = 'nullable|string';
            $rules['correct_answer'] = 'nullable|string';
        } else {
            $rules['question_text'] = 'required|string';
            $rules['correct_answer'] = 'required|string';
        }

        $validated = $request->validate($rules);

        // Set defaults for mental arithmetic questions
        if ($validated['type'] === 'mental_arithmetic') {
            $validated['question_text'] = $validated['question_text'] ?? 'Complete the mental arithmetic flash card sessions';
            $validated['correct_answer'] = $validated['correct_answer'] ?? 'flash_card_sessions';
            // Use quiz settings if no specific question data is provided
            if (empty($validated['question_data'])) {
                $validated['question_data'] = [
                    'type' => 'flash_card_sessions',
                    'use_quiz_settings' => true
                ];
            }
        }

        // Get next order number
        $nextOrder = $quiz->questions()->max('order') + 1;

        $question = $quiz->questions()->create([
            ...$validated,
            'order' => $nextOrder,
        ]);

        return response()->json([
            'success' => true,
            'question' => $question->formatForAdmin(),
            'message' => 'Question added successfully!'
        ]);
    }

    public function updateQuestion(Request $request, Quiz $quiz, QuizQuestion $question)
    {
        // Ensure question belongs to this quiz
        if ($question->quiz_id !== $quiz->id) {
            abort(404);
        }

        $rules = [
            'type' => 'required|in:mental_arithmetic,multiple_choice,text_answer,true_false',
            'question_data' => 'nullable|array',
            'answer_options' => 'nullable|array',
            'explanation' => 'nullable|string',
            'points' => 'required|numeric|min:0.01',
            'time_limit' => 'nullable|integer|min:1|max:300',
            'order' => 'required|integer|min:1',
            'settings' => 'nullable|array',
        ];

        // For mental arithmetic, question_text and correct_answer are auto-generated
        if ($request->input('type') === 'mental_arithmetic') {
            $rules['question_text'] = 'nullable|string';
            $rules['correct_answer'] = 'nullable|string';
        } else {
            $rules['question_text'] = 'required|string';
            $rules['correct_answer'] = 'required|string';
        }

        $validated = $request->validate($rules);

        // Set defaults for mental arithmetic questions
        if ($validated['type'] === 'mental_arithmetic') {
            $validated['question_text'] = $validated['question_text'] ?? 'Complete the mental arithmetic flash card sessions';
            $validated['correct_answer'] = $validated['correct_answer'] ?? 'flash_card_sessions';
        }

        $question->update($validated);

        return response()->json([
            'success' => true,
            'question' => $question->formatForAdmin(),
            'message' => 'Question updated successfully!'
        ]);
    }

    public function deleteQuestion(Quiz $quiz, QuizQuestion $question)
    {
        // Ensure question belongs to this quiz
        if ($question->quiz_id !== $quiz->id) {
            abort(404);
        }

        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully!'
        ]);
    }

    public function reorderQuestions(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.id' => 'required|exists:quiz_questions,id',
            'questions.*.order' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated, $quiz) {
            foreach ($validated['questions'] as $questionData) {
                QuizQuestion::where('id', $questionData['id'])
                    ->where('quiz_id', $quiz->id)
                    ->update(['order' => $questionData['order']]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Questions reordered successfully!'
        ]);
    }

    public function generateMentalArithmeticQuestion(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'difficulty' => 'integer|min:1|max:5',
            'operations' => 'nullable|array',
            'number_range' => 'nullable|array',
            'sequence_length' => 'nullable|integer|min:2|max:8',
            'session_count' => 'nullable|integer|min:1|max:10',
            'numbers_per_session' => 'nullable|integer|min:3|max:15',
            'display_time' => 'nullable|numeric|min:0.5|max:5',
        ]);

        // Update quiz settings if provided
        $settings = $quiz->settings ?? [];
        if (isset($validated['operations'])) $settings['operations'] = $validated['operations'];
        if (isset($validated['number_range'])) $settings['number_range'] = $validated['number_range'];
        if (isset($validated['sequence_length'])) $settings['sequence_length'] = $validated['sequence_length'];
        if (isset($validated['session_count'])) $settings['session_count'] = $validated['session_count'];
        if (isset($validated['numbers_per_session'])) $settings['numbers_per_session'] = $validated['numbers_per_session'];
        if (isset($validated['display_time'])) $settings['display_time'] = $validated['display_time'];
        
        if (!empty($settings)) {
            $quiz->update(['settings' => $settings]);
        }

        // Generate sessions instead of single question
        $sessionCount = $validated['session_count'] ?? 3;
        $sessions = $quiz->generateMentalArithmeticSessions($sessionCount);

        // Auto-create a flash card question for this quiz
        $nextOrder = $quiz->questions()->max('order') + 1;
        $pointsPerSession = $settings['points_per_session'] ?? 10;
        
        $question = $quiz->questions()->create([
            'type' => 'mental_arithmetic',
            'question_text' => "Complete {$sessionCount} flash card sessions by adding the numbers shown",
            'question_data' => [
                'sessions' => $sessions,
                'session_count' => $sessionCount,
                'display_type' => 'flash_cards'
            ],
            'correct_answer' => 'flash_card_sessions', // Special marker for flash card questions
            'points' => $sessionCount * $pointsPerSession, // Configurable points per session
            'order' => $nextOrder,
        ]);

        return response()->json([
            'success' => true,
            'question' => $question->formatForAdmin(),
            'sessions' => $sessions,
            'question_data' => [
                'sessions' => $sessions,
                'session_count' => $sessionCount,
                'display_type' => 'flash_cards'
            ],
            'message' => 'Flash card question created successfully!'
        ]);
    }

    public function duplicateQuiz(Quiz $quiz)
    {
        $newQuiz = $quiz->replicate();
        $newQuiz->title = "{$quiz->title} (Copy)";
        $newQuiz->save();

        // Duplicate questions
        foreach ($quiz->questions as $question) {
            $newQuestion = $question->replicate();
            $newQuestion->quiz_id = $newQuiz->id;
            $newQuestion->save();
        }

        return redirect()
            ->route('admin.quizzes.show', $newQuiz)
            ->with('success', 'Quiz duplicated successfully!');
    }

    public function results(Quiz $quiz)
    {
        $quiz->load(['lesson.program', 'attempts.user']);

        $attempts = $quiz->attempts()
            ->with('user')
            ->latest()
            ->paginate(20);

        $stats = [
            'total_attempts' => $quiz->attempts()->count(),
            'completed_attempts' => $quiz->attempts()->where('status', 'completed')->count(),
            'average_score' => $quiz->getAverageScore(),
            'pass_rate' => $quiz->getPassRate(),
            'completion_rate' => $quiz->getCompletionRate(),
        ];

        return Inertia::render('Admin/Quizzes/Results', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'passing_score' => $quiz->passing_score,
                'total_questions' => $quiz->total_questions,
                'total_points' => $quiz->total_points,
                'lesson' => [
                    'id' => $quiz->lesson->id,
                    'title' => $quiz->lesson->title,
                    'program' => [
                        'id' => $quiz->lesson->program->id,
                        'title' => $quiz->lesson->program->title,
                    ]
                ]
            ],
            'attempts' => $attempts->through(fn($attempt) => $attempt->formatForAdmin()),
            'stats' => $stats,
            'pagination' => [
                'current_page' => $attempts->currentPage(),
                'last_page' => $attempts->lastPage(),
                'per_page' => $attempts->perPage(),
                'total' => $attempts->total(),
            ]
        ]);
    }

    public function studentResults(Quiz $quiz)
    {
        $quiz->load(['lesson.program']);

        // Get all users who have attempted this quiz, with their best scores
        $userResults = User::whereHas('quizAttempts', function ($query) use ($quiz) {
            $query->where('quiz_id', $quiz->id);
        })
        ->with(['quizAttempts' => function ($query) use ($quiz) {
            $query->where('quiz_id', $quiz->id)->latest();
        }])
        ->get()
        ->map(function ($user) use ($quiz) {
            $attempts = $user->quizAttempts;
            $bestAttempt = $attempts->where('status', 'completed')->sortByDesc('score')->first();
            
            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'total_attempts' => $attempts->count(),
                'completed_attempts' => $attempts->where('status', 'completed')->count(),
                'best_score' => $bestAttempt?->score,
                'passed' => $bestAttempt && $bestAttempt->score >= $quiz->passing_score,
                'last_attempt' => $attempts->first()?->formatForAdmin(),
            ];
        })
        ->sortByDesc('best_score');

        return Inertia::render('Admin/Quizzes/StudentResults', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'passing_score' => $quiz->passing_score,
                'lesson' => [
                    'id' => $quiz->lesson->id,
                    'title' => $quiz->lesson->title,
                    'program' => [
                        'id' => $quiz->lesson->program->id,
                        'title' => $quiz->lesson->program->title,
                    ]
                ]
            ],
            'user_results' => $userResults->values(),
        ]);
    }
}