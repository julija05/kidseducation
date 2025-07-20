<?php

namespace Tests\Unit;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\Lesson;
use App\Models\Program;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QuizQuestionTest extends TestCase
{
    use RefreshDatabase;

    protected Quiz $quiz;

    protected function setUp(): void
    {
        parent::setUp();
        
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
            'title' => 'Test Quiz',
            'type' => 'mental_arithmetic',
            'max_attempts' => 3,
            'passing_score' => 70,
            'shuffle_answers' => true,
            'is_active' => true,
        ]);
    }


    public function it_validates_flash_card_session_answers_correctly()
    {
        $question = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'mental_arithmetic',
            'question_text' => 'Complete the mental arithmetic flash card sessions',
            'correct_answer' => 'flash_card_sessions',
            'points' => 10,
            'order' => 1,
        ]);

        // Test valid flash card session answer with high score
        $highScoreAnswer = json_encode([
            'type' => 'flash_card_sessions',
            'percentage' => 75
        ]);
        $this->assertTrue($question->isAnswerCorrect($highScoreAnswer));

        // Test valid flash card session answer with low score
        $lowScoreAnswer = json_encode([
            'type' => 'flash_card_sessions',
            'percentage' => 25
        ]);
        $this->assertFalse($question->isAnswerCorrect($lowScoreAnswer));

        // Test boundary case (exactly 50%)
        $boundaryAnswer = json_encode([
            'type' => 'flash_card_sessions',
            'percentage' => 50
        ]);
        $this->assertTrue($question->isAnswerCorrect($boundaryAnswer));
    }


    public function it_calculates_partial_credit_for_flash_card_sessions()
    {
        $question = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'mental_arithmetic',
            'question_text' => 'Complete the mental arithmetic flash card sessions',
            'correct_answer' => 'flash_card_sessions',
            'points' => 10,
            'order' => 1,
        ]);

        // Test full credit (100%)
        $fullCreditAnswer = json_encode([
            'type' => 'flash_card_sessions',
            'percentage' => 100
        ]);
        $this->assertEquals(1.0, $question->getPartialCredit($fullCreditAnswer));

        // Test partial credit (67%)
        $partialCreditAnswer = json_encode([
            'type' => 'flash_card_sessions',
            'percentage' => 67
        ]);
        $this->assertEquals(0.67, $question->getPartialCredit($partialCreditAnswer));

        // Test no credit (0%)
        $noCreditAnswer = json_encode([
            'type' => 'flash_card_sessions',
            'percentage' => 0
        ]);
        $this->assertEquals(0.0, $question->getPartialCredit($noCreditAnswer));
    }


    public function it_validates_multiple_choice_answers()
    {
        $question = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice',
            'question_text' => 'What is 2+2?',
            'answer_options' => ['a' => '3', 'b' => '4', 'c' => '5'],
            'correct_answer' => 'b',
            'points' => 10,
            'order' => 1,
        ]);

        $this->assertTrue($question->isAnswerCorrect('b'));
        $this->assertTrue($question->isAnswerCorrect('4')); // Answer by value
        $this->assertFalse($question->isAnswerCorrect('a'));
        $this->assertFalse($question->isAnswerCorrect('c'));
    }


    public function it_validates_true_false_answers()
    {
        $question = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'true_false',
            'question_text' => 'Is 2+2=4?',
            'correct_answer' => 'true',
            'points' => 5,
            'order' => 1,
        ]);

        $this->assertTrue($question->isAnswerCorrect('true'));
        $this->assertTrue($question->isAnswerCorrect('1'));
        $this->assertTrue($question->isAnswerCorrect('yes'));
        $this->assertFalse($question->isAnswerCorrect('false'));
        $this->assertFalse($question->isAnswerCorrect('0'));
    }


    public function it_provides_partial_credit_for_mental_arithmetic()
    {
        $question = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'mental_arithmetic',
            'question_text' => 'What is 10+5?',
            'correct_answer' => '15',
            'points' => 10,
            'order' => 1,
        ]);

        // Exact answer gets full credit
        $this->assertEquals(1.0, $question->getPartialCredit('15'));

        // Close answer (within 10% tolerance) gets partial credit
        $this->assertEquals(0.5, $question->getPartialCredit('14')); // Within tolerance
        $this->assertEquals(0.5, $question->getPartialCredit('16')); // Within tolerance

        // Far answer gets no credit
        $this->assertEquals(0.0, $question->getPartialCredit('20')); // Outside tolerance
    }


    public function it_formats_for_frontend_correctly()
    {
        $question = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'mental_arithmetic',
            'question_text' => 'Complete the mental arithmetic sessions',
            'question_data' => [
                'sessions' => [
                    ['session_id' => 1, 'numbers' => [1, 2, 3]]
                ]
            ],
            'correct_answer' => 'flash_card_sessions',
            'points' => 10,
            'order' => 1,
        ]);

        $formatted = $question->formatForFrontend();

        $this->assertArrayHasKey('id', $formatted);
        $this->assertArrayHasKey('type', $formatted);
        $this->assertArrayHasKey('question_text', $formatted);
        $this->assertArrayHasKey('question_data', $formatted);
        $this->assertArrayHasKey('points', $formatted);
        $this->assertEquals('mental_arithmetic', $formatted['type']);
        $this->assertEquals('Mental Arithmetic', $formatted['type_display']);
    }


    public function it_shuffles_answer_options_when_enabled()
    {
        $question = QuizQuestion::create([
            'quiz_id' => $this->quiz->id, // Quiz has shuffle_answers = true
            'type' => 'multiple_choice',
            'question_text' => 'What is 2+2?',
            'answer_options' => ['a' => '3', 'b' => '4', 'c' => '5'],
            'correct_answer' => 'b',
            'points' => 10,
            'order' => 1,
        ]);

        $shuffled = $question->getShuffledOptions();
        
        // Should have same content but potentially different order
        $this->assertCount(3, $shuffled);
        $this->assertContains('3', $shuffled);
        $this->assertContains('4', $shuffled);
        $this->assertContains('5', $shuffled);
    }


    public function it_handles_invalid_json_gracefully()
    {
        $question = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'mental_arithmetic',
            'question_text' => 'Complete the mental arithmetic sessions',
            'correct_answer' => 'flash_card_sessions',
            'points' => 10,
            'order' => 1,
        ]);

        $this->assertFalse($question->isAnswerCorrect('invalid json'));
        $this->assertEquals(0.0, $question->getPartialCredit('invalid json'));
    }


    public function it_returns_correct_type_display()
    {
        $mentalArithmeticQuestion = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'mental_arithmetic',
            'question_text' => 'Test',
            'correct_answer' => 'test',
            'points' => 10,
            'order' => 1,
        ]);

        $this->assertEquals('Mental Arithmetic', $mentalArithmeticQuestion->type_display);

        $multipleChoiceQuestion = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'multiple_choice',
            'question_text' => 'Test',
            'correct_answer' => 'test',
            'points' => 10,
            'order' => 2,
        ]);

        $this->assertEquals('Multiple Choice', $multipleChoiceQuestion->type_display);
    }


    public function it_formats_time_limit_correctly()
    {
        $question = QuizQuestion::create([
            'quiz_id' => $this->quiz->id,
            'type' => 'mental_arithmetic',
            'question_text' => 'Test',
            'correct_answer' => 'test',
            'points' => 10,
            'time_limit' => 60,
            'order' => 1,
        ]);

        $this->assertEquals('60 seconds', $question->formatted_time_limit);

        $question->update(['time_limit' => 1]);
        $this->assertEquals('1 second', $question->formatted_time_limit);
    }
}