<?php

namespace Tests\Feature\Mentor;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class MentorStudentVisibilityTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    private Program $program;

    private User $mentor;

    private User $otherMentor;

    private User $assignedStudent;

    private User $otherStudent;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createRoles();
        $this->getOrCreateRole('mentor');

        $this->program = Program::factory()->create(['is_active' => true]);

        $this->mentor = User::factory()->create();
        $this->mentor->assignRole('mentor');

        $this->otherMentor = User::factory()->create();
        $this->otherMentor->assignRole('mentor');

        $this->assignedStudent = User::factory()->create();
        $this->assignedStudent->assignRole('student');

        $this->otherStudent = User::factory()->create();
        $this->otherStudent->assignRole('student');

        foreach ([$this->mentor, $this->otherMentor] as $mentor) {
            Enrollment::factory()->create([
                'user_id' => $mentor->id,
                'program_id' => $this->program->id,
                'enrollment_type' => EnrollmentType::MENTOR,
                'approval_status' => ApprovalStatus::APPROVED,
                'status' => EnrollmentStatus::ACTIVE,
            ]);
        }

        Enrollment::factory()->create([
            'user_id' => $this->assignedStudent->id,
            'program_id' => $this->program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
            'assigned_mentor_id' => $this->mentor->id,
            'progress' => 40,
        ]);

        Enrollment::factory()->create([
            'user_id' => $this->otherStudent->id,
            'program_id' => $this->program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
            'assigned_mentor_id' => $this->otherMentor->id,
            'progress' => 90,
        ]);
    }

    public function test_mentor_dashboard_only_shows_assigned_students(): void
    {
        $response = $this->actingAs($this->mentor)->get('/mentor/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Mentor/Dashboard')
            ->has('allStudents', 1)
            ->where('allStudents.0.id', $this->assignedStudent->id)
            ->where('enrollments.0.students_count', 1)
            ->where('enrollments.0.average_progress', 40.0)
        );
    }

    public function test_meeting_create_only_shows_assigned_students(): void
    {
        $response = $this->actingAs($this->mentor)->get('/mentor/meetings/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Mentor/Meetings/Create')
            ->has('students', 1)
            ->where('students.0.id', $this->assignedStudent->id)
        );
    }

    public function test_mentor_program_view_only_shows_assigned_students(): void
    {
        $response = $this->actingAs($this->mentor)->get("/mentor/programs/{$this->program->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Mentor/ProgramView')
            ->has('students', 1)
            ->where('students.0.id', $this->assignedStudent->id)
        );
    }

    public function test_mentor_cannot_schedule_meeting_with_unassigned_student(): void
    {
        $response = $this->actingAs($this->mentor)->post('/mentor/meetings', [
            'title' => 'Progress review',
            'description' => 'Review recent work',
            'meeting_type' => 'individual',
            'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'duration_minutes' => 30,
            'student_ids' => [$this->otherStudent->id],
        ]);

        $response->assertSessionHasErrors('student_ids');
        $this->assertDatabaseMissing('meeting_participants', [
            'student_id' => $this->otherStudent->id,
        ]);
    }

    public function test_mentor_can_schedule_meeting_with_assigned_student(): void
    {
        $response = $this->actingAs($this->mentor)->post('/mentor/meetings', [
            'title' => 'Progress review',
            'description' => 'Review recent work',
            'meeting_type' => 'individual',
            'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'duration_minutes' => 30,
            'student_ids' => [$this->assignedStudent->id],
        ]);

        $response->assertRedirect('/mentor/meetings');
        $this->assertDatabaseHas('meeting_participants', [
            'student_id' => $this->assignedStudent->id,
            'status' => 'invited',
        ]);
    }
}
