<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class DemoAccessTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles safely
        $this->createRoles();
    }

    public function test_user_with_pending_enrollment_can_access_demo_dashboard()
    {
        // Create a program
        $program = Program::factory()->create([
            'slug' => 'test-program',
            'name' => 'Test Program',
        ]);

        // Create a user
        $user = User::factory()->create();
        $user->assignRole('student');

        // Set up demo access that has expired but user has pending enrollment
        $user->update([
            'demo_created_at' => now()->subDays(10),
            'demo_expires_at' => now()->subDays(3), // Expired 3 days ago
            'demo_program_slug' => 'test-program',
        ]);

        // Create a pending enrollment
        Enrollment::create([
            'user_id' => $user->id,
            'program_id' => $program->id,
            'enrolled_at' => now(),
            'status' => 'paused',
            'approval_status' => 'pending',
            'progress' => 0,
        ]);

        // Act as the user and try to access demo dashboard
        $response = $this->actingAs($user)
            ->get(route('demo.dashboard', 'test-program'));

        // Should be successful (not redirected)
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Demo/Dashboard')
            ->has('program')
            ->where('program.slug', 'test-program')
        );
    }

    public function test_user_without_demo_access_or_pending_enrollment_cannot_access_demo_dashboard()
    {
        // Create a program
        $program = Program::factory()->create([
            'slug' => 'test-program',
            'name' => 'Test Program',
        ]);

        // Create a user without demo access or pending enrollment
        $user = User::factory()->create();
        $user->assignRole('student');

        // Act as the user and try to access demo dashboard
        $response = $this->actingAs($user)
            ->get(route('demo.dashboard', 'test-program'));

        // Should be redirected to programs index
        $response->assertRedirect(route('programs.index'));
    }

    public function test_user_with_active_demo_access_can_access_demo_dashboard()
    {
        // Create a program
        $program = Program::factory()->create([
            'slug' => 'test-program',
            'name' => 'Test Program',
        ]);

        // Create a user with active demo access
        $user = User::factory()->create();
        $user->assignRole('student');

        $user->update([
            'demo_created_at' => now()->subDays(2),
            'demo_expires_at' => now()->addDays(5), // Still active
            'demo_program_slug' => 'test-program',
        ]);

        // Act as the user and try to access demo dashboard
        $response = $this->actingAs($user)
            ->get(route('demo.dashboard', 'test-program'));

        // Should be successful
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Demo/Dashboard')
            ->has('program')
            ->where('program.slug', 'test-program')
        );
    }

    public function test_get_demo_program_works_for_user_with_pending_enrollment()
    {
        // Create a program
        $program = Program::factory()->create([
            'slug' => 'test-program',
            'name' => 'Test Program',
        ]);

        // Create a user
        $user = User::factory()->create();
        $user->assignRole('student');

        // Set up expired demo access but with demo_program_slug
        $user->update([
            'demo_created_at' => now()->subDays(10),
            'demo_expires_at' => now()->subDays(3), // Expired
            'demo_program_slug' => 'test-program',
        ]);

        // Create a pending enrollment
        Enrollment::create([
            'user_id' => $user->id,
            'program_id' => $program->id,
            'enrolled_at' => now(),
            'status' => 'paused',
            'approval_status' => 'pending',
            'progress' => 0,
        ]);

        // Test that getDemoProgram() returns the program
        $demoProgram = $user->getDemoProgram();

        $this->assertNotNull($demoProgram);
        $this->assertEquals($program->id, $demoProgram->id);
        $this->assertEquals('test-program', $demoProgram->slug);
    }
}
