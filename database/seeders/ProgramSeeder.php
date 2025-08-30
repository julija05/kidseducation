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
                'description' => 'Develop exceptional calculation speed and accuracy using abacus techniques. Enhances concentration, memory, and analytical thinking skills for children aged 7-17.',
                'price' => 55,
                'duration' => '12 months',
                'icon' => 'Calculator',
                'color' => 'bg-blue-600',
                'light_color' => 'bg-blue-100',
                'text_color' => 'text-blue-900',
                'requires_monthly_payment' => true,
            ],
        ];

        foreach ($programs as $program) {
            // Generate slug
            $program['slug'] = Str::slug($program['name']);

            // Convert duration to weeks
            $program['duration_weeks'] = $this->convertDurationToWeeks($program['duration']);

            // Create program only if it doesn't exist (prevent duplicates)
            Program::firstOrCreate(
                ['slug' => $program['slug']], // Check by slug (unique identifier)
                $program // Create with these attributes if not found
            );
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
