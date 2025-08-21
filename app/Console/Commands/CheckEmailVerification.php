<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CheckEmailVerification extends Command
{
    protected $signature = 'email:check-verification {email?} {--mark-verified}';

    protected $description = 'Check email verification status and optionally mark as verified';

    public function handle()
    {
        $email = $this->argument('email');

        if ($email) {
            $user = User::where('email', $email)->first();

            if (! $user) {
                $this->error("User with email '{$email}' not found.");

                return 1;
            }

            $this->info("User: {$user->name} ({$user->email})");
            $this->info('Email verified: '.($user->email_verified_at ? 'YES ('.$user->email_verified_at.')' : 'NO'));
            $this->info("Created at: {$user->created_at}");

            if (! $user->email_verified_at && $this->option('mark-verified')) {
                if ($this->confirm('Mark this email as verified?')) {
                    $user->email_verified_at = now();
                    $user->save();
                    $this->info('Email marked as verified!');
                }
            }
        } else {
            // Show summary
            $totalUsers = User::count();
            $verifiedUsers = User::whereNotNull('email_verified_at')->count();
            $unverifiedUsers = User::whereNull('email_verified_at')->count();

            $this->info('Email Verification Summary:');
            $this->info("Total users: {$totalUsers}");
            $this->info("Verified: {$verifiedUsers}");
            $this->info("Unverified: {$unverifiedUsers}");

            if ($unverifiedUsers > 0) {
                $this->info("\nUnverified users:");
                $unverified = User::whereNull('email_verified_at')->select('name', 'email', 'created_at')->get();

                $this->table(
                    ['Name', 'Email', 'Created At'],
                    $unverified->map(function ($user) {
                        return [$user->name, $user->email, $user->created_at];
                    })->toArray()
                );
            }
        }

        return 0;
    }
}
