<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
                'price' => 299.99,
                'duration' => '12 weeks'
            ],
            [
                'name' => 'Creative Writing Workshop',
                'description' => 'Unlock your child\'s imagination through structured storytelling exercises. Improves language skills, creativity, and self-expression for ages 8-14.',
                'price' => 199.50,
                'duration' => '8 weeks'
            ],
            [
                'name' => 'Junior Robotics Academy',
                'description' => 'Introduction to robotics and programming through hands-on projects. Teaches logical thinking and problem-solving skills for children 9-15 years old.',
                'price' => 399.00,
                'duration' => '16 weeks'
            ]
        ];

        foreach ($programs as $program) {
            Program::create($program);
        }
    }
    
}
