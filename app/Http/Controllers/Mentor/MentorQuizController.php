<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * MentorQuizController
 * Handles quiz management for mentors
 */
class MentorQuizController extends Controller
{
    /**
     * Show form to create a new quiz
     */
    public function create(Lesson $lesson): Response
    {
        $user = Auth::user();

        // Check if the mentor owns this program
        if ($lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Check if program is in content development stage
        if (!$lesson->program->canAddContent()) {
            abort(403, 'You can only add quizzes to programs in content development.');
        }

        return Inertia::render('Mentor/Quizzes/Create', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'program' => [
                    'id' => $lesson->program->id,
                    'name' => $lesson->program->name,
                    'slug' => $lesson->program->slug,
                ],
            ],
        ]);
    }

    /**
     * Store a new quiz
     */
    public function store(Request $request, Lesson $lesson): RedirectResponse
    {
        $user = Auth::user();

        // Check if the mentor owns this program
        if ($lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Check if program is in content development stage
        if (!$lesson->program->canAddContent()) {
            return back()->with('error', 'You can only add quizzes to programs in content development.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:practice,graded',
            'time_limit' => 'nullable|integer|min:1',
            'max_attempts' => 'nullable|integer|min:1',
            'passing_score' => 'nullable|numeric|min:0|max:100',
            'show_results_immediately' => 'boolean',
            'shuffle_questions' => 'boolean',
            'shuffle_answers' => 'boolean',
        ]);

        // Set default values for fields that cannot be null in the database
        $quizData = array_merge($validated, [
            'lesson_id' => $lesson->id,
            'is_active' => true,
            'max_attempts' => $validated['max_attempts'] ?? 3,
            'passing_score' => $validated['passing_score'] ?? 70.00,
        ]);

        $quiz = Quiz::create($quizData);

        return redirect()->route('mentor.quizzes.edit', $quiz->id)
            ->with('success', 'Quiz created successfully! Now add questions to complete your quiz.');
    }

    /**
     * Show form to edit a quiz
     */
    public function edit(Quiz $quiz): Response
    {
        $user = Auth::user();

        // Check if the mentor owns this program
        if ($quiz->lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $quiz->load(['questions', 'lesson.program']);

        // Map database type back to frontend question_type
        $typeMapping = [
            'multiple_choice' => 'multiple_choice',
            'true_false' => 'true_false',
            'text_answer' => 'short_answer',
        ];

        return Inertia::render('Mentor/Quizzes/Edit', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'type' => $quiz->type,
                'time_limit' => $quiz->time_limit,
                'max_attempts' => $quiz->max_attempts,
                'passing_score' => $quiz->passing_score,
                'show_results_immediately' => $quiz->show_results_immediately,
                'shuffle_questions' => $quiz->shuffle_questions,
                'shuffle_answers' => $quiz->shuffle_answers,
                'is_active' => $quiz->is_active,
                'questions' => $quiz->questions->map(function ($question) use ($typeMapping) {
                    // Convert answer_options JSON to answers array
                    $answers = [];
                    $answerOptions = $question->answer_options ?? [];

                    foreach ($answerOptions as $key => $text) {
                        $answers[] = [
                            'answer_text' => $text,
                            'is_correct' => $text === $question->correct_answer,
                        ];
                    }

                    return [
                        'id' => $question->id,
                        'question_text' => $question->question_text,
                        'question_type' => $typeMapping[$question->type] ?? 'multiple_choice',
                        'points' => $question->points,
                        'order' => $question->order,
                        'answers' => $answers,
                    ];
                }),
                'lesson' => [
                    'id' => $quiz->lesson->id,
                    'title' => $quiz->lesson->title,
                    'program' => [
                        'id' => $quiz->lesson->program->id,
                        'name' => $quiz->lesson->program->name,
                        'slug' => $quiz->lesson->program->slug,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Update a quiz
     */
    public function update(Request $request, Quiz $quiz): RedirectResponse
    {
        $user = Auth::user();

        // Check if the mentor owns this program
        if ($quiz->lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:practice,graded',
            'time_limit' => 'nullable|integer|min:1',
            'max_attempts' => 'nullable|integer|min:1',
            'passing_score' => 'nullable|numeric|min:0|max:100',
            'show_results_immediately' => 'boolean',
            'shuffle_questions' => 'boolean',
            'shuffle_answers' => 'boolean',
        ]);

        $quiz->update($validated);

        return redirect()->route('mentor.quizzes.edit', $quiz)
            ->with('success', 'Quiz updated successfully!');
    }

    /**
     * Delete a quiz
     */
    public function destroy(Quiz $quiz): RedirectResponse
    {
        $user = Auth::user();

        // Check if the mentor owns this program
        if ($quiz->lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $programSlug = $quiz->lesson->program->slug;
        $quiz->delete();

        return redirect()->route('mentor.programs.content', $programSlug)
            ->with('success', 'Quiz deleted successfully!');
    }

    /**
     * Store a new question for a quiz
     */
    public function storeQuestion(Request $request, Quiz $quiz): RedirectResponse
    {
        $user = Auth::user();

        // Check if the mentor owns this program
        if ($quiz->lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|string|in:multiple_choice,true_false,short_answer',
            'points' => 'required|numeric|min:0',
            'answers' => 'required|array|min:1',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        // Map question_type to the database type field
        $typeMapping = [
            'multiple_choice' => 'multiple_choice',
            'true_false' => 'true_false',
            'short_answer' => 'text_answer',
        ];

        // Prepare answer options and find correct answer
        $answerOptions = [];
        $correctAnswer = '';

        foreach ($validated['answers'] as $index => $answerData) {
            $key = 'option_' . ($index + 1);
            $answerOptions[$key] = $answerData['answer_text'];

            if ($answerData['is_correct']) {
                $correctAnswer = $answerData['answer_text'];
            }
        }

        QuizQuestion::create([
            'quiz_id' => $quiz->id,
            'type' => $typeMapping[$validated['question_type']],
            'question_text' => $validated['question_text'],
            'answer_options' => $answerOptions,
            'correct_answer' => $correctAnswer,
            'points' => $validated['points'],
            'order' => $quiz->questions()->count() + 1,
        ]);

        return back()->with('success', 'Question added successfully!');
    }

    /**
     * Update a quiz question
     */
    public function updateQuestion(Request $request, Quiz $quiz, QuizQuestion $question): RedirectResponse
    {
        $user = Auth::user();

        // Check if the mentor owns this program
        if ($quiz->lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|string|in:multiple_choice,true_false,short_answer',
            'points' => 'required|numeric|min:0',
            'answers' => 'required|array|min:1',
            'answers.*.id' => 'nullable|integer',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        // Map question_type to the database type field
        $typeMapping = [
            'multiple_choice' => 'multiple_choice',
            'true_false' => 'true_false',
            'short_answer' => 'text_answer',
        ];

        // Prepare answer options and find correct answer
        $answerOptions = [];
        $correctAnswer = '';

        foreach ($validated['answers'] as $index => $answerData) {
            $key = 'option_' . ($index + 1);
            $answerOptions[$key] = $answerData['answer_text'];

            if ($answerData['is_correct']) {
                $correctAnswer = $answerData['answer_text'];
            }
        }

        $question->update([
            'type' => $typeMapping[$validated['question_type']],
            'question_text' => $validated['question_text'],
            'answer_options' => $answerOptions,
            'correct_answer' => $correctAnswer,
            'points' => $validated['points'],
        ]);

        return back()->with('success', 'Question updated successfully!');
    }

    /**
     * Delete a quiz question
     */
    public function destroyQuestion(Quiz $quiz, QuizQuestion $question): RedirectResponse
    {
        $user = Auth::user();

        // Check if the mentor owns this program
        if ($quiz->lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $question->delete();

        return back()->with('success', 'Question deleted successfully!');
    }
}
