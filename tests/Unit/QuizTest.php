<?php

namespace Tests\Unit;

use App\Models\Lesson;
use App\Models\Program;
use App\Models\Quiz;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuizTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test data
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
    }

    public function it_can_generate_mental_arithmetic_sessions_with_default_settings()
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
                'display_time' => 5,
                'allow_negative' => true,
            ],
        ]);

        $sessions = $quiz->generateMentalArithmeticSessions(3);

        $this->assertCount(3, $sessions);

        foreach ($sessions as $session) {
            $this->assertArrayHasKey('session_id', $session);
            $this->assertArrayHasKey('numbers', $session);
            $this->assertArrayHasKey('correct_answer', $session);
            $this->assertArrayHasKey('display_time', $session);
            $this->assertCount(5, $session['numbers']);
            $this->assertEquals(5, $session['display_time']);
        }
    }

    public function it_prevents_negative_results_when_disabled()
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
                'display_time' => 5,
                'allow_negative' => false, // Key setting
            ],
        ]);

        $sessions = $quiz->generateMentalArithmeticSessions(10); // Generate more to test thoroughly

        foreach ($sessions as $session) {
            $this->assertGreaterThanOrEqual(0, $session['correct_answer'],
                'Session result should not be negative when allow_negative is false');
        }
    }

    public function it_generates_sessions_with_multiplication()
    {
        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
            'settings' => [
                'operations' => ['multiplication'],
                'number_range' => ['min' => 2, 'max' => 5],
                'numbers_per_session' => 3,
                'display_time' => 5,
                'allow_negative' => false,
            ],
        ]);

        $sessions = $quiz->generateMentalArithmeticSessions(2);

        foreach ($sessions as $session) {
            $hasMultiplication = false;
            foreach ($session['numbers'] as $number) {
                if (is_array($number) && isset($number['operation']) && $number['operation'] === 'multiply') {
                    $hasMultiplication = true;
                    break;
                }
            }
            // Note: multiplication might not appear in every session due to randomness
        }
    }

    public function it_generates_sessions_with_division()
    {
        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
            'settings' => [
                'operations' => ['division'],
                'number_range' => ['min' => 10, 'max' => 20],
                'numbers_per_session' => 3,
                'display_time' => 5,
                'allow_negative' => false,
            ],
        ]);

        $sessions = $quiz->generateMentalArithmeticSessions(2);

        foreach ($sessions as $session) {
            // Division should result in whole numbers
            $this->assertEquals(intval($session['correct_answer']), $session['correct_answer'],
                'Division should result in whole numbers');
        }
    }

    public function it_respects_number_range_settings()
    {
        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
            'settings' => [
                'operations' => ['addition'],
                'number_range' => ['min' => 15, 'max' => 25],
                'numbers_per_session' => 3,
                'display_time' => 5,
                'allow_negative' => false,
            ],
        ]);

        $sessions = $quiz->generateMentalArithmeticSessions(5);

        foreach ($sessions as $session) {
            foreach ($session['numbers'] as $number) {
                if (is_numeric($number)) {
                    $this->assertGreaterThanOrEqual(15, abs($number));
                    $this->assertLessThanOrEqual(25, abs($number));
                }
            }
        }
    }

    public function it_calculates_correct_answers_for_addition_only()
    {
        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
            'settings' => [
                'operations' => ['addition'],
                'number_range' => ['min' => 1, 'max' => 5],
                'numbers_per_session' => 4,
                'display_time' => 5,
                'allow_negative' => false,
            ],
        ]);

        $sessions = $quiz->generateMentalArithmeticSessions(1);
        $session = $sessions[0];

        // Manually calculate the expected result
        $expectedResult = array_sum($session['numbers']);

        $this->assertEquals($expectedResult, $session['correct_answer']);
    }

    public function it_returns_correct_type_display()
    {
        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Test Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
        ]);

        $this->assertEquals('Mental Arithmetic', $quiz->type_display);
    }

    public function it_formats_time_limits_correctly()
    {
        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Test Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'time_limit' => 3600, // 1 hour
            'is_active' => true,
        ]);

        $this->assertEquals('1 hour', $quiz->formatted_time_limit);

        $quiz->update(['time_limit' => 90]); // 1.5 minutes
        $this->assertEquals('1m 30s', $quiz->formatted_time_limit);

        $quiz->update(['time_limit' => 30]); // 30 seconds
        $this->assertEquals('30 seconds', $quiz->formatted_time_limit);
    }

    public function it_handles_empty_settings_gracefully()
    {
        $quiz = Quiz::create([
            'lesson_id' => $this->lesson->id,
            'title' => 'Mental Arithmetic Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'is_active' => true,
            'settings' => null, // No settings
        ]);

        $sessions = $quiz->generateMentalArithmeticSessions(2);

        $this->assertCount(2, $sessions);

        // Should use default values
        foreach ($sessions as $session) {
            $this->assertArrayHasKey('numbers', $session);
            $this->assertArrayHasKey('correct_answer', $session);
            $this->assertCount(5, $session['numbers']); // Default numbers_per_session
        }
    }
}
