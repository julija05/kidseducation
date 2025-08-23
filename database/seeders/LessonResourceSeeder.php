<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\LessonResource;
use Illuminate\Database\Seeder;

class LessonResourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first few lessons to add sample resources
        $lessons = Lesson::take(3)->get();

        foreach ($lessons as $lesson) {
            $this->createResourcesForLesson($lesson);
        }
    }

    private function createResourcesForLesson(Lesson $lesson): void
    {
        $resources = [
            [
                'title' => 'Video Tutorial',
                'description' => 'Watch this video to learn the concepts',
                'title_translations' => [
                    'en' => 'Video Tutorial',
                    'mk' => 'Видео урок',
                ],
                'description_translations' => [
                    'en' => 'Watch this video to learn the concepts',
                    'mk' => 'Погледнете го ова видео за да ги научите концептите',
                ],
                'type' => 'video',
                'resource_url' => 'https://www.youtube.com/watch?v=example',
                'order' => 1,
                'is_required' => true,
            ],
            [
                'title' => 'Practice Worksheet',
                'description' => 'Download and complete this worksheet',
                'title_translations' => [
                    'en' => 'Practice Worksheet',
                    'mk' => 'Работен лист за вежбање',
                ],
                'description_translations' => [
                    'en' => 'Download and complete this worksheet',
                    'mk' => 'Преземете и пополнете го овој работен лист',
                ],
                'type' => 'document',
                'file_name' => 'practice_worksheet.pdf',
                'order' => 2,
                'is_downloadable' => true,
                'is_required' => false,
            ],
        ];

        foreach ($resources as $resourceData) {
            $resourceData['lesson_id'] = $lesson->id;
            LessonResource::create($resourceData);
        }
    }
}
