<?php

namespace App\Console\Commands;

use App\Models\Program;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;

class DebugTranslations extends Command
{
    protected $signature = 'translations:debug {--user-id=1}';

    protected $description = 'Debug translation system';

    public function handle()
    {
        $this->info('🔍 Debugging Translation System...');
        $this->newLine();

        // 1. Check if translation columns exist
        $this->info('1. Checking database columns...');
        try {
            $program = Program::first();
            if ($program) {
                $hasNameTranslations = $program->getConnection()->getSchemaBuilder()->hasColumn('programs', 'name_translations');
                $hasDescTranslations = $program->getConnection()->getSchemaBuilder()->hasColumn('programs', 'description_translations');

                $this->info('   ✓ name_translations column exists: '.($hasNameTranslations ? 'YES' : 'NO'));
                $this->info('   ✓ description_translations column exists: '.($hasDescTranslations ? 'YES' : 'NO'));
            }
        } catch (\Exception $e) {
            $this->error('   ✗ Error checking columns: '.$e->getMessage());
        }
        $this->newLine();

        // 2. Check translation data in database
        $this->info('2. Checking translation data...');
        $programs = Program::take(2)->get();
        foreach ($programs as $program) {
            $this->info("   Program: {$program->name}");
            $this->info('   - name_translations: '.json_encode($program->name_translations));
            $this->info('   - description_translations: '.json_encode($program->description_translations));
            $this->newLine();
        }

        // 3. Check current app locale
        $this->info('3. Checking application locale...');
        $this->info('   Current app locale: '.App::getLocale());
        $this->info('   Supported locales: '.json_encode(config('app.supported_locales')));
        $this->newLine();

        // 4. Check user language preference
        $userId = $this->option('user-id');
        $this->info("4. Checking user language preference (user ID: {$userId})...");
        try {
            $user = User::find($userId);
            if ($user) {
                $this->info("   User: {$user->name} ({$user->email})");
                $this->info('   - language_preference: '.($user->language_preference ?? 'NULL'));
                $this->info('   - language_selected: '.($user->language_selected ? 'true' : 'false'));
            } else {
                $this->warn("   User with ID {$userId} not found");
            }
        } catch (\Exception $e) {
            $this->error('   ✗ Error checking user: '.$e->getMessage());
        }
        $this->newLine();

        // 5. Test model methods
        $this->info('5. Testing model translation methods...');
        $program = Program::first();
        if ($program) {
            $this->info("   Program: {$program->name}");

            // Test with current locale
            $this->info('   Testing with current locale ('.App::getLocale().'):');
            try {
                $translatedName = $program->translated_name;
                $translatedDesc = $program->translated_description;
                $this->info('   - translated_name: '.($translatedName ?? 'NULL'));
                $this->info('   - translated_description: '.(strlen($translatedDesc ?? '') > 50 ? substr($translatedDesc, 0, 50).'...' : $translatedDesc ?? 'NULL'));
            } catch (\Exception $e) {
                $this->error('   ✗ Error getting translated attributes: '.$e->getMessage());
            }

            // Test with Macedonian locale
            $this->info('   Testing with Macedonian locale:');
            App::setLocale('mk');
            try {
                $translatedName = $program->translated_name;
                $translatedDesc = $program->translated_description;
                $this->info('   - translated_name (mk): '.($translatedName ?? 'NULL'));
                $this->info('   - translated_description (mk): '.(strlen($translatedDesc ?? '') > 50 ? substr($translatedDesc, 0, 50).'...' : $translatedDesc ?? 'NULL'));
            } catch (\Exception $e) {
                $this->error('   ✗ Error getting Macedonian translations: '.$e->getMessage());
            }
        }
        $this->newLine();

        // 6. Check trait methods
        $this->info('6. Testing trait methods...');
        if ($program) {
            try {
                $hasTranslations = method_exists($program, 'getTranslatedAttribute');
                $this->info('   HasTranslations trait loaded: '.($hasTranslations ? 'YES' : 'NO'));

                if ($hasTranslations) {
                    $allNameTranslations = $program->getAllTranslations('name');
                    $this->info('   All name translations: '.json_encode($allNameTranslations));
                }
            } catch (\Exception $e) {
                $this->error('   ✗ Error testing trait methods: '.$e->getMessage());
            }
        }

        $this->newLine();
        $this->info('🏁 Debug completed!');
    }
}
