<?php

namespace Tests\Feature\Parent;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Models\ChildProfile;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class ChildProfileTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createRoles();
    }

    public function test_parent_can_create_child_application_with_child_login_and_pending_enrollment(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');
        $program = Program::factory()->create([
            'is_active' => true,
            'approval_status' => ApprovalStatus::APPROVED,
        ]);

        $response = $this->actingAs($parent)->post('/parent/child-profiles', [
            'child_name' => 'Ada Student',
            'program_id' => $program->id,
            'age' => 9,
            'grade_class' => '3A',
            'notes' => 'Interested in math.',
        ]);

        $child = User::where('name', 'Ada Student')->first();

        $this->assertNotNull($child);
        $this->assertTrue($child->hasRole('student'));
        $this->assertNotNull($child->username);
        $this->assertStringEndsWith('@children.abacoding.local', $child->email);
        $this->assertTrue($parent->children()->whereKey($child->id)->exists());

        $this->assertDatabaseHas('child_profiles', [
            'parent_user_id' => $parent->id,
            'child_user_id' => $child->id,
            'program_id' => $program->id,
            'child_name' => 'Ada Student',
            'child_username' => $child->username,
            'age' => 9,
            'grade_class' => '3A',
            'status' => 'pending',
            'notes' => 'Interested in math.',
        ]);

        $enrollment = Enrollment::where('user_id', $child->id)->where('program_id', $program->id)->first();

        $this->assertNotNull($enrollment);
        $this->assertSame(EnrollmentType::STUDENT, $enrollment->enrollment_type);
        $this->assertSame(EnrollmentStatus::PAUSED, $enrollment->status);
        $this->assertSame(ApprovalStatus::PENDING, $enrollment->approval_status);

        $profile = ChildProfile::where('child_user_id', $child->id)->first();
        $this->assertNotEmpty($profile->child_generated_password);
        $response->assertRedirect(route('parent.child-profiles.pending', $profile, absolute: false));
    }

    public function test_parent_sees_waiting_for_approval_screen_for_own_child_application(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');
        $program = Program::factory()->create([
            'is_active' => true,
            'approval_status' => ApprovalStatus::APPROVED,
        ]);
        $child = User::factory()->create();
        $child->assignRole('student');
        $enrollment = Enrollment::factory()->create([
            'user_id' => $child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::PENDING,
            'status' => EnrollmentStatus::PAUSED,
        ]);
        $profile = ChildProfile::factory()->create([
            'parent_user_id' => $parent->id,
            'child_user_id' => $child->id,
            'program_id' => $program->id,
            'enrollment_id' => $enrollment->id,
            'child_name' => 'Ada Student',
            'child_username' => 'adastudent1234',
            'child_generated_password' => 'Kid-ABCD-1234',
            'status' => ChildProfile::STATUS_PENDING,
        ]);

        $response = $this->actingAs($parent)->get("/parent/child-profiles/{$profile->id}/pending");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/ChildProfiles/Pending')
            ->where('childProfile.id', $profile->id)
            ->where('childProfile.child_name', 'Ada Student')
            ->where('childProfile.child_username', 'adastudent1234')
            ->where('childProfile.child_generated_password', 'Kid-ABCD-1234')
            ->where('childProfile.enrollment.approval_status', ApprovalStatus::PENDING)
        );
    }

    public function test_parent_sees_rejected_application_and_can_reregister_from_it(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');
        $program = Program::factory()->create([
            'is_active' => true,
            'approval_status' => ApprovalStatus::APPROVED,
        ]);
        $child = User::factory()->create();
        $child->assignRole('student');
        $enrollment = Enrollment::factory()->create([
            'user_id' => $child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::REJECTED,
            'status' => EnrollmentStatus::CANCELLED,
            'rejection_reason' => 'Please choose another group.',
        ]);
        $profile = ChildProfile::factory()->create([
            'parent_user_id' => $parent->id,
            'child_user_id' => $child->id,
            'program_id' => $program->id,
            'enrollment_id' => $enrollment->id,
            'child_name' => 'Ada Student',
            'age' => 9,
            'grade_class' => '3A',
            'notes' => 'Needs afternoon classes.',
            'status' => ChildProfile::STATUS_REJECTED,
        ]);

        $this->actingAs($parent)
            ->get("/parent/child-profiles/{$profile->id}/pending")
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Parent/ChildProfiles/Pending')
                ->where('childProfile.status', ChildProfile::STATUS_REJECTED)
                ->where('childProfile.rejection_reason', 'Please choose another group.')
            );

        $this->actingAs($parent)
            ->get("/parent/child-profiles/create?reregister={$profile->id}")
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Parent/ChildProfiles/Create')
                ->where('initialValues.child_name', 'Ada Student')
                ->where('initialValues.program_id', $program->id)
                ->where('initialValues.age', 9)
                ->where('initialValues.grade_class', '3A')
                ->where('initialValues.notes', 'Needs afternoon classes.')
                ->where('reregisteredFrom.id', $profile->id)
            );
    }

    public function test_parent_cannot_reregister_from_someone_elses_rejected_application(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');
        $otherParent = User::factory()->create();
        $otherParent->assignRole('parent');

        $profile = ChildProfile::factory()->create([
            'parent_user_id' => $otherParent->id,
            'status' => ChildProfile::STATUS_REJECTED,
        ]);

        $this->actingAs($parent)
            ->get("/parent/child-profiles/create?reregister={$profile->id}")
            ->assertNotFound();
    }

    public function test_parent_dashboard_shows_own_child_profiles_only(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');

        $otherParent = User::factory()->create();
        $otherParent->assignRole('parent');

        $ownProfile = ChildProfile::factory()->create([
            'parent_user_id' => $parent->id,
            'child_name' => 'Own Child',
        ]);

        ChildProfile::factory()->create([
            'parent_user_id' => $otherParent->id,
            'child_name' => 'Other Child',
        ]);

        $response = $this->actingAs($parent)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Dashboard')
            ->has('childProfiles', 1)
            ->where('childProfiles.0.id', $ownProfile->id)
            ->where('childProfiles.0.child_name', 'Own Child')
        );
    }
}
