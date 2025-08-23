<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;

class UpdateProgramLevelRequirementsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultRequirements = [
            '1' => 0,    // Level 1 - always unlocked
            '2' => 10,   // Level 2 - need 10 points
            '3' => 25,   // Level 3 - need 25 points
            '4' => 50,   // Level 4 - need 50 points
            '5' => 100,  // Level 5 - need 100 points
        ];

        Program::whereNull('level_requirements')
            ->update(['level_requirements' => $defaultRequirements]);
    }
}
