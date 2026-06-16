<?php

namespace Database\Factories;

use App\Models\ClassSchedule;
use App\Models\Program;
use App\Models\User;
use App\Models\WeeklyLearningReport;
use Illuminate\Database\Eloquent\Factories\Factory;

class WeeklyLearningReportFactory extends Factory
{
    protected $model = WeeklyLearningReport::class;

    public function definition(): array
    {
        $weekStart = now()->startOfWeek()->subWeeks($this->faker->numberBetween(0, 8));

        return [
            'child_user_id' => User::factory(),
            'class_schedule_id' => null,
            'program_id' => $this->faker->boolean(70) ? Program::factory() : null,
            'week_number' => (int) $weekStart->format('W'),
            'week_start_date' => $weekStart->toDateString(),
            'week_end_date' => $weekStart->copy()->endOfWeek()->toDateString(),
            'group_name' => null,
            'what_we_learned' => $this->faker->sentence(8),
            'what_to_practice' => $this->faker->sentence(8),
            'next_focus' => $this->faker->sentence(8),
            'individual_child_note' => $this->faker->optional()->sentence(10),
            'published_at' => now(),
        ];
    }

    public function forClassSchedule(ClassSchedule $classSchedule): static
    {
        return $this->state(fn (array $attributes) => [
            'class_schedule_id' => $classSchedule->id,
            'program_id' => $classSchedule->program_id,
            'group_name' => $classSchedule->is_group_class ? $classSchedule->title : null,
        ]);
    }

    public function unpublished(): static
    {
        return $this->state(fn (array $attributes) => [
            'published_at' => null,
        ]);
    }
}
