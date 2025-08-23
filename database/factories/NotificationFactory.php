<?php

namespace Database\Factories;

use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'message' => $this->faker->sentence(8),
            'type' => $this->faker->randomElement(['enrollment', 'general', 'system']),
            'data' => null,
            'is_read' => false, // Default to unread
            'created_by' => null,
            'related_model_type' => null,
            'related_model_id' => null,
        ];
    }

    public function enrollment(): static
    {
        return $this->state(function (array $attributes) {
            $user = User::factory()->create();
            $enrollment = Enrollment::factory()->create(['user_id' => $user->id]);

            return [
                'title' => 'New Enrollment Request',
                'message' => "{$user->name} has requested enrollment in a program.",
                'type' => 'enrollment',
                'data' => [
                    'action' => 'pending',
                    'user_name' => $user->name,
                    'user_id' => $user->id,
                    'program_name' => $enrollment->program->name,
                    'program_id' => $enrollment->program->id,
                    'enrollment_id' => $enrollment->id,
                ],
                'related_model_type' => Enrollment::class,
                'related_model_id' => $enrollment->id,
                'created_by' => $user->id,
            ];
        });
    }

    public function enrollmentWithUser(User $user, Enrollment $enrollment): static
    {
        return $this->state(function (array $attributes) use ($user, $enrollment) {
            return [
                'title' => 'New Enrollment Request',
                'message' => "{$user->name} has requested enrollment in {$enrollment->program->name}.",
                'type' => 'enrollment',
                'data' => [
                    'action' => 'pending',
                    'user_name' => $user->name,
                    'user_id' => $user->id,
                    'program_name' => $enrollment->program->name,
                    'program_id' => $enrollment->program->id,
                    'enrollment_id' => $enrollment->id,
                ],
                'related_model_type' => Enrollment::class,
                'related_model_id' => $enrollment->id,
                'created_by' => $user->id,
            ];
        });
    }

    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
        ]);
    }

    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => false,
        ]);
    }

    public function general(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'general',
            'title' => 'General Notification',
            'message' => 'This is a general notification message.',
        ]);
    }

    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'system',
            'title' => 'System Update',
            'message' => 'System maintenance has been completed.',
        ]);
    }
}
