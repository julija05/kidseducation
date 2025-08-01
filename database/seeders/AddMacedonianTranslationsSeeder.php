<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Program;

class AddMacedonianTranslationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting translation seeder...');

        // First, check if we need to run migrations
        if (!$this->hasTranslationColumns()) {
            $this->command->error('Translation columns not found. Please run migrations first:');
            $this->command->error('php artisan migrate');
            return;
        }

        // Add Macedonian translations for existing programs
        $programs = [
            'Mental Arithmetic Mastery' => [
                'name_mk' => 'Ментална Аритметика',
                'description_mk' => 'Развијте исклучителна брзина и точност на пресметување користејќи техники на абакус. Ја подобрува концентрацијата, меморијата и вештините за аналитичко размислување кај децата на возраст од 6-12 години.'
            ],
            'Coding for Kids(Scratch)' => [
                'name_mk' => 'Програмирање за Деца (Scratch)',
                'description_mk' => 'Запознајте го вашето дете со возбудливиот свет на програмирање преку нашата забавна и интерактивна Scratch програма за програмирање! Дизајнирана специјално за млади ученици, овој курс ги предава основите на програмирањето така што им дозволува на децата да градат свои игри, анимации и приказни користејќи шарени блокови за влечење и пуштање. Не е потребно претходно искуство — само имагинација!'
            ]
        ];

        $updatedCount = 0;
        foreach ($programs as $programName => $translations) {
            $program = Program::where('name', $programName)->first();

            if ($program) {
                // Check if translations already exist
                if ($program->name_translations && isset($program->name_translations['mk'])) {
                    $this->command->info("Translations already exist for: {$program->name}");
                    continue;
                }

                // Update program with translations
                $nameTranslations = ['en' => $program->name, 'mk' => $translations['name_mk']];
                $descriptionTranslations = ['en' => $program->description, 'mk' => $translations['description_mk']];

                $program->update([
                    'name_translations' => $nameTranslations,
                    'description_translations' => $descriptionTranslations,
                ]);

                $updatedCount++;
                $this->command->info("✓ Added Macedonian translations for: {$program->name}");
            } else {
                $this->command->warn("Program not found: {$programName}");
            }
        }

        // Example lessons with Macedonian translations
        $lessonCount = $this->addLessonTranslations();

        $this->command->info("Translation seeder completed!");
        $this->command->info("Updated {$updatedCount} programs and {$lessonCount} lessons with Macedonian translations.");
    }

    private function hasTranslationColumns(): bool
    {
        try {
            $program = Program::first();
            return $program && method_exists($program, 'getTranslatedAttribute');
        } catch (\Exception $e) {
            return false;
        }
    }

    private function addLessonTranslations(): int
    {
        $updatedCount = 0;

        // Add sample lesson translations
        $mentalArithmeticProgram = Program::where('name', 'Mental Arithmetic Mastery')->first();

        if ($mentalArithmeticProgram && $mentalArithmeticProgram->lessons()->exists()) {
            $lessons = $mentalArithmeticProgram->lessons()->take(3)->get();

            $lessonTranslations = [
                0 => [
                    'title_mk' => 'Воведување во Абакус',
                    'description_mk' => 'Научете ги основите на користењето на абакус за математички пресметки.',
                ],
                1 => [
                    'title_mk' => 'Основни Операции со Абакус',
                    'description_mk' => 'Мајсторирајте основни собирања и одземања користејќи техники на абакус.',
                ],
                2 => [
                    'title_mk' => 'Напредни Техники на Абакус',
                    'description_mk' => 'Откријте напредни методи за брзи и точни пресметки.',
                ],
            ];

            foreach ($lessons as $index => $lesson) {
                if (isset($lessonTranslations[$index])) {
                    // Check if translations already exist
                    if ($lesson->title_translations && isset($lesson->title_translations['mk'])) {
                        $this->command->info("Lesson translations already exist for: {$lesson->title}");
                        continue;
                    }

                    $translation = $lessonTranslations[$index];

                    $titleTranslations = ['en' => $lesson->title, 'mk' => $translation['title_mk']];
                    $descriptionTranslations = ['en' => $lesson->description ?? '', 'mk' => $translation['description_mk']];

                    $lesson->update([
                        'title_translations' => $titleTranslations,
                        'description_translations' => $descriptionTranslations,
                    ]);

                    $updatedCount++;
                    $this->command->info("✓ Added Macedonian translations for lesson: {$lesson->title}");
                }
            }
        } else {
            $this->command->warn("No lessons found for Mental Arithmetic Mastery program");
        }

        return $updatedCount;
    }
}
