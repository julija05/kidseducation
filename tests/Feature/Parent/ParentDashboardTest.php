<?php

namespace Tests\Feature\Parent;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Models\ChildProfile;
use App\Models\ClassSchedule;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class ParentDashboardTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    private User $parent;

    private User $child;

    private User $otherChild;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createRoles();

        $this->parent = User::factory()->create();
        $this->parent->assignRole('parent');

        $this->child = User::factory()->create();
        $this->child->assignRole('student');

        $this->otherChild = User::factory()->create();
        $this->otherChild->assignRole('student');

        $this->parent->children()->attach($this->child->id);
    }

    public function test_parent_dashboard_only_shows_linked_children(): void
    {
        $program = Program::factory()->create(['is_active' => true]);
        Enrollment::factory()->create([
            'user_id' => $this->child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
            'progress' => 55,
        ]);

        $response = $this->actingAs($this->parent)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Dashboard')
            ->has('children', 1)
            ->has('childCards', 1)
            ->where('children.0.id', $this->child->id)
            ->where('children.0.enrollments.0.progress', 55)
            ->where('childCards.0.child_id', $this->child->id)
            ->where('childCards.0.progress', 55)
        );
    }

    public function test_parent_dashboard_child_card_shows_status_program_class_and_notes(): void
    {
        $program = Program::factory()->create([
            'name' => 'Mental Math',
            'is_active' => true,
        ]);
        Enrollment::factory()->create([
            'user_id' => $this->child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
            'progress' => 72,
        ]);

        $nextClass = ClassSchedule::factory()->upcoming()->create([
            'student_id' => null,
            'program_id' => $program->id,
            'title' => 'Group A',
            'is_group_class' => true,
            'max_students' => 5,
        ]);
        $nextClass->students()->attach($this->child->id);

        ClassSchedule::factory()->completed()->create([
            'student_id' => $this->child->id,
            'program_id' => $program->id,
            'session_notes' => 'Strong focus during class.',
            'session_data' => [
                'homework_status' => 'Assigned',
                'weekly_report' => 'Completed all practice tasks.',
            ],
        ]);

        $response = $this->actingAs($this->parent)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Dashboard')
            ->has('childCards', 1)
            ->where('childCards.0.child_id', $this->child->id)
            ->where('childCards.0.application_status', ApprovalStatus::APPROVED)
            ->where('childCards.0.current_program.name', 'Mental Math')
            ->where('childCards.0.group_name', 'Group A')
            ->where('childCards.0.homework_status', 'Assigned')
            ->where('childCards.0.progress', 72)
            ->where('childCards.0.latest_mentor_note', 'Strong focus during class.')
            ->where('childCards.0.latest_weekly_report', 'Completed all practice tasks.')
        );
    }

    public function test_parent_dashboard_child_card_shows_rejection_note(): void
    {
        $program = Program::factory()->create([
            'is_active' => true,
        ]);
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::REJECTED,
            'status' => EnrollmentStatus::CANCELLED,
            'rejection_reason' => 'Please choose a different group.',
        ]);

        ChildProfile::factory()->create([
            'parent_user_id' => $this->parent->id,
            'child_user_id' => $this->child->id,
            'program_id' => $program->id,
            'enrollment_id' => $enrollment->id,
            'status' => ChildProfile::STATUS_REJECTED,
        ]);

        $response = $this->actingAs($this->parent)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Dashboard')
            ->has('childCards', 1)
            ->where('childCards.0.application_status', ApprovalStatus::REJECTED)
            ->where('childCards.0.rejection_note', 'Please choose a different group.')
        );
    }

    public function test_parent_can_open_linked_child(): void
    {
        $response = $this->actingAs($this->parent)->get("/parent/children/{$this->child->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Child')
            ->where('child.id', $this->child->id)
        );
    }

    public function test_parent_cannot_open_unlinked_child(): void
    {
        $response = $this->actingAs($this->parent)->get("/parent/children/{$this->otherChild->id}");

        $response->assertNotFound();
    }

    public function test_parent_is_redirected_from_generic_dashboard_to_parent_dashboard(): void
    {
        $response = $this->actingAs($this->parent)->get('/dashboard');

        $response->assertRedirect(route('parent.dashboard', absolute: false));
    }

    public function test_parent_cannot_access_admin_or_mentor_pages(): void
    {
        $this->actingAs($this->parent)
            ->get('/admin/dashboard')
            ->assertForbidden();

        $this->actingAs($this->parent)
            ->get('/mentor/dashboard')
            ->assertForbidden();
    }
}
