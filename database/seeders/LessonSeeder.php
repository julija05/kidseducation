<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\Program;
use Illuminate\Database\Seeder;

class LessonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all programs
        $programs = Program::all();

        foreach ($programs as $program) {
            $this->createLessonsForProgram($program);
        }
    }

    private function createLessonsForProgram(Program $program): void
    {
        // Level 1 Lessons (8 lessons as requested)
        $level1Lessons = [
            [
                'title' => 'Welcome to '.$program->name,
                'description' => 'Introduction to the program and what you will learn',
                'title_translations' => [
                    'en' => 'Welcome to '.$program->name,
                    'mk' => 'Добредојдовте во '.($program->name_translations['mk'] ?? $program->name),
                ],
                'description_translations' => [
                    'en' => 'Introduction to the program and what you will learn',
                    'mk' => 'Вовед во програмата и она што ќе научите',
                ],
                'content_type' => 'video',
                'content_url' => 'https://example.com/video1.mp4',
                'duration_minutes' => 15,
                'order_in_level' => 1,
            ],
            [
                'title' => 'Understanding the Basics',
                'description' => 'Fundamental concepts you need to know',
                'title_translations' => [
                    'en' => 'Understanding the Basics',
                    'mk' => 'Разбирање на основите',
                ],
                'description_translations' => [
                    'en' => 'Fundamental concepts you need to know',
                    'mk' => 'Основни концепти што треба да ги знаете',
                ],
                'content_type' => 'text',
                'content_body' => 'This is the content for understanding the basics...',
                'content_body_translations' => [
                    'en' => 'This is the content for understanding the basics...',
                    'mk' => 'Ова е содржината за разбирање на основите...',
                ],
                'duration_minutes' => 30,
                'order_in_level' => 2,
            ],
            [
                'title' => 'Core Principles',
                'description' => 'Learn the core principles that guide this field',
                'content_type' => 'video',
                'content_url' => 'https://example.com/video2.mp4',
                'duration_minutes' => 45,
                'order_in_level' => 3,
            ],
            [
                'title' => 'Practical Applications',
                'description' => 'See how these concepts apply in real situations',
                'content_type' => 'interactive',
                'content_url' => 'https://example.com/interactive1',
                'duration_minutes' => 60,
                'order_in_level' => 4,
            ],
            [
                'title' => 'Common Mistakes',
                'description' => 'Learn what to avoid and best practices',
                'content_type' => 'text',
                'content_body' => 'Here are the most common mistakes beginners make...',
                'duration_minutes' => 25,
                'order_in_level' => 5,
            ],
            [
                'title' => 'Building Your Foundation',
                'description' => 'Strengthen your understanding with exercises',
                'content_type' => 'interactive',
                'content_url' => 'https://example.com/exercises1',
                'duration_minutes' => 50,
                'order_in_level' => 6,
            ],
            [
                'title' => 'Level 1 Practice Session',
                'description' => 'Put your knowledge to the test',
                'content_type' => 'quiz',
                'content_url' => 'https://example.com/quiz1',
                'duration_minutes' => 30,
                'order_in_level' => 7,
            ],
            [
                'title' => 'Level 1 Assessment',
                'description' => 'Final assessment for Level 1',
                'content_type' => 'quiz',
                'content_url' => 'https://example.com/assessment1',
                'duration_minutes' => 45,
                'order_in_level' => 8,
            ],
        ];

        // Level 2 Lessons (6 lessons)
        $level2Lessons = [
            [
                'title' => 'Advanced Concepts Introduction',
                'description' => 'Moving beyond the basics',
                'content_type' => 'video',
                'content_url' => 'https://example.com/video3.mp4',
                'duration_minutes' => 40,
                'order_in_level' => 1,
            ],
            [
                'title' => 'Complex Problem Solving',
                'description' => 'Learn to tackle more challenging problems',
                'content_type' => 'interactive',
                'content_url' => 'https://example.com/interactive2',
                'duration_minutes' => 75,
                'order_in_level' => 2,
            ],
            [
                'title' => 'Industry Standards',
                'description' => 'Understanding professional standards and practices',
                'content_type' => 'text',
                'content_body' => 'Industry standards are crucial for professional work...',
                'duration_minutes' => 35,
                'order_in_level' => 3,
            ],
            [
                'title' => 'Case Study Analysis',
                'description' => 'Analyze real-world scenarios',
                'content_type' => 'video',
                'content_url' => 'https://example.com/video4.mp4',
                'duration_minutes' => 55,
                'order_in_level' => 4,
            ],
            [
                'title' => 'Advanced Practice',
                'description' => 'Apply advanced concepts in practice',
                'content_type' => 'interactive',
                'content_url' => 'https://example.com/exercises2',
                'duration_minutes' => 90,
                'order_in_level' => 5,
            ],
            [
                'title' => 'Level 2 Final Assessment',
                'description' => 'Comprehensive assessment for Level 2',
                'content_type' => 'quiz',
                'content_url' => 'https://example.com/assessment2',
                'duration_minutes' => 60,
                'order_in_level' => 6,
            ],
        ];

        // Level 3 Lessons (5 lessons)
        $level3Lessons = [
            [
                'title' => 'Expert Level Techniques',
                'description' => 'Master advanced techniques',
                'content_type' => 'video',
                'content_url' => 'https://example.com/video5.mp4',
                'duration_minutes' => 60,
                'order_in_level' => 1,
            ],
            [
                'title' => 'Leadership and Management',
                'description' => 'Learn to lead projects and teams',
                'content_type' => 'text',
                'content_body' => 'Leadership in this field requires specific skills...',
                'duration_minutes' => 45,
                'order_in_level' => 2,
            ],
            [
                'title' => 'Innovation and Trends',
                'description' => 'Stay ahead with latest innovations',
                'content_type' => 'video',
                'content_url' => 'https://example.com/video6.mp4',
                'duration_minutes' => 50,
                'order_in_level' => 3,
            ],
            [
                'title' => 'Capstone Project',
                'description' => 'Complete a comprehensive project',
                'content_type' => 'interactive',
                'content_url' => 'https://example.com/project',
                'duration_minutes' => 120,
                'order_in_level' => 4,
            ],
            [
                'title' => 'Final Certification Assessment',
                'description' => 'Final assessment to earn your certification',
                'content_type' => 'quiz',
                'content_url' => 'https://example.com/final_assessment',
                'duration_minutes' => 90,
                'order_in_level' => 5,
            ],
        ];

        // Create lessons for each level
        $this->createLessonsForLevel($program, 1, $level1Lessons);
        $this->createLessonsForLevel($program, 2, $level2Lessons);
        $this->createLessonsForLevel($program, 3, $level3Lessons);
    }

    private function createLessonsForLevel(Program $program, int $level, array $lessons): void
    {
        foreach ($lessons as $lessonData) {
            // Create lesson only if it doesn't exist (prevent duplicates)
            Lesson::firstOrCreate(
                [
                    'program_id' => $program->id,
                    'level' => $level,
                    'order_in_level' => $lessonData['order_in_level'],
                ], // Check by program, level, and order (unique identifier)
                [
                    'program_id' => $program->id,
                    'level' => $level,
                    'title' => $lessonData['title'],
                    'description' => $lessonData['description'],
                    'content_type' => $lessonData['content_type'],
                    'content_url' => $lessonData['content_url'] ?? null,
                    'content_body' => $lessonData['content_body'] ?? null,
                    'duration_minutes' => $lessonData['duration_minutes'],
                    'order_in_level' => $lessonData['order_in_level'],
                    'is_active' => true,
                    'metadata' => [
                        'difficulty' => $level === 1 ? 'beginner' : ($level === 2 ? 'intermediate' : 'advanced'),
                        'prerequisites' => $level > 1 ? ['Complete Level '.($level - 1)] : [],
                    ],
            ]);
        }
    }
}
