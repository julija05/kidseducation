<?php

namespace Database\Seeders;

use App\Models\News;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create sample articles for different categories
        $articles = [
            [
                'title' => 'How to Enroll in a Program',
                'content' => "Welcome to Abacoding! Enrolling in our programs is easy and straightforward. Here's a step-by-step guide to get you started:\n\n1. **Browse Programs**: Visit our Programs page to see all available educational programs. Each program has detailed information about what you'll learn, the duration, and skill level required.\n\n2. **Choose Your Program**: Click on any program that interests you to view more details. You can see the curriculum, lessons, and what resources are included.\n\n3. **Click Enroll**: Once you've found the perfect program, click the 'Enroll Now' button. You'll need to create an account if you don't have one already.\n\n4. **Wait for Approval**: Our team reviews each enrollment request to ensure the best learning experience. You'll receive an email notification once your enrollment is approved.\n\n5. **Start Learning**: Once approved, access your dashboard to begin your learning journey!\n\nIf you have any questions during the enrollment process, don't hesitate to contact our support team.",
                'category' => 'how_to_use',
                'is_published' => true,
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'Navigating Your Student Dashboard',
                'content' => "Your student dashboard is your learning control center. Here's how to make the most of it:\n\n**Dashboard Overview**\nWhen you log in, you'll see your enrolled program(s), progress tracker, and upcoming classes.\n\n**Accessing Lessons**\nLessons are organized by levels. Start with Level 1 and progress through each lesson sequentially. Each lesson contains:\n- Video tutorials\n- Interactive exercises\n- Downloadable resources\n- Progress tracking\n\n**Tracking Your Progress**\nYour progress is automatically saved. Green checkmarks indicate completed lessons, while blue circles show your current lesson.\n\n**Upcoming Classes**\nIf you have scheduled 1-on-1 sessions, they'll appear at the top of your dashboard with date, time, and meeting link.\n\n**Getting Help**\nUse the notification bell to stay updated on important announcements and schedule changes.",
                'category' => 'how_to_use',
                'is_published' => true,
                'published_at' => now()->subDay(),
            ],
            [
                'title' => 'Understanding Program Levels and Progression',
                'content' => "Our programs are structured with multiple levels to ensure gradual skill building:\n\n**Level System**\nEach program has 3-5 levels, from beginner to advanced. You must complete all lessons in one level before advancing to the next.\n\n**Lesson Structure**\nWithin each level:\n- Lessons are numbered and must be completed in order\n- Each lesson includes theory, practice, and assessment\n- Resources like PDFs and videos supplement the learning\n\n**Progress Requirements**\nTo advance:\n1. Complete all lessons in your current level\n2. Achieve minimum score requirements where applicable\n3. Participate in scheduled review sessions if enrolled\n\n**Skill Badges**\nEarn badges as you complete levels! These appear on your profile and show your achievements.\n\n**Need Help?**\nIf you're stuck on a concept, use the 'Ask for Help' feature or schedule additional tutoring sessions.",
                'category' => 'tutorials',
                'is_published' => true,
                'published_at' => now()->subHours(12),
            ],
            [
                'title' => 'New Feature: Interactive Quizzes Now Available',
                'content' => "We're excited to announce the launch of interactive quizzes across all our programs!\n\n**What's New**\n- Interactive quiz system with immediate feedback\n- Progress tracking for quiz performance\n- Adaptive difficulty based on your skill level\n- Detailed explanations for each answer\n\n**How It Works**\nQuizzes are now integrated into lessons. After completing a lesson, you'll have the option to take a quiz to reinforce your learning.\n\n**Quiz Features**\n- Multiple choice and true/false questions\n- Instant feedback with explanations\n- Retake option if you don't meet the minimum score\n- Progress tracking in your dashboard\n\n**Coming Soon**\n- Timed challenges\n- Peer competitions\n- Advanced analytics for parents and teachers\n\n**Getting Started**\nQuizzes are automatically available in your enrolled programs. No additional setup required!",
                'category' => 'updates',
                'is_published' => true,
                'published_at' => now()->subHours(6),
            ],
            [
                'title' => 'How to Access and Download Lesson Resources',
                'content' => "Every lesson comes with valuable resources to enhance your learning experience. Here's how to access them:\n\n**Finding Resources**\nIn each lesson, look for the 'Resources' section. This typically includes:\n- PDF worksheets\n- Reference materials\n- Practice exercises\n- Supplementary videos\n\n**Downloading Files**\n1. Click on any resource link\n2. The file will download to your device automatically\n3. For videos, you can stream online or download for offline viewing\n\n**Organizing Your Downloads**\nWe recommend creating folders on your device:\n- Create a main 'Abacoding' folder\n- Add subfolders for each program\n- Further organize by level and lesson number\n\n**File Types**\n- **PDFs**: Worksheets, guides, and references\n- **Videos**: Tutorials and demonstrations\n- **Documents**: Instructions and templates\n\n**Troubleshooting**\nIf a download doesn't start:\n1. Check your internet connection\n2. Ensure pop-ups are enabled for our site\n3. Try right-clicking and selecting 'Save As'\n4. Contact support if problems persist",
                'category' => 'how_to_use',
                'is_published' => true,
                'published_at' => now()->subHours(18),
            ]
        ];

        foreach ($articles as $articleData) {
            News::create($articleData);
        }
    }
}