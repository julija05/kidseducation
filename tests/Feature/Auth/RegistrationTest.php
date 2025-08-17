<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class RegistrationTest extends TestCase
{
    use RefreshDatabase, CreatesRoles;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles safely
        $this->createRoles();
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_registration_requires_strong_password(): void
    {
        // Test weak password
        $response = $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'User', 
            'email' => 'test@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }

    public function test_registration_requires_password_with_mixed_case(): void
    {
        // Test password without uppercase
        $response = $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'lowercase123!',
            'password_confirmation' => 'lowercase123!',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }

    public function test_registration_requires_password_with_numbers(): void
    {
        // Test password without numbers
        $response = $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'NoNumbers!',
            'password_confirmation' => 'NoNumbers!',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }

    public function test_registration_requires_password_with_symbols(): void
    {
        // Test password without symbols
        $response = $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'NoSymbols123',
            'password_confirmation' => 'NoSymbols123',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
    }
}
