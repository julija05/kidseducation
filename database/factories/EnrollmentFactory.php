<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Enrollment>
 */
class EnrollmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $approvalStatus = $this->faker->randomElement(['pending', 'approved', 'rejected']);

        // Set status based on approval status for realistic combinations
        $status = match ($approvalStatus) {
            'pending' => 'paused',
            'approved' => $this->faker->randomElement(['active', 'completed', 'paused']),
            'rejected' => 'cancelled',
        };

        // Set progress based on status
        $progress = match ($status) {
            'paused' => $this->faker->randomFloat(2, 0, 30),
            'active' => $this->faker->randomFloat(2, 0, 95),
            'completed' => 100.00,
            'cancelled' => $this->faker->randomFloat(2, 0, 20),
        };

        return [
            'user_id' => \App\Models\User::factory(),
            'program_id' => \App\Models\Program::factory(),
            'enrolled_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'status' => $status,
            'progress' => $progress,
            'approval_status' => $approvalStatus,
        ];
    }
}
