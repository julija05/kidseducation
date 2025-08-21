<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\CustomResetPassword;
use App\Notifications\CustomVerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CustomEmailTemplatesTest extends TestCase
{
    use RefreshDatabase;

    public function test_custom_verification_email_is_sent(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        $user->sendEmailVerificationNotification();

        Notification::assertSentTo($user, CustomVerifyEmail::class);
    }

    public function test_custom_password_reset_email_is_sent(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $token = 'test-token';

        $user->sendPasswordResetNotification($token);

        Notification::assertSentTo($user, CustomResetPassword::class, function ($notification) use ($token) {
            return $notification->token === $token;
        });
    }

    public function test_verification_email_has_correct_data(): void
    {
        $user = User::factory()->unverified()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ]);

        $notification = new CustomVerifyEmail;
        $mailMessage = $notification->toMail($user);

        $this->assertEquals('Verify Your Email Address - Abacoding', $mailMessage->subject);
        $this->assertEquals('emails.verify-email', $mailMessage->markdown);
        $this->assertArrayHasKey('user', $mailMessage->viewData);
        $this->assertArrayHasKey('url', $mailMessage->viewData);
        $this->assertArrayHasKey('appName', $mailMessage->viewData);
    }

    public function test_password_reset_email_has_correct_data(): void
    {
        $user = User::factory()->create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
        ]);

        $token = 'test-reset-token';
        $notification = new CustomResetPassword($token);
        $mailMessage = $notification->toMail($user);

        $this->assertEquals('Reset Your Password - Abacoding', $mailMessage->subject);
        $this->assertEquals('emails.reset-password', $mailMessage->markdown);
        $this->assertArrayHasKey('user', $mailMessage->viewData);
        $this->assertArrayHasKey('url', $mailMessage->viewData);
        $this->assertArrayHasKey('appName', $mailMessage->viewData);
        $this->assertArrayHasKey('count', $mailMessage->viewData);
    }
}
