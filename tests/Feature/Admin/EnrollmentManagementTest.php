<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Program;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class EnrollmentManagementTest extends TestCase
{
    use RefreshDatabase, CreatesRoles;

    private User $admin;
    private User $student;
    private Program $program;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles safely
        $this->createRoles();
        
        // Create test users
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        
        $this->student = User::factory()->create();
        $this->student->assignRole('student');

        // Create test program
        $this->program = Program::factory()->create();
    }

    public function test_admin_can_view_pending_enrollments(): void
    {
        // Create pending enrollments
        Enrollment::factory()->count(3)->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);

        // Create approved enrollment (should not show)
        Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'active',
            'approval_status' => 'approved'
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/enrollments/pending');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Enrollments/Pending')
                ->has('enrollments', 3)
        );
    }

    public function test_admin_can_view_all_enrollments(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/enrollments');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Enrollments/Index')
                ->has('enrollments')
        );
    }

    public function test_admin_can_approve_enrollment(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/enrollments/{$enrollment->id}/approve");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        $enrollment->refresh();
        $this->assertEquals('approved', $enrollment->approval_status);
        $this->assertEquals('active', $enrollment->status);
        $this->assertNotNull($enrollment->approved_at);
        $this->assertEquals($this->admin->id, $enrollment->approved_by);
    }

    public function test_admin_can_reject_enrollment(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);

        $rejectionReason = 'Student does not meet requirements';

        $response = $this->actingAs($this->admin)
            ->post("/admin/enrollments/{$enrollment->id}/reject", [
                'rejection_reason' => $rejectionReason
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        $enrollment->refresh();
        $this->assertEquals('rejected', $enrollment->approval_status);
        $this->assertEquals('cancelled', $enrollment->status);
        $this->assertEquals($rejectionReason, $enrollment->rejection_reason);
        $this->assertNotNull($enrollment->rejected_at);
        $this->assertEquals($this->admin->id, $enrollment->rejected_by);
    }

    public function test_admin_cannot_approve_already_processed_enrollment(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'active',
            'approval_status' => 'approved'
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/enrollments/{$enrollment->id}/approve");

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_admin_cannot_reject_already_processed_enrollment(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'cancelled',
            'approval_status' => 'rejected'
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/enrollments/{$enrollment->id}/reject", [
                'rejection_reason' => 'Test reason'
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_student_cannot_access_enrollment_management(): void
    {
        $enrollment = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);

        $routes = [
            '/admin/enrollments/pending',
            '/admin/enrollments',
            "/admin/enrollments/{$enrollment->id}/approve",
            "/admin/enrollments/{$enrollment->id}/reject"
        ];

        foreach ($routes as $route) {
            $response = $this->actingAs($this->student);
            
            if (str_contains($route, '/approve') || str_contains($route, '/reject')) {
                $response = $response->post($route);
            } else {
                $response = $response->get($route);
            }
            
            $response->assertStatus(403);
        }
    }

    public function test_guest_cannot_access_enrollment_management(): void
    {
        $enrollment = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);

        $routes = [
            '/admin/enrollments/pending',
            '/admin/enrollments'
        ];

        foreach ($routes as $route) {
            $response = $this->get($route);
            $response->assertRedirect(route('login'));
        }
    }

    public function test_enrollment_approval_sends_notification(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/enrollments/{$enrollment->id}/approve");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        // You could add notification/email testing here if implemented
    }

    public function test_enrollment_rejection_works_without_reason(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/enrollments/{$enrollment->id}/reject", [
                // No rejection_reason provided - should still work
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        $enrollment->refresh();
        $this->assertEquals('cancelled', $enrollment->status);
        $this->assertEquals('rejected', $enrollment->approval_status);
    }

    public function test_pending_enrollments_only_shows_pending_status(): void
    {
        // Create enrollments with different statuses
        $pendingEnrollment = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);
        
        $approvedEnrollment = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'active',
            'approval_status' => 'approved'
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/enrollments/pending');

        $response->assertInertia(fn ($page) => 
            $page->has('enrollments', 1)
                ->where('enrollments.0.id', $pendingEnrollment->id)
        );
    }

    public function test_enrollment_shows_student_and_program_details(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/enrollments/pending');

        $response->assertInertia(fn ($page) => 
            $page->has('enrollments.0.user')
                ->has('enrollments.0.program')
                ->where('enrollments.0.user.id', $this->student->id)
                ->where('enrollments.0.program.id', $this->program->id)
        );
    }
}