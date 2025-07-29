<?php

namespace Database\Factories;

use App\Models\ClassSchedule;
use App\Models\User;
use App\Models\Program;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassScheduleFactory extends Factory
{
    protected $model = ClassSchedule::class;

    public function definition(): array
    {
        $scheduledAt = $this->faker->dateTimeBetween('now', '+2 months');
        
        return [
            'student_id' => User::factory(),
            'admin_id' => User::factory(),
            'program_id' => $this->faker->boolean(70) ? Program::factory() : null,
            'lesson_id' => null, // Will be set if program is set
            'title' => $this->faker->randomElement([
                'Math Tutoring Session',
                'Programming Lesson',
                'Science Review',
                'English Consultation',
                'Quiz Assessment',
                'Progress Review',
            ]),
            'description' => $this->faker->optional(0.6)->sentence(10),
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => $this->faker->randomElement([30, 45, 60, 90, 120]),
            'location' => $this->faker->optional(0.4)->randomElement([
                'Online',
                'Room 101',
                'Library Study Room',
                'Main Campus - Building A',
            ]),
            'meeting_link' => $this->faker->optional(0.6)->url(),
            'status' => $this->faker->randomElement(['scheduled', 'confirmed', 'cancelled', 'completed']),
            'type' => $this->faker->randomElement(['lesson', 'assessment', 'consultation', 'review']),
            'cancellation_reason' => null,
            'cancelled_at' => null,
            'cancelled_by' => null,
            'session_notes' => null,
            'session_data' => null,
            'completed_at' => null,
            'student_notified_at' => $this->faker->boolean(80) ? $this->faker->dateTimeBetween('-1 week', 'now') : null,
            'reminder_sent_at' => null,
        ];
    }

    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'scheduled',
            'cancelled_at' => null,
            'cancelled_by' => null,
            'completed_at' => null,
            'cancellation_reason' => null,
        ]);
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
            'cancelled_at' => null,
            'cancelled_by' => null,
            'completed_at' => null,
            'cancellation_reason' => null,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancelled_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'cancelled_by' => User::factory(),
            'cancellation_reason' => $this->faker->randomElement([
                'Student unavailable',
                'Instructor illness',
                'Technical issues',
                'Emergency cancellation',
                'Rescheduled by request',
            ]),
            'completed_at' => null,
        ]);
    }

    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            // For completed classes, ensure scheduled_at is in the past
            $scheduledAt = $this->faker->dateTimeBetween('-2 months', '-1 day');
            $completedAt = $this->faker->dateTimeBetween($scheduledAt, 'now');
            
            return [
                'scheduled_at' => $scheduledAt,
                'status' => 'completed',
                'completed_at' => $completedAt,
                'session_notes' => $this->faker->optional(0.7)->paragraph(2),
                'session_data' => $this->faker->optional(0.3)->randomElement([
                    ['topics_covered' => ['Basic Math', 'Addition', 'Subtraction']],
                    ['homework_assigned' => true, 'next_topic' => 'Multiplication'],
                    ['student_progress' => 'Good', 'areas_to_improve' => 'Practice more'],
                ]),
                'cancelled_at' => null,
                'cancelled_by' => null,
                'cancellation_reason' => null,
            ];
        });
    }

    public function upcoming(): static
    {
        return $this->state(fn (array $attributes) => [
            'scheduled_at' => $this->faker->dateTimeBetween('now', '+1 month'),
            'status' => $this->faker->randomElement(['scheduled', 'confirmed']),
        ]);
    }

    public function today(): static
    {
        return $this->state(fn (array $attributes) => [
            'scheduled_at' => $this->faker->dateTimeBetween('today', 'today +23 hours'),
        ]);
    }

    public function thisWeek(): static
    {
        return $this->state(fn (array $attributes) => [
            'scheduled_at' => $this->faker->dateTimeBetween('now', '+1 week'),
        ]);
    }

    public function withStudent(User $student): static
    {
        return $this->state(fn (array $attributes) => [
            'student_id' => $student->id,
        ]);
    }

    public function withAdmin(User $admin): static
    {
        return $this->state(fn (array $attributes) => [
            'admin_id' => $admin->id,
        ]);
    }

    public function withProgram(Program $program): static
    {
        return $this->state(fn (array $attributes) => [
            'program_id' => $program->id,
        ]);
    }

    public function withLesson(Lesson $lesson): static
    {
        return $this->state(fn (array $attributes) => [
            'lesson_id' => $lesson->id,
            'program_id' => $lesson->program_id,
        ]);
    }

    public function online(): static
    {
        return $this->state(fn (array $attributes) => [
            'location' => 'Online',
            'meeting_link' => $this->faker->url(),
        ]);
    }

    public function inPerson(): static
    {
        return $this->state(fn (array $attributes) => [
            'location' => $this->faker->randomElement([
                'Room 101',
                'Library Study Room',
                'Main Campus - Building A',
                'Conference Room B',
            ]),
            'meeting_link' => null,
        ]);
    }

    public function lesson(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'lesson',
            'title' => $this->faker->randomElement([
                'Math Lesson',
                'Programming Tutorial',
                'Science Lesson',
                'English Lesson',
            ]),
        ]);
    }

    public function assessment(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'assessment',
            'title' => $this->faker->randomElement([
                'Math Assessment',
                'Programming Quiz',
                'Science Test',
                'Progress Evaluation',
            ]),
        ]);
    }

    public function consultation(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'consultation',
            'title' => $this->faker->randomElement([
                'Learning Consultation',
                'Progress Discussion',
                'Goal Setting Session',
                'Academic Planning',
            ]),
        ]);
    }
}