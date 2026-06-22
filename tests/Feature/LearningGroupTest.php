<?php

namespace Tests\Feature;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Models\Enrollment;
use App\Models\LearningGroup;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class LearningGroupTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createRoles();
    }

    public function test_admin_can_create_learning_group(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');

        $program = Program::factory()->create(['is_active' => true]);

        $response = $this->actingAs($admin)->post('/admin/learning-groups', [
            'name' => 'Saturday Scratch Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->addWeek()->toDateString(),
            'end_date' => now()->addWeeks(8)->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 12,
            'description' => 'Live coding group for beginners.',
        ]);

        $response->assertRedirect('/admin/learning-groups');

        $this->assertDatabaseHas('learning_groups', [
            'name' => 'Saturday Scratch Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 12,
        ]);
    }

    public function test_mentor_can_create_learning_group_for_approved_program(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');

        $program = Program::factory()->create(['is_active' => true]);

        Enrollment::factory()->create([
            'user_id' => $mentor->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::MENTOR,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
        ]);

        $response = $this->actingAs($mentor)->post('/mentor/learning-groups', [
            'name' => 'Morning Math Group',
            'program_id' => $program->id,
            'start_date' => now()->addWeek()->toDateString(),
            'end_date' => now()->addWeeks(6)->toDateString(),
            'status' => LearningGroup::STATUS_DRAFT,
            'max_students' => 8,
            'description' => 'Small live group for arithmetic practice.',
        ]);

        $response->assertRedirect('/mentor/learning-groups');

        $this->assertDatabaseHas('learning_groups', [
            'name' => 'Morning Math Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'status' => LearningGroup::STATUS_DRAFT,
        ]);
    }

    public function test_mentor_can_create_learning_group_for_any_existing_program(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');

        $program = Program::factory()->create(['is_active' => true]);

        $response = $this->actingAs($mentor)->post('/mentor/learning-groups', [
            'name' => 'Open Program Group',
            'program_id' => $program->id,
            'start_date' => now()->addWeek()->toDateString(),
            'end_date' => now()->addWeeks(6)->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 8,
        ]);

        $response->assertRedirect('/mentor/learning-groups');

        $this->assertDatabaseHas('learning_groups', [
            'name' => 'Open Program Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
        ]);
    }

    public function test_learning_group_relationships_and_active_status(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');

        $program = Program::factory()->create(['is_active' => true]);

        $activeGroup = LearningGroup::create([
            'name' => 'Active Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 10,
        ]);

        LearningGroup::create([
            'name' => 'Completed Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->subMonths(2)->toDateString(),
            'end_date' => now()->subMonth()->toDateString(),
            'status' => LearningGroup::STATUS_COMPLETED,
            'max_students' => 10,
        ]);

        $this->assertTrue($activeGroup->isActive());
        $this->assertEquals($program->id, $activeGroup->program->id);
        $this->assertEquals($mentor->id, $activeGroup->mentor->id);
        $this->assertEquals(1, LearningGroup::active()->count());
        $this->assertEquals(1, LearningGroup::inactive()->count());
        $this->assertEquals(2, $program->learningGroups()->count());
        $this->assertEquals(2, $mentor->mentoringGroups()->count());
    }
}
