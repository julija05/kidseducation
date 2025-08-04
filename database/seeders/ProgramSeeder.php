<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = [
            [
                'name' => 'Mental Arithmetic Mastery',
                'description' => 'Develop exceptional calculation speed and accuracy using abacus techniques. Enhances concentration, memory, and analytical thinking skills for children aged 6-12.',
                'price' => 100,
                'duration' => '12 weeks',
                'image' => 'math.svg',
                'icon' => 'Calculator',
            ],
            [
                'name' => 'Coding for Kids(Scratch)',
                'description' => 'Introduce your child to the exciting world of programming through our fun and interactive Scratch coding program! Designed especially for young learners, this course teaches the basics of coding by letting kids build their own games, animations, and stories using colorful drag-and-drop blocks. No prior experience needed — just imagination!',
                'price' => 150,
                'duration' => '16 weeks',
                'image' => 'coding.svg',
                'icon' => 'Code',
            ],
            [
                'name' => 'Test',
                'description' => 'Test',
                'price' => 150,
                'duration' => '16 weeks',
                'image' => 'coding.svg',
                'icon' => 'BookOpen',
            ],
        ];

        foreach ($programs as $program) {
            // Generate slug
            $program['slug'] = Str::slug($program['name']);

            // Convert duration to weeks
            $program['duration_weeks'] = $this->convertDurationToWeeks($program['duration']);

            // Create program
            Program::create($program);
        }
    }

    private function convertDurationToWeeks($duration)
    {
        $weeks = null;

        if (preg_match('/(\d+)\s*weeks?/i', $duration, $matches)) {
            $weeks = (int) $matches[1];
        } elseif (preg_match('/(\d+)\s*months?/i', $duration, $matches)) {
            $weeks = (int) $matches[1] * 4; // Approximate
        } elseif (preg_match('/(\d+)\s*years?/i', $duration, $matches)) {
            $weeks = (int) $matches[1] * 52;
        }

        return $weeks;
    }
}
