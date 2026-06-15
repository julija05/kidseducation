<?php

namespace Tests\Feature\Admin;

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

class AdminChildProfileTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createRoles();

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    public function test_admin_can_see_child_profiles(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');
        $program = Program::factory()->create([
            'name' => 'Coding Basics',
            'is_active' => true,
            'approval_status' => ApprovalStatus::APPROVED,
        ]);

        $profile = ChildProfile::factory()->create([
            'parent_user_id' => $parent->id,
            'program_id' => $program->id,
            'child_name' => 'Visible Child',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/child-profiles');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/ChildProfiles/Index')
            ->where('childProfiles.data.0.id', $profile->id)
            ->where('childProfiles.data.0.child_name', 'Visible Child')
            ->where('childProfiles.data.0.parent.id', $parent->id)
            ->where('childProfiles.data.0.program.name', 'Coding Basics')
        );
    }

    public function test_admin_can_filter_pending_child_applications(): void
    {
        ChildProfile::factory()->create([
            'status' => ChildProfile::STATUS_PENDING,
            'child_name' => 'Pending Child',
        ]);
        ChildProfile::factory()->create([
            'status' => ChildProfile::STATUS_APPROVED,
            'child_name' => 'Approved Child',
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/child-profiles?status=pending');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/ChildProfiles/Index')
            ->has('childProfiles.data', 1)
            ->where('childProfiles.data.0.child_name', 'Pending Child')
        );
    }

    public function test_admin_can_open_child_profile_detail(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');

        $profile = ChildProfile::factory()->create([
            'parent_user_id' => $parent->id,
            'child_name' => 'Detail Child',
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/child-profiles/{$profile->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/ChildProfiles/Show')
            ->where('childProfile.id', $profile->id)
            ->where('childProfile.child_name', 'Detail Child')
            ->where('childProfile.parent.id', $parent->id)
            ->has('programOptions')
            ->has('groupOptions')
        );
    }

    public function test_admin_can_approve_child_application_with_program_and_group(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');

        $child = User::factory()->create();
        $child->assignRole('student');
        $parent->children()->attach($child->id);

        $requestedProgram = Program::factory()->create([
            'is_active' => true,
            'approval_status' => ApprovalStatus::APPROVED,
        ]);
        $assignedProgram = Program::factory()->create([
            'name' => 'Assigned Program',
            'is_active' => true,
            'approval_status' => ApprovalStatus::APPROVED,
        ]);

        $enrollment = Enrollment::factory()->create([
            'user_id' => $child->id,
            'program_id' => $requestedProgram->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'status' => EnrollmentStatus::PAUSED,
            'approval_status' => ApprovalStatus::PENDING,
        ]);

        $profile = ChildProfile::factory()->create([
            'parent_user_id' => $parent->id,
            'child_user_id' => $child->id,
            'program_id' => $requestedProgram->id,
            'enrollment_id' => $enrollment->id,
            'child_name' => 'Approve Child',
            'status' => ChildProfile::STATUS_PENDING,
        ]);

        $group = ClassSchedule::factory()->upcoming()->create([
            'student_id' => null,
            'program_id' => $assignedProgram->id,
            'title' => 'Group Alpha',
            'is_group_class' => true,
            'max_students' => 5,
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/child-profiles/{$profile->id}/approve", [
                'program_id' => $assignedProgram->id,
                'group_schedule_id' => $group->id,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $profile->refresh();
        $enrollment->refresh();

        $this->assertSame(ChildProfile::STATUS_APPROVED, $profile->status);
        $this->assertSame($assignedProgram->id, $profile->program_id);
        $this->assertSame($assignedProgram->id, $enrollment->program_id);
        $this->assertSame(ApprovalStatus::APPROVED, $enrollment->approval_status);
        $this->assertSame(EnrollmentStatus::ACTIVE, $enrollment->status);
        $this->assertSame($this->admin->id, $enrollment->approved_by);
        $this->assertDatabaseHas('class_schedule_students', [
            'class_schedule_id' => $group->id,
            'student_id' => $child->id,
        ]);
    }

    public function test_admin_can_reject_child_application(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');

        $child = User::factory()->create();
        $child->assignRole('student');

        $program = Program::factory()->create([
            'is_active' => true,
            'approval_status' => ApprovalStatus::APPROVED,
        ]);

        $enrollment = Enrollment::factory()->create([
            'user_id' => $child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'status' => EnrollmentStatus::PAUSED,
            'approval_status' => ApprovalStatus::PENDING,
        ]);

        $profile = ChildProfile::factory()->create([
            'parent_user_id' => $parent->id,
            'child_user_id' => $child->id,
            'program_id' => $program->id,
            'enrollment_id' => $enrollment->id,
            'status' => ChildProfile::STATUS_PENDING,
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/child-profiles/{$profile->id}/reject", [
                'rejection_reason' => 'Not the right group yet',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $profile->refresh();
        $enrollment->refresh();

        $this->assertSame(ChildProfile::STATUS_REJECTED, $profile->status);
        $this->assertSame(ApprovalStatus::REJECTED, $enrollment->approval_status);
        $this->assertSame(EnrollmentStatus::CANCELLED, $enrollment->status);
        $this->assertSame('Not the right group yet', $enrollment->rejection_reason);
        $this->assertSame($this->admin->id, $enrollment->rejected_by);
    }
}
