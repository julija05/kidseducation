<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Program;
use App\Models\Lesson;
use App\Models\LessonResource;

class MigrateExistingTranslations extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'translations:migrate-existing';

    /**
     * The console command description.
     */
    protected $description = 'Migrate existing content to translation format';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Migrating existing content to translation format...');
        
        // Migrate programs
        $this->info('Migrating programs...');
        $programCount = 0;
        Program::chunk(100, function ($programs) use (&$programCount) {
            foreach ($programs as $program) {
                if (!$program->name_translations) {
                    $program->update([
                        'name_translations' => ['en' => $program->name],
                        'description_translations' => ['en' => $program->description],
                    ]);
                    $programCount++;
                }
            }
        });
        $this->info("Migrated {$programCount} programs");

        // Migrate lessons
        $this->info('Migrating lessons...');
        $lessonCount = 0;
        Lesson::chunk(100, function ($lessons) use (&$lessonCount) {
            foreach ($lessons as $lesson) {
                if (!$lesson->title_translations) {
                    $lesson->update([
                        'title_translations' => ['en' => $lesson->title],
                        'description_translations' => $lesson->description ? ['en' => $lesson->description] : null,
                        'content_body_translations' => $lesson->content_body ? ['en' => $lesson->content_body] : null,
                    ]);
                    $lessonCount++;
                }
            }
        });
        $this->info("Migrated {$lessonCount} lessons");

        // Migrate lesson resources
        $this->info('Migrating lesson resources...');
        $resourceCount = 0;
        LessonResource::chunk(100, function ($resources) use (&$resourceCount) {
            foreach ($resources as $resource) {
                if (!$resource->title_translations) {
                    $resource->update([
                        'title_translations' => ['en' => $resource->title],
                        'description_translations' => $resource->description ? ['en' => $resource->description] : null,
                    ]);
                    $resourceCount++;
                }
            }
        });
        $this->info("Migrated {$resourceCount} lesson resources");

        $this->info('Migration completed successfully!');
        $this->info("Total migrated: {$programCount} programs, {$lessonCount} lessons, {$resourceCount} resources");
    }
}