<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'email:test {email?} {--verification} {--reset-password} {--contact-form}';

    protected $description = 'Test email functionality for both Postmark and Mailpit configurations';

    public function handle()
    {
        $email = $this->argument('email');

        if (! $email) {
            $email = $this->ask('Enter an email address to test');
        }

        $this->info('🚀 Testing email functionality...');
        $this->newLine();

        // Display current configuration
        $this->displayConfiguration();
        $this->newLine();

        try {
            if ($this->option('verification')) {
                $this->testVerificationEmail($email);
            } elseif ($this->option('reset-password')) {
                $this->testPasswordResetEmail($email);
            } elseif ($this->option('contact-form')) {
                $this->testContactFormEmail($email);
            } else {
                $this->testSimpleEmail($email);
            }

            $this->displayPostSendInfo();

        } catch (\Exception $e) {
            $this->error('❌ Failed to send email: '.$e->getMessage());

            $this->newLine();
            $this->displayTroubleshootingTips();

            return 1;
        }

        return 0;
    }

    private function displayConfiguration()
    {
        $mailer = config('mail.default');

        $this->info('📧 Current Mail Configuration:');
        $this->info('- Mailer: '.$mailer);
        $this->info('- From: '.config('mail.from.address').' ('.config('mail.from.name').')');

        if ($mailer === 'postmark') {
            $token = config('services.postmark.token');
            $this->info('- Postmark Token: '.($token ? '✅ Configured' : '❌ Missing'));
        } elseif ($mailer === 'smtp') {
            $this->info('- Host: '.config('mail.mailers.smtp.host'));
            $this->info('- Port: '.config('mail.mailers.smtp.port'));
        }
    }

    private function testVerificationEmail($email)
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("❌ User with email '{$email}' not found.");
            $this->info('💡 Create a user first or use an existing email address.');

            return 1;
        }

        $this->info("📧 Sending verification email to {$user->email}...");
        $user->sendEmailVerificationNotification();
        $this->info('✅ Verification email sent successfully!');
    }

    private function testPasswordResetEmail($email)
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("❌ User with email '{$email}' not found.");
            $this->info('💡 Create a user first or use an existing email address.');

            return 1;
        }

        $this->info("📧 Sending password reset email to {$user->email}...");
        $token = \Illuminate\Support\Str::random(60);
        $user->sendPasswordResetNotification($token);
        $this->info('✅ Password reset email sent successfully!');
    }

    private function testContactFormEmail($email)
    {
        $this->info("📧 Sending contact form test email to {$email}...");

        Mail::send('emails.contact', [
            'name' => 'Test User',
            'email' => $email,
            'message' => 'This is a test contact form submission to verify email functionality.',
            'timestamp' => now(),
        ], function ($message) use ($email) {
            $message->to(config('mail.from.address'))
                ->replyTo($email)
                ->subject('Contact Form Test - Abacoding');
        });

        $this->info('✅ Contact form email sent successfully!');
    }

    private function testSimpleEmail($email)
    {
        $this->info("📧 Sending test email to {$email}...");

        $mailer = config('mail.default');
        $timestamp = now();

        Mail::raw("This is a test email from Abacoding Kids Education Platform.

Email Configuration Test Results:
- Mailer: {$mailer}
- From: ".config('mail.from.address')."
- Timestamp: {$timestamp}
- Environment: ".app()->environment().'

If you received this email, your email configuration is working correctly!

Best regards,
The Abacoding Team', function ($message) use ($email) {
            $message->to($email)
                ->subject('✅ Abacoding - Email Configuration Test');
        });

        $this->info('✅ Test email sent successfully!');
    }

    private function displayPostSendInfo()
    {
        $mailer = config('mail.default');

        $this->newLine();
        $this->info('📊 Next Steps:');

        if ($mailer === 'postmark') {
            $this->info('1. Check your Postmark dashboard for delivery status:');
            $this->info('   🔗 https://account.postmarkapp.com/servers');
            $this->info('2. Monitor delivery rates and bounces');
            $this->info('3. Verify recipient received the email');
        } elseif ($mailer === 'smtp' && config('mail.mailers.smtp.host') === 'mailpit') {
            $this->info('1. Check Mailpit UI for the email:');
            $this->info('   🔗 http://localhost:8025');
            $this->info('2. Verify email content and formatting');
        } else {
            $this->info('1. Check your email provider\'s dashboard');
            $this->info('2. Verify recipient received the email');
        }
    }

    private function displayTroubleshootingTips()
    {
        $mailer = config('mail.default');

        $this->warn('💡 Troubleshooting Tips:');

        if ($mailer === 'postmark') {
            $this->warn('1. Verify POSTMARK_TOKEN in .env file');
            $this->warn('2. Check if domain is verified in Postmark dashboard');
            $this->warn('3. Ensure FROM address uses verified domain');
            $this->warn('4. Check Postmark server status');
        } elseif ($mailer === 'smtp') {
            if (config('mail.mailers.smtp.host') === 'mailpit') {
                $this->warn('1. Ensure Docker services are running: docker ps');
                $this->warn('2. Check if Mailpit container is healthy');
                $this->warn('3. Verify Mailpit is accessible at http://localhost:8025');
            } else {
                $this->warn('1. Check SMTP server settings in .env');
                $this->warn('2. Verify SMTP credentials');
                $this->warn('3. Check firewall/network connectivity');
            }
        }

        $this->warn('General tips:');
        $this->warn('- Run: php artisan config:clear');
        $this->warn('- Check Laravel logs: storage/logs/laravel.log');
        $this->warn('- Verify .env file syntax');
    }
}
