<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class RestoreEnrollment extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'enrollment:restore {user_id} {program_name?}';

    /**
     * The console command description.
     */
    protected $description = 'Restore a deleted enrollment for a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        $programName = $this->argument('program_name') ?: 'Mental Arithmetic Mastery';

        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found!");
            return 1;
        }

        $this->info("Found user: {$user->name} (ID: {$user->id})");

        // First, create the program if it doesn't exist
        $program = Program::firstOrCreate([
            'slug' => Str::slug($programName)
        ], [
            'name' => $programName,
            'description' => 'Develop exceptional calculation speed and accuracy using abacus techniques. Enhances concentration, memory, and analytical thinking skills for children aged 7-17.',
            'price' => 55,
            'duration' => '12 months',
            'duration_weeks' => 48,
            'icon' => 'Calculator',
            'color' => 'bg-blue-600',
            'light_color' => 'bg-blue-100',
            'text_color' => 'text-blue-900',
            'requires_monthly_payment' => true,
        ]);

        if ($program->wasRecentlyCreated) {
            $this->info("Created program: {$program->name} (ID: {$program->id})");
        } else {
            $this->info("Found existing program: {$program->name} (ID: {$program->id})");
        }

        // Check if enrollment already exists
        $existingEnrollment = Enrollment::where('user_id', $user->id)
            ->where('program_id', $program->id)
            ->first();

        if ($existingEnrollment) {
            $this->info("Enrollment already exists: ID {$existingEnrollment->id}");
            $this->info("Status: {$existingEnrollment->status}");
            $this->info("Approval: {$existingEnrollment->approval_status}");
            return 0;
        }

        // Create new enrollment for the user
        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'program_id' => $program->id,
            'enrolled_at' => now(),
            'status' => 'active',
            'approval_status' => 'approved',
            'progress' => 0,
            'approved_at' => now(),
            'approved_by' => 1, // Assume admin user ID 1 exists
        ]);

        $this->info("✅ New enrollment created: ID {$enrollment->id}");
        $this->info("✅ User '{$user->name}' enrolled in '{$program->name}'");
        $this->info("✅ Status: {$enrollment->status}");
        $this->info("✅ Approval: {$enrollment->approval_status}");

        return 0;
    }
}