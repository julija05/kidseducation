<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LessonProgress>
 */
class LessonProgressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(['not_started', 'in_progress', 'completed']);
        $progressPercentage = match($status) {
            'not_started' => 0,
            'in_progress' => $this->faker->numberBetween(1, 99),
            'completed' => 100,
        };

        return [
            'user_id' => \App\Models\User::factory(),
            'lesson_id' => \App\Models\Lesson::factory(),
            'status' => $status,
            'progress_percentage' => $progressPercentage,
            'score' => $status === 'completed' ? $this->faker->randomFloat(2, 60, 100) : null,
            'started_at' => $status !== 'not_started' ? $this->faker->dateTimeBetween('-2 weeks', 'now') : null,
            'completed_at' => $status === 'completed' ? $this->faker->dateTimeBetween('-1 week', 'now') : null,
            'session_data' => $this->faker->optional()->randomElement([
                ['time_spent' => $this->faker->numberBetween(300, 3600)],
                ['attempts' => $this->faker->numberBetween(1, 3)],
                ['resources_viewed' => $this->faker->numberBetween(1, 5)]
            ]),
        ];
    }
}
