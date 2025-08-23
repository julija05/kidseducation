<?php

namespace Tests\Feature\Student;

use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class DashboardTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    private User $student;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

        // Create roles safely
        $this->createRoles();

        // Create test users
        $this->student = User::factory()->create();
        $this->student->assignRole('student');

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    public function test_student_can_access_dashboard(): void
    {
        $response = $this->actingAs($this->student)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard'));
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect(route('login'));
    }

    public function test_admin_cannot_access_student_dashboard(): void
    {
        $response = $this->actingAs($this->admin)->get('/dashboard');

        $response->assertStatus(403);
    }

    public function test_student_can_view_program_details(): void
    {
        $program = Program::factory()->create();

        $response = $this->actingAs($this->student)
            ->get("/dashboard/programs/{$program->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard/Programs/Show')
            ->has('program')
            ->where('program.slug', $program->slug)
        );
    }

    public function test_student_can_enroll_in_program(): void
    {
        $program = Program::factory()->create();

        $response = $this->actingAs($this->student)
            ->post("/programs/{$program->slug}/enroll");

        $response->assertRedirect();
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $this->student->id,
            'program_id' => $program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
        ]);
    }

    public function test_student_cannot_enroll_twice_in_same_program(): void
    {
        $program = Program::factory()->create();

        // Create existing enrollment
        Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $program->id,
            'status' => 'active',
            'approval_status' => 'approved',
        ]);

        $response = $this->actingAs($this->student)
            ->post("/programs/{$program->slug}/enroll");

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_student_can_cancel_enrollment(): void
    {
        $program = Program::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
        ]);

        $response = $this->actingAs($this->student)
            ->post("/enrollments/{$enrollment->id}/cancel");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('enrollments', ['id' => $enrollment->id]);
    }

    public function test_student_cannot_cancel_others_enrollment(): void
    {
        $otherStudent = User::factory()->create();
        $otherStudent->assignRole('student');

        $program = Program::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'user_id' => $otherStudent->id,
            'program_id' => $program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
        ]);

        $response = $this->actingAs($this->student)
            ->post("/enrollments/{$enrollment->id}/cancel");

        $response->assertStatus(403);
    }

    public function test_dashboard_shows_enrolled_program(): void
    {
        $program = Program::factory()->create();
        Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $program->id,
            'status' => 'active',
            'approval_status' => 'approved',
        ]);

        $response = $this->actingAs($this->student)->get('/dashboard');

        $response->assertInertia(fn ($page) => $page->has('enrolledProgram')
            ->where('enrolledProgram.id', $program->id) // Fixed: program data is directly in enrolledProgram, not nested
        );
    }

    public function test_dashboard_shows_available_programs_when_no_enrollment(): void
    {
        $program = Program::factory()->create();

        $response = $this->actingAs($this->student)->get('/dashboard');

        $response->assertInertia(fn ($page) => $page->has('availablePrograms')
            ->where('enrolledProgram', null)
        );
    }

    public function test_dashboard_shows_completed_program(): void
    {
        $program = Program::factory()->create();
        Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $program->id,
            'status' => 'completed',
            'approval_status' => 'approved',
            'progress' => 100,
            'completed_at' => now()->subDays(5),
        ]);

        $response = $this->actingAs($this->student)->get('/dashboard');

        $response->assertInertia(fn ($page) => $page->has('enrolledProgram')
            ->where('enrolledProgram.id', $program->id)
        );
    }

    public function test_active_enrollment_takes_priority_over_completed(): void
    {
        $completedProgram = Program::factory()->create(['name' => 'Completed Program']);
        $activeProgram = Program::factory()->create(['name' => 'Active Program']);

        // Create completed enrollment
        Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $completedProgram->id,
            'status' => 'completed',
            'approval_status' => 'approved',
            'progress' => 100,
            'completed_at' => now()->subDays(5),
        ]);

        // Create active enrollment
        Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $activeProgram->id,
            'status' => 'active',
            'approval_status' => 'approved',
            'progress' => 50,
        ]);

        $response = $this->actingAs($this->student)->get('/dashboard');

        // Should show active program, not completed one
        $response->assertInertia(fn ($page) => $page->has('enrolledProgram')
            ->where('enrolledProgram.id', $activeProgram->id)
        );
    }

    public function test_completed_program_shows_available_programs(): void
    {
        $completedProgram = Program::factory()->create(['name' => 'Completed Program']);
        $availableProgram = Program::factory()->create(['name' => 'Available Program']);

        // Create completed enrollment
        Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $completedProgram->id,
            'status' => 'completed',
            'approval_status' => 'approved',
            'progress' => 100,
            'completed_at' => now()->subDays(5),
        ]);

        $response = $this->actingAs($this->student)->get('/dashboard');

        // Should show completed program AND available programs for next enrollment
        $response->assertInertia(fn ($page) => $page->has('enrolledProgram')
            ->where('enrolledProgram.id', $completedProgram->id)
            ->has('availablePrograms')
            ->where('availablePrograms.0.id', $availableProgram->id)
        );
    }

    public function test_student_with_active_program_cannot_enroll_in_new_program(): void
    {
        $activeProgram = Program::factory()->create(['name' => 'Active Program']);
        $newProgram = Program::factory()->create(['name' => 'New Program']);

        // Create active enrollment
        Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $activeProgram->id,
            'status' => 'active',
            'approval_status' => 'approved',
            'progress' => 50,
        ]);

        $response = $this->actingAs($this->student)
            ->post("/programs/{$newProgram->slug}/enroll");

        // Should be redirected back with error
        $response->assertRedirect();
        $response->assertSessionHas('error');

        // Should not create new enrollment
        $this->assertDatabaseMissing('enrollments', [
            'user_id' => $this->student->id,
            'program_id' => $newProgram->id,
        ]);
    }
}
