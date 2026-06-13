<?php

namespace Database\Factories;

use App\Models\ChildProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChildProfile>
 */
class ChildProfileFactory extends Factory
{
    protected $model = ChildProfile::class;

    public function definition(): array
    {
        return [
            'parent_user_id' => User::factory(),
            'child_name' => fake()->name(),
            'age' => fake()->numberBetween(5, 18),
            'grade_class' => fake()->randomElement(['1A', '2B', 'Grade 3', 'Grade 4', 'Grade 5']),
            'status' => fake()->randomElement(ChildProfile::STATUSES),
            'notes' => fake()->optional()->paragraph(),
        ];
    }
}
