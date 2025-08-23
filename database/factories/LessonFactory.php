<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lesson>
 */
class LessonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'program_id' => \App\Models\Program::factory(),
            'level' => $this->faker->numberBetween(1, 5),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'content_type' => $this->faker->randomElement(['video', 'text', 'interactive', 'quiz', 'mixed']),
            'content_url' => $this->faker->optional()->url(),
            'content_body' => $this->faker->optional()->paragraphs(3, true),
            'duration_minutes' => $this->faker->numberBetween(15, 120),
            'order_in_level' => $this->faker->numberBetween(1, 10),
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'metadata' => $this->faker->optional()->randomElement([
                ['difficulty' => 'easy'],
                ['difficulty' => 'medium', 'prerequisites' => []],
                ['difficulty' => 'hard', 'tools_required' => ['computer', 'browser']],
            ]),
        ];
    }
}
