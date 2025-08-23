<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Program>
 */
class ProgramFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(2, true);

        return [
            'name' => ucwords($name),
            'description' => $this->faker->paragraph(),
            'duration' => $this->faker->randomElement(['4 weeks', '6 weeks', '8 weeks', '12 weeks']),
            'price' => $this->faker->randomFloat(2, 99.99, 499.99),
            'slug' => \Illuminate\Support\Str::slug($name),
            'icon' => $this->faker->randomElement(['BookOpen', 'Code', 'Calculator', 'Palette', 'Music']),
            'color' => $this->faker->randomElement(['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600']),
            'light_color' => $this->faker->randomElement(['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-red-100']),
            'border_color' => $this->faker->randomElement(['border-blue-200', 'border-green-200', 'border-purple-200', 'border-red-200']),
            'text_color' => $this->faker->randomElement(['text-blue-900', 'text-green-900', 'text-purple-900', 'text-red-900']),
            'duration_weeks' => $this->faker->numberBetween(4, 12),
            'is_active' => $this->faker->boolean(80), // 80% chance of being active
        ];
    }
}
