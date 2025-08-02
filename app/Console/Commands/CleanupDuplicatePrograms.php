<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Program;
use App\Models\Enrollment;

class CleanupDuplicatePrograms extends Command
{
    protected $signature = 'programs:cleanup-duplicates';
    protected $description = 'Clean up duplicate programs and merge translations';

    public function handle()
    {
        $this->info('🧹 Cleaning up duplicate programs...');
        
        // Find duplicates by name
        $programNames = ['Mental Arithmetic Mastery', 'Coding for Kids(Scratch)'];
        
        foreach ($programNames as $programName) {
            $programs = Program::where('name', $programName)->get();
            
            if ($programs->count() > 1) {
                $this->info("Found {$programs->count()} duplicates for: {$programName}");
                
                // Find the one with translations (keep this one)
                $programWithTranslations = $programs->first(function ($program) {
                    return $program->name_translations && 
                           isset($program->name_translations['mk']);
                });
                
                // Find the one without translations (remove this one)
                $programWithoutTranslations = $programs->first(function ($program) {
                    return !$program->name_translations || 
                           !isset($program->name_translations['mk']);
                });
                
                if ($programWithTranslations && $programWithoutTranslations) {
                    $this->info("  ✓ Keeping program ID {$programWithTranslations->id} (has translations)");
                    $this->info("  ✗ Removing program ID {$programWithoutTranslations->id} (no translations)");
                    
                    // Move any enrollments from the duplicate to the main program
                    $enrollments = Enrollment::where('program_id', $programWithoutTranslations->id)->get();
                    foreach ($enrollments as $enrollment) {
                        // Check if user already has enrollment in the correct program
                        $existingEnrollment = Enrollment::where('program_id', $programWithTranslations->id)
                            ->where('user_id', $enrollment->user_id)
                            ->first();
                        
                        if (!$existingEnrollment) {
                            $enrollment->update(['program_id' => $programWithTranslations->id]);
                            $this->info("    → Moved enrollment for user {$enrollment->user_id}");
                        } else {
                            $this->info("    → Deleted duplicate enrollment for user {$enrollment->user_id}");
                            $enrollment->delete();
                        }
                    }
                    
                    // Delete the duplicate program
                    $programWithoutTranslations->delete();
                    $this->info("    ✓ Deleted duplicate program");
                } else {
                    $this->warn("  Could not identify which program to keep for: {$programName}");
                }
            } else {
                $this->info("No duplicates found for: {$programName}");
            }
        }
        
        // Clean up the Test program if it exists and has no enrollments
        $testProgram = Program::where('name', 'Test')->first();
        if ($testProgram) {
            $hasEnrollments = $testProgram->enrollments()->exists();
            if (!$hasEnrollments) {
                $testProgram->delete();
                $this->info("✓ Deleted 'Test' program (no enrollments)");
            } else {
                $this->info("Kept 'Test' program (has enrollments)");
            }
        }
        
        $this->info('🎉 Cleanup completed!');
        
        // Show final status
        $this->info('Final program list:');
        $finalPrograms = Program::all();
        foreach ($finalPrograms as $program) {
            $hasTranslations = $program->name_translations && isset($program->name_translations['mk']);
            $status = $hasTranslations ? '✅ (with translations)' : '❌ (no translations)';
            $this->info("  - {$program->name} {$status}");
        }
    }
}