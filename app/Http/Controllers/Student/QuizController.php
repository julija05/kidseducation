<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function show(Quiz $quiz)
    {
        // Check if user has access to this quiz through lesson enrollment
        $user = Auth::user();
        
        // Get user's enrollment for this quiz's lesson's program
        $enrollment = $user->enrollments()
            ->where('program_id', $quiz->lesson->program_id)
            ->where('approval_status', 'approved')
            ->first();

        if (!$enrollment) {
            abort(403, 'You must be enrolled in this program to access this quiz.');
        }

        // Check if quiz is active
        if (!$quiz->is_active) {
            abort(404, 'This quiz is not available.');
        }

        // Get user's attempts for this quiz
        $attempts = $quiz->userAttempts($user)->latest()->get();
        $attemptCount = $attempts->count();
        $canTakeQuiz = $quiz->canUserTakeQuiz($user);
        $bestScore = $quiz->getUserBestScore($user);
        $hasPassed = $quiz->hasUserPassed($user);

        return Inertia::render('Student/Quiz/Show', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'type' => $quiz->type,
                'type_display' => $quiz->type_display,
                'total_questions' => $quiz->total_questions,
                'total_points' => $quiz->total_points,
                'passing_score' => $quiz->passing_score,
                'max_attempts' => $quiz->max_attempts,
                'time_limit' => $quiz->time_limit,
                'formatted_time_limit' => $quiz->formatted_time_limit,
                'question_time_limit' => $quiz->question_time_limit,
                'formatted_question_time_limit' => $quiz->formatted_question_time_limit,
                'show_results_immediately' => $quiz->show_results_immediately,
                'lesson' => [
                    'id' => $quiz->lesson->id,
                    'title' => $quiz->lesson->title,
                    'program' => [
                        'id' => $quiz->lesson->program->id,
                        'title' => $quiz->lesson->program->title,
                    ]
                ]
            ],
            'attempts' => $attempts->map(fn($attempt) => $attempt->formatForStudent()),
            'attempt_count' => $attemptCount,
            'can_take_quiz' => $canTakeQuiz,
            'best_score' => $bestScore,
            'has_passed' => $hasPassed,
        ]);
    }

    public function start(Quiz $quiz)
    {
        $user = Auth::user();

        // Verify access and availability
        $enrollment = $user->enrollments()
            ->where('program_id', $quiz->lesson->program_id)
            ->where('approval_status', 'approved')
            ->first();

        if (!$enrollment || !$quiz->is_active || !$quiz->canUserTakeQuiz($user)) {
            return back()->withErrors(['quiz' => 'Unable to start quiz.']);
        }

        // Check for existing in-progress attempt
        $existingAttempt = $quiz->userAttempts($user)
            ->where('status', 'in_progress')
            ->first();

        if ($existingAttempt) {
            return redirect()->route('student.quiz.take', [$quiz->id, $existingAttempt->id]);
        }

        // Create new attempt
        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        return redirect()->route('student.quiz.take', [$quiz->id, $attempt->id]);
    }

    public function take(Quiz $quiz, QuizAttempt $attempt)
    {
        $user = Auth::user();

        // Verify ownership and status
        if ($attempt->user_id !== $user->id || $attempt->quiz_id !== $quiz->id) {
            abort(403);
        }

        if ($attempt->status !== 'in_progress') {
            return redirect()->route('student.quiz.result', [$quiz->id, $attempt->id]);
        }

        // Check if attempt has expired
        if ($attempt->isExpired()) {
            $attempt->expire();
            return redirect()->route('student.quiz.result', [$quiz->id, $attempt->id])
                ->with('warning', 'Quiz time limit exceeded.');
        }

        // Get questions (shuffled if enabled)
        $questions = $quiz->questions()->orderBy('order')->get();
        
        if ($quiz->shuffle_questions) {
            $questions = $questions->shuffle();
        }

        // For mental arithmetic quizzes, generate session data
        if ($quiz->type === 'mental_arithmetic' && $questions->isEmpty()) {
            // If no questions exist for mental arithmetic quiz, create a default one
            $sessionCount = $quiz->settings['session_count'] ?? 3;
            $pointsPerSession = $quiz->settings['points_per_session'] ?? 10;
            $sessions = $quiz->generateMentalArithmeticSessions($sessionCount);
            
            // Create a proper QuizQuestion instance for the frontend
            $defaultQuestion = new \App\Models\QuizQuestion([
                'quiz_id' => $quiz->id,
                'type' => 'mental_arithmetic',
                'question_text' => 'Complete the mental arithmetic sessions',
                'question_data' => [
                    'sessions' => $sessions,
                    'type' => 'flash_card_sessions'
                ],
                'correct_answer' => 'flash_card_sessions',
                'points' => $sessionCount * $pointsPerSession,
                'order' => 1,
            ]);
            
            // Set the id and establish the quiz relationship
            $defaultQuestion->id = 'temp_mental_arithmetic';
            $defaultQuestion->setRelation('quiz', $quiz);
            
            $questions = collect([$defaultQuestion]);
        } else {
            // For existing questions, generate session data
            foreach ($questions as $question) {
                if ($question->type === 'mental_arithmetic' && $quiz->type === 'mental_arithmetic') {
                    // Generate mental arithmetic sessions using quiz settings
                    $sessionCount = $quiz->settings['session_count'] ?? 3;
                    $sessions = $quiz->generateMentalArithmeticSessions($sessionCount);
                    $question->question_data = [
                        'sessions' => $sessions,
                        'type' => 'flash_card_sessions'
                    ];
                }
            }
        }

        return Inertia::render('Student/Quiz/Take', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'type' => $quiz->type,
                'time_limit' => $quiz->time_limit,
                'question_time_limit' => $quiz->question_time_limit,
                'shuffle_answers' => $quiz->shuffle_answers,
            ],
            'attempt' => $attempt->formatForStudent(),
            'questions' => $questions->map(fn($question) => $question->formatForFrontend()),
            'total_questions' => $questions->count(),
            'current_question' => 1,
        ]);
    }

    public function submitAnswer(Request $request, Quiz $quiz, QuizAttempt $attempt)
    {
        $user = Auth::user();

        // Verify ownership and status
        if ($attempt->user_id !== $user->id || $attempt->quiz_id !== $quiz->id || $attempt->status !== 'in_progress') {
            abort(403, 'Invalid attempt');
        }

        $validated = $request->validate([
            'question_id' => 'required|string',
            'answer' => 'required|string',
            'time_taken' => 'nullable|integer|min:0',
        ]);

        // Handle temporary mental arithmetic questions
        if ($validated['question_id'] === 'temp_mental_arithmetic' && $quiz->type === 'mental_arithmetic') {
            // For mental arithmetic quizzes without database questions, we'll handle this in the submit method
            $question = null; // We'll validate this is a mental arithmetic answer in submit()
        } else {
            // Verify question belongs to this quiz for real database questions
            $question = $quiz->questions()->find($validated['question_id']);
            if (!$question) {
                abort(400, 'Invalid question');
            }
        }

        // Record the answer
        $attempt->recordAnswer(
            $validated['question_id'],
            $validated['answer'],
            $validated['time_taken']
        );

        // Return success response without redirect (for AJAX calls)
        return back()->with('success', 'Answer saved');
    }

    public function submit(Request $request, Quiz $quiz, QuizAttempt $attempt)
    {
        $user = Auth::user();

        // Verify ownership and status
        if ($attempt->user_id !== $user->id || $attempt->quiz_id !== $quiz->id || $attempt->status !== 'in_progress') {
            abort(403);
        }

        // Validate and save all answers
        $validated = $request->validate([
            'answers' => 'array',
            'answers.*' => 'required', // Allow strings or other data types
        ]);


        // Save all answers
        if (isset($validated['answers'])) {
            foreach ($validated['answers'] as $questionId => $answer) {
                // Convert answer to string if it's not already
                $answerString = is_string($answer) ? $answer : json_encode($answer);
                
                // For mental arithmetic quizzes, if we detect flash card session data, store as temp answer
                if ($quiz->type === 'mental_arithmetic' && is_string($answerString)) {
                    // Check if this looks like flash card session data
                    try {
                        $answerData = json_decode($answerString, true);
                        if ($answerData && isset($answerData['type']) && $answerData['type'] === 'flash_card_sessions') {
                            // This is mental arithmetic flash card data, store with temp ID
                            $attempt->recordAnswer('temp_mental_arithmetic', $answerString);
                            continue;
                        }
                    } catch (Exception $e) {
                        // Not JSON, continue with normal processing
                    }
                }
                
                // Handle temporary mental arithmetic questions by ID
                if ($questionId === 'temp_mental_arithmetic' && $quiz->type === 'mental_arithmetic') {
                    // For mental arithmetic quiz, store the answer with the temp ID
                    $attempt->recordAnswer($questionId, $answerString);
                } else {
                    // For regular questions, convert to int
                    $attempt->recordAnswer((int) $questionId, $answerString);
                }
            }
        }

        // Complete the attempt
        $attempt->complete();


        return redirect()->route('student.quiz.result', [$quiz->id, $attempt->id])
            ->with('success', 'Quiz completed successfully!');
    }

    public function result(Quiz $quiz, QuizAttempt $attempt)
    {
        $user = Auth::user();

        // Verify ownership
        if ($attempt->user_id !== $user->id || $attempt->quiz_id !== $quiz->id) {
            abort(403);
        }

        // Get detailed results if quiz allows immediate results
        $showDetailedResults = $quiz->show_results_immediately && $attempt->isCompleted();
        
        $questionResults = [];
        if ($showDetailedResults) {
            // Handle mental arithmetic quizzes with temporary questions
            if ($quiz->type === 'mental_arithmetic' && isset($attempt->answers['temp_mental_arithmetic'])) {
                $userAnswer = $attempt->getAnswerForQuestion('temp_mental_arithmetic') ?? $attempt->answers['temp_mental_arithmetic'] ?? null;
                
                if ($userAnswer) {
                    $answerText = is_array($userAnswer) ? ($userAnswer['answer'] ?? '') : $userAnswer;
                    
                    // Try to parse flash card results
                    $isCorrect = false;
                    $pointsEarned = 0;
                    $userAnswerDisplay = 'No answer provided';
                    $sessionSummary = '';
                    
                    try {
                        $answerData = json_decode($answerText, true);
                        if ($answerData && isset($answerData['type']) && $answerData['type'] === 'flash_card_sessions') {
                            $percentage = $answerData['percentage'] ?? 0;
                            $correctCount = $answerData['correct_count'] ?? 0;
                            $totalSessions = $answerData['total_sessions'] ?? 0;
                            
                            $isCorrect = $percentage >= 50;
                            $sessionCount = $quiz->settings['session_count'] ?? 3;
                            $pointsPerSession = $quiz->settings['points_per_session'] ?? 10;
                            $maxPoints = $sessionCount * $pointsPerSession;
                            $pointsEarned = ($percentage / 100) * $maxPoints;
                            
                            // Create a user-friendly display
                            $userAnswerDisplay = "Flash Card Sessions: {$correctCount}/{$totalSessions} correct ({$percentage}%)";
                            $sessionSummary = "Completed {$totalSessions} mental arithmetic sessions with {$percentage}% accuracy.";
                        }
                    } catch (Exception $e) {
                        // Invalid answer format
                    }
                    
                    $questionResults[] = [
                        'question' => [
                            'id' => 'temp_mental_arithmetic',
                            'type' => 'mental_arithmetic',
                            'question_text' => 'Complete the mental arithmetic flash card sessions',
                            'points' => $maxPoints
                        ],
                        'user_answer' => $userAnswerDisplay,
                        'is_correct' => $isCorrect,
                        'correct_answer' => 'Complete all sessions with at least 50% accuracy',
                        'explanation' => $sessionSummary,
                        'points_earned' => $pointsEarned,
                    ];
                }
            } else {
                // Standard question results
                foreach ($quiz->questions as $question) {
                    $userAnswer = $attempt->getAnswerForQuestion($question->id);
                    $isCorrect = $userAnswer ? $question->isAnswerCorrect($userAnswer['answer']) : false;
                    
                    $questionResults[] = [
                        'question' => $question->formatForFrontend(),
                        'user_answer' => $userAnswer['answer'] ?? null,
                        'is_correct' => $isCorrect,
                        'correct_answer' => $question->correct_answer,
                        'explanation' => $question->explanation,
                        'points_earned' => $isCorrect ? $question->points : 0,
                    ];
                }
            }
        }

        return Inertia::render('Student/Quiz/Result', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'passing_score' => $quiz->passing_score,
                'show_results_immediately' => $quiz->show_results_immediately,
                'lesson' => [
                    'id' => $quiz->lesson->id,
                    'title' => $quiz->lesson->title,
                ]
            ],
            'attempt' => $attempt->formatForStudent(),
            'question_results' => $questionResults,
            'show_detailed_results' => $showDetailedResults,
            'can_retake' => $quiz->canUserTakeQuiz($user),
        ]);
    }
}