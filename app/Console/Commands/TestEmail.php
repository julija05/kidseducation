<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'email:test {email?} {--verification} {--reset-password}';

    protected $description = 'Test email functionality';

    public function handle()
    {
        $email = $this->argument('email');

        if (! $email) {
            $email = $this->ask('Enter an email address to test');
        }

        $this->info('Testing email functionality...');
        $this->info('Mail configuration:');
        $this->info('- Mailer: '.config('mail.default'));
        $this->info('- Host: '.config('mail.mailers.smtp.host'));
        $this->info('- Port: '.config('mail.mailers.smtp.port'));
        $this->info('- From: '.config('mail.from.address'));

        try {
            if ($this->option('verification')) {
                // Test verification email
                $user = User::where('email', $email)->first();

                if (! $user) {
                    $this->error("User with email '{$email}' not found.");

                    return 1;
                }

                $this->info("Sending verification email to {$user->email}...");
                $user->sendEmailVerificationNotification();
                $this->info('Verification email sent successfully!');
            } elseif ($this->option('reset-password')) {
                // Test password reset email
                $user = User::where('email', $email)->first();

                if (! $user) {
                    $this->error("User with email '{$email}' not found.");

                    return 1;
                }

                $this->info("Sending password reset email to {$user->email}...");
                $token = \Illuminate\Support\Str::random(60);
                $user->sendPasswordResetNotification($token);
                $this->info('Password reset email sent successfully!');
            } else {
                // Test simple email
                $this->info("Sending test email to {$email}...");

                Mail::raw('This is a test email from Abacoding platform.', function ($message) use ($email) {
                    $message->to($email)
                        ->subject('Test Email from Abacoding');
                });

                $this->info('Test email sent successfully!');
            }

            $this->info('Check your Mailpit inbox at http://localhost:8025');

        } catch (\Exception $e) {
            $this->error('Failed to send email: '.$e->getMessage());
            $this->error('Stack trace: '.$e->getTraceAsString());

            return 1;
        }

        return 0;
    }
}
