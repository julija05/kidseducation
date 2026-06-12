<?php

namespace Tests\Feature\Parent;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
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
            ->where('children.0.id', $this->child->id)
            ->where('children.0.enrollments.0.progress', 55)
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
