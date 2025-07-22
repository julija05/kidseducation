<?php

namespace Tests\Feature;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Lesson;
use App\Models\Program;
use App\Models\User;
use App\Models\Enrollment;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QuizFeatureTest extends TestCase
{
    use RefreshDatabase, CreatesRoles;

    protected User $admin;
    protected User $student;
    protected Program $program;
    protected Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->createRoles();
        
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        
        $this->student = User::factory()->create();
        $this->student->assignRole('student');
        
        $this->program = Program::create([
            'name' => 'Math Program',
            'slug' => 'math-program',
            'description' => 'Test program',
            'duration' => '4 weeks',
            'price' => 99.99,
            'is_active' => true,
        ]);

        $this->lesson = Lesson::create([
            'program_id' => $this->program->id,
            'title' => 'Basic Math',
            'description' => 'Test lesson',
            'content' => 'Test content',
            'level' => 1,
            'order' => 1,
            'is_active' => true,
        ]);

        // Create enrollment for student
        Enrollment::create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'approval_status' => 'approved',
        ]);
    }

    public function test_admin_can_create_mental_arithmetic_quiz()
    {
        $this->actingAs($this->admin);

        $quizData = [
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'description' => 'Test mental arithmetic quiz',
            'type' => 'mental_arithmetic',
            'time_limit' => 600,
            'max_attempts' => 3,
            'passing_score' => 70,
            'show_results_immediately' => true,
            'shuffle_questions' => false,
            'shuffle_answers' => false,
            'is_active' => true,
            'settings' => [
                'operations' => ['addition', 'subtraction'],
                'number_range' => ['min' => 1, 'max' => 10],
                'display_time' => 5,
                'numbers_per_session' => 5,
                'session_count' => 3,
                'allow_negative' => false,
            ],
        ];

        $response = $this->post(route('admin.quizzes.store'), $quizData);

        $response->assertRedirect();
        $this->assertDatabaseHas('quizzes', [
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'lesson_id' => $this->lesson->id,
        ]);

        $quiz = Quiz::where('title', 'Mental Arithmetic Quiz')->first();
        $this->assertEquals(['addition', 'subtraction'], $quiz->settings['operations']);
        $this->assertEquals(false, $quiz->settings['allow_negative']);
    }

    public function test_admin_can_add_mental_arithmetic_question_to_quiz()
    {
        $this->actingAs($this->admin);

        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
        ]);

        $questionData = [
            'type' => 'mental_arithmetic',
            'points' => 10,
            'settings' => [],
        ];

        $response = $this->postJson(route('admin.quizzes.questions.store', $quiz->id), $questionData);

        $response->assertJson(['success' => true]);
        $this->assertDatabaseHas('quiz_questions', [
            'quiz_id' => $quiz->id,
            'type' => 'mental_arithmetic',
            'question_text' => 'Complete the mental arithmetic flash card sessions',
            'correct_answer' => 'flash_card_sessions',
        ]);
    }

    public function test_student_can_view_quiz_overview()
    {
        $this->actingAs($this->student);

        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
        ]);

        $response = $this->get(route('student.quiz.show', $quiz->id));

        $response->assertOk();
        $response->assertInertia(function ($page) use ($quiz) {
            $page->component('Student/Quiz/Show')
                 ->has('quiz')
                 ->where('quiz.id', $quiz->id)
                 ->where('quiz.title', 'Mental Arithmetic Quiz');
        });
    }

    public function test_student_can_start_mental_arithmetic_quiz()
    {
        $this->actingAs($this->student);

        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
            'settings' => [
                'session_count' => 3,
                'numbers_per_session' => 5,
            ],
        ]);

        $response = $this->post(route('student.quiz.start', $quiz->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('quiz_attempts', [
            'quiz_id' => $quiz->id,
            'user_id' => $this->student->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_student_can_take_mental_arithmetic_quiz()
    {
        $this->actingAs($this->student);

        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
            'settings' => [
                'session_count' => 3,
                'numbers_per_session' => 5,
            ],
        ]);

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $this->student->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        $response = $this->get(route('student.quiz.take', [$quiz->id, $attempt->id]));

        $response->assertOk();
        $response->assertInertia(function ($page) use ($quiz, $attempt) {
            $page->component('Student/Quiz/Take')
                 ->has('quiz')
                 ->has('attempt')
                 ->has('questions')
                 ->where('quiz.id', $quiz->id)
                 ->where('attempt.id', $attempt->id);
        });
    }

    public function test_student_can_submit_mental_arithmetic_quiz()
    {
        $this->actingAs($this->student);

        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
        ]);

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $this->student->id,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        $flashCardResults = json_encode([
            'type' => 'flash_card_sessions',
            'results' => [
                ['session_id' => 1, 'is_correct' => true],
                ['session_id' => 2, 'is_correct' => true],
                ['session_id' => 3, 'is_correct' => true],
            ],
            'correct_count' => 3,
            'total_sessions' => 3,
            'percentage' => 100
        ]);

        $response = $this->post(route('student.quiz.submit', [$quiz->id, $attempt->id]), [
            'answers' => [$flashCardResults]
        ]);

        $response->assertRedirect(route('student.quiz.result', [$quiz->id, $attempt->id]));
        
        $attempt->refresh();
        $this->assertEquals('completed', $attempt->status);
        $this->assertEquals(100, $attempt->score);
        $this->assertNotNull($attempt->completed_at);
    }

    public function test_student_can_view_quiz_results()
    {
        $this->actingAs($this->student);

        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'show_results_immediately' => true,
            'is_active' => true,
        ]);

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $this->student->id,
            'started_at' => now(),
            'status' => 'completed',
            'completed_at' => now(),
            'score' => 85,
            'answers' => [
                'temp_mental_arithmetic' => [
                    'answer' => json_encode([
                        'type' => 'flash_card_sessions',
                        'percentage' => 85,
                        'correct_count' => 2,
                        'total_sessions' => 3,
                    ])
                ]
            ]
        ]);

        $response = $this->get(route('student.quiz.result', [$quiz->id, $attempt->id]));

        $response->assertOk();
        $response->assertInertia(function ($page) use ($quiz, $attempt) {
            $page->component('Student/Quiz/Result')
                 ->has('quiz')
                 ->has('attempt')
                 ->where('quiz.id', $quiz->id)
                 ->where('attempt.id', $attempt->id);
        });
    }

    public function test_student_cannot_access_quiz_without_enrollment()
    {
        $unenrolledStudent = User::factory()->create();
        $unenrolledStudent->assignRole('student');
        
        $this->actingAs($unenrolledStudent);

        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
        ]);

        $response = $this->get(route('student.quiz.show', $quiz->id));

        $response->assertStatus(403);
    }

    public function test_student_cannot_access_inactive_quiz()
    {
        $this->actingAs($this->student);

        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => false, // Inactive
        ]);

        $response = $this->get(route('student.quiz.show', $quiz->id));

        $response->assertStatus(404);
    }

    public function test_student_can_retake_quiz_if_allowed()
    {
        $this->actingAs($this->student);

        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
        ]);

        // Create a failed attempt
        QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $this->student->id,
            'started_at' => now()->subHour(),
            'completed_at' => now()->subHour(),
            'status' => 'completed',
            'score' => 40, // Below passing score
        ]);

        $response = $this->post(route('student.quiz.start', $quiz->id));

        $response->assertRedirect();
        $this->assertEquals(2, QuizAttempt::where('quiz_id', $quiz->id)
                                        ->where('user_id', $this->student->id)
                                        ->count());
    }

    public function test_quiz_generation_produces_valid_sessions()
    {
        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
            'settings' => [
                'operations' => ['addition', 'subtraction'],
                'number_range' => ['min' => 1, 'max' => 10],
                'numbers_per_session' => 5,
                'session_count' => 3,
                'allow_negative' => false,
            ],
        ]);

        $sessions = $quiz->generateMentalArithmeticSessions(3);

        // Validate session structure
        $this->assertCount(3, $sessions);
        
        foreach ($sessions as $session) {
            $this->assertArrayHasKey('session_id', $session);
            $this->assertArrayHasKey('numbers', $session);
            $this->assertArrayHasKey('correct_answer', $session);
            $this->assertArrayHasKey('display_time', $session);
            
            // Validate numbers count
            $this->assertCount(5, $session['numbers']);
            
            // Validate no negative results when disabled
            $this->assertGreaterThanOrEqual(0, $session['correct_answer']);
            
            // Validate number ranges
            foreach ($session['numbers'] as $number) {
                if (is_numeric($number)) {
                    $this->assertGreaterThanOrEqual(1, abs($number));
                    $this->assertLessThanOrEqual(10, abs($number));
                }
            }
        }
    }
}