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
                'price' => 100,
                'duration' => '12 weeks',
                'image' => 'images/math.svg',
            ],
            [
                'name' => 'Coding for Kids(Scratch)',
                'description' => 'Introduce your child to the exciting world of programming through our fun and interactive Scratch coding program! Designed especially for young learners, this course teaches the basics of coding by letting kids build their own games, animations, and stories using colorful drag-and-drop blocks. No prior experience needed — just imagination!',
                'price' => 150,
                'duration' => '16 weeks',
                'image' => 'images/coding.svg',
            ],
        ];

        foreach ($programs as $program) {
            Program::create($program);
        }
    }
}
