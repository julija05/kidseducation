<?php

namespace Tests\Unit;

use App\Models\Lesson;
use App\Models\Program;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuizAttemptTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Quiz $quiz;

    protected Quiz $mentalArithmeticQuiz;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $program = Program::create([
            'name' => 'Math Program',
            'slug' => 'math-program',
            'description' => 'Test program',
            'duration' => '4 weeks',
            'price' => 99.99,
            'is_active' => true,
        ]);

        $lesson = Lesson::create([
            'program_id' => $program->id,
            'title' => 'Basic Math',
            'description' => 'Test lesson',
            'content' => 'Test content',
            'level' => 1,
            'order' => 1,
            'is_active' => true,
        ]);

        $this->quiz = Quiz::create([
            'lesson_id' => $lesson->id,
            'title' => 'Regular Quiz',
            'type' => 'multiple_choice',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
        ]);

        $this->mentalArithmeticQuiz = Quiz::create([
            'lesson_id' => $lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
        ]);
    }

    public function it_calculates_score_for_mental_arithmetic_with_temporary_questions()
    {
        $attempt = QuizAttempt::create([
            'quiz_id' => $this->mentalArithmeticQuiz->id,
            'user_id' => $this->user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        // Simulate flash card session results
        $flashCardResults = [
            'type' => 'flash_card_sessions',
            'results' => [
                ['session_id' => 1, 'is_correct' => true],
                ['session_id' => 2, 'is_correct' => true],
                ['session_id' => 3, 'is_correct' => false],
            ],
            'correct_count' => 2,
            'total_sessions' => 3,
            'percentage' => 67,
        ];

        $attempt->recordAnswer('temp_mental_arithmetic', json_encode($flashCardResults));
        $attempt->calculateScore();

        $this->assertEquals(100, $attempt->total_points);
        $this->assertEquals(67, $attempt->earned_points);
        $this->assertEquals(67, $attempt->score);
        $this->assertEquals(1, $attempt->correct_answers); // >= 50% threshold
        $this->assertEquals(1, $attempt->total_questions);
    }

    public function it_handles_perfect_mental_arithmetic_score()
    {
        $attempt = QuizAttempt::create([
            'quiz_id' => $this->mentalArithmeticQuiz->id,
            'user_id' => $this->user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        $flashCardResults = [
            'type' => 'flash_card_sessions',
            'results' => [
                ['session_id' => 1, 'is_correct' => true],
                ['session_id' => 2, 'is_correct' => true],
                ['session_id' => 3, 'is_correct' => true],
            ],
            'correct_count' => 3,
            'total_sessions' => 3,
            'percentage' => 100,
        ];

        $attempt->recordAnswer('temp_mental_arithmetic', json_encode($flashCardResults));
        $attempt->calculateScore();

        $this->assertEquals(100, $attempt->total_points);
        $this->assertEquals(100, $attempt->earned_points);
        $this->assertEquals(100, $attempt->score);
        $this->assertEquals(1, $attempt->correct_answers);
    }

    public function it_handles_zero_mental_arithmetic_score()
    {
        $attempt = QuizAttempt::create([
            'quiz_id' => $this->mentalArithmeticQuiz->id,
            'user_id' => $this->user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        $flashCardResults = [
            'type' => 'flash_card_sessions',
            'results' => [
                ['session_id' => 1, 'is_correct' => false],
                ['session_id' => 2, 'is_correct' => false],
                ['session_id' => 3, 'is_correct' => false],
            ],
            'correct_count' => 0,
            'total_sessions' => 3,
            'percentage' => 0,
        ];

        $attempt->recordAnswer('temp_mental_arithmetic', json_encode($flashCardResults));
        $attempt->calculateScore();

        $this->assertEquals(100, $attempt->total_points);
        $this->assertEquals(0, $attempt->earned_points);
        $this->assertEquals(0, $attempt->score);
        $this->assertEquals(0, $attempt->correct_answers); // < 50% threshold
    }

    public function it_calculates_score_for_regular_quiz_questions()
    {
        // Create regular quiz questions
        $question1 = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice',
            'question_text' => 'What is 2+2?',
            'answer_options' => ['a' => '3', 'b' => '4', 'c' => '5'],
            'correct_answer' => 'b',
            'points' => 10,
            'order' => 1,
        ]);

        $question2 = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice',
            'question_text' => 'What is 3+3?',
            'answer_options' => ['a' => '5', 'b' => '6', 'c' => '7'],
            'correct_answer' => 'b',
            'points' => 15,
            'order' => 2,
        ]);

        $attempt = QuizAttempt::create([
            'quiz_id' => $this->quiz->id,
            'user_id' => $this->user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        // Answer correctly and incorrectly
        $attempt->recordAnswer($question1->id, 'b'); // Correct
        $attempt->recordAnswer($question2->id, 'a'); // Incorrect

        $attempt->calculateScore();

        $this->assertEquals(25, $attempt->total_points); // 10 + 15
        $this->assertEquals(10, $attempt->earned_points); // Only first question correct
        $this->assertEquals(40, $attempt->score); // 10/25 * 100
        $this->assertEquals(1, $attempt->correct_answers);
        $this->assertEquals(2, $attempt->total_questions);
    }

    public function it_handles_no_answers_gracefully()
    {
        $attempt = QuizAttempt::create([
            'quiz_id' => $this->quiz->id,
            'user_id' => $this->user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        $attempt->calculateScore();

        $this->assertEquals(0, $attempt->total_points);
        $this->assertEquals(0, $attempt->earned_points);
        $this->assertEquals(0, $attempt->score);
        $this->assertEquals(0, $attempt->correct_answers);
    }

    public function it_records_answers_with_string_and_integer_ids()
    {
        $attempt = QuizAttempt::create([
            'quiz_id' => $this->quiz->id,
            'user_id' => $this->user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        // Test with integer ID
        $attempt->recordAnswer(1, 'answer1');

        // Test with string ID
        $attempt->recordAnswer('temp_mental_arithmetic', 'answer2');

        $answers = $attempt->answers;

        $this->assertArrayHasKey('1', $answers);
        $this->assertArrayHasKey('temp_mental_arithmetic', $answers);
        $this->assertEquals('answer1', $answers['1']['answer']);
        $this->assertEquals('answer2', $answers['temp_mental_arithmetic']['answer']);
    }

    public function it_checks_if_questions_are_answered()
    {
        $attempt = QuizAttempt::create([
            'quiz_id' => $this->quiz->id,
            'user_id' => $this->user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        $this->assertFalse($attempt->hasAnsweredQuestion(1));
        $this->assertFalse($attempt->hasAnsweredQuestion('temp_mental_arithmetic'));

        $attempt->recordAnswer(1, 'answer');

        $this->assertTrue($attempt->hasAnsweredQuestion(1));
        $this->assertFalse($attempt->hasAnsweredQuestion('temp_mental_arithmetic'));
    }

    public function it_completes_attempt_and_calculates_final_score()
    {
        $attempt = QuizAttempt::create([
            'quiz_id' => $this->mentalArithmeticQuiz->id,
            'user_id' => $this->user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        $flashCardResults = [
            'type' => 'flash_card_sessions',
            'percentage' => 85,
        ];

        $attempt->recordAnswer('temp_mental_arithmetic', json_encode($flashCardResults));
        $attempt->complete();

        $this->assertEquals('completed', $attempt->status);
        $this->assertNotNull($attempt->completed_at);
        $this->assertNotNull($attempt->time_taken);
        $this->assertEquals(85, $attempt->score);
    }

    public function it_formats_student_data_correctly()
    {
        $attempt = QuizAttempt::create([
            'quiz_id' => $this->quiz->id,
            'user_id' => $this->user->id,
            'started_at' => now(),
            'status' => 'completed',
            'completed_at' => now(),
            'score' => 85.5,
            'total_points' => 100,
            'earned_points' => 85,
        ]);

        $formatted = $attempt->formatForStudent();

        $this->assertArrayHasKey('id', $formatted);
        $this->assertArrayHasKey('quiz_id', $formatted);
        $this->assertArrayHasKey('status', $formatted);
        $this->assertArrayHasKey('score', $formatted);
        $this->assertArrayHasKey('passed', $formatted);
        $this->assertEquals(85.5, $formatted['score']);
        $this->assertEquals('Completed', $formatted['status_display']);
    }

    public function it_handles_invalid_mental_arithmetic_json()
    {
        $attempt = QuizAttempt::create([
            'quiz_id' => $this->mentalArithmeticQuiz->id,
            'user_id' => $this->user->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        // Record invalid JSON
        $attempt->recordAnswer('temp_mental_arithmetic', 'invalid json');
        $attempt->calculateScore();

        $this->assertEquals(0, $attempt->score);
        $this->assertEquals(0, $attempt->earned_points);
    }
}
