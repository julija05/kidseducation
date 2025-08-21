<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LessonResource>
 */
class LessonResourceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['video', 'document', 'link', 'download', 'interactive', 'quiz']);

        return [
            'lesson_id' => \App\Models\Lesson::factory(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->paragraph(),
            'type' => $type,
            'resource_url' => $type === 'link' ? $this->faker->url() :
                            ($type === 'video' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null),
            'file_path' => in_array($type, ['document', 'download']) ? 'lesson-resources/'.$this->faker->uuid().'.pdf' : null,
            'file_name' => in_array($type, ['document', 'download']) ? $this->faker->word().'.pdf' : null,
            'file_size' => in_array($type, ['document', 'download']) ? $this->faker->numberBetween(1024, 5242880) : null,
            'mime_type' => match ($type) {
                'document', 'download' => 'application/pdf',
                'video' => 'video/mp4',
                default => null
            },
            'order' => $this->faker->numberBetween(1, 10),
            'is_downloadable' => in_array($type, ['document', 'download']),
            'is_required' => $this->faker->boolean(30), // 30% chance of being required
            'metadata' => $this->faker->optional()->randomElement([
                ['duration' => $this->faker->numberBetween(300, 3600)],
                ['pages' => $this->faker->numberBetween(1, 50)],
                ['difficulty' => $this->faker->randomElement(['easy', 'medium', 'hard'])],
            ]),
        ];
    }
}
