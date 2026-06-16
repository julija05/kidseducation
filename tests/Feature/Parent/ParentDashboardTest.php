<?php

namespace Tests\Feature\Parent;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Models\ChildProfile;
use App\Models\ClassSchedule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonResource;
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

    public function test_parent_dashboard_child_card_shows_status_program_class_and_parent_safe_notes(): void
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
            'description' => 'Fractions practice',
            'scheduled_at' => now()->addDays(2)->setTime(15, 30),
            'meeting_link' => 'https://example.test/live/group-a',
            'is_group_class' => true,
            'max_students' => 5,
            'session_data' => [
                'preparation_checklist' => [
                    'Bring notebook',
                    'Complete warm-up worksheet',
                ],
            ],
        ]);
        $nextClass->students()->attach($this->child->id);

        ClassSchedule::factory()->completed()->create([
            'student_id' => $this->child->id,
            'program_id' => $program->id,
            'session_notes' => 'Private mentor note.',
            'session_data' => [
                'homework_status' => 'Assigned',
                'parent_note' => 'Strong focus during class.',
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
            ->where('childCards.0.next_live_class.date', $nextClass->scheduled_at->format('M d, Y'))
            ->where('childCards.0.next_live_class.time', '3:30 PM')
            ->where('childCards.0.next_live_class.topic', 'Fractions practice')
            ->where('childCards.0.next_live_class.group', 'Group A')
            ->where('childCards.0.next_live_class.meeting_link', 'https://example.test/live/group-a')
            ->where('childCards.0.next_live_class.preparation_checklist.0', 'Bring notebook')
            ->where('childCards.0.next_live_class.preparation_checklist.1', 'Complete warm-up worksheet')
            ->where('childCards.0.homework_status', 'Assigned')
            ->where('childCards.0.progress', 72)
            ->where('childCards.0.latest_mentor_note', 'Strong focus during class.')
            ->where('childCards.0.latest_weekly_report', 'Completed all practice tasks.')
        );
    }

    public function test_parent_dashboard_shows_next_live_class_for_every_linked_child(): void
    {
        $this->child->update(['name' => 'Amy Learner']);

        $secondChild = User::factory()->create(['name' => 'Zoe Learner']);
        $secondChild->assignRole('student');
        $this->parent->children()->attach($secondChild->id);

        $program = Program::factory()->create(['is_active' => true]);

        foreach ([$this->child, $secondChild] as $child) {
            Enrollment::factory()->create([
                'user_id' => $child->id,
                'program_id' => $program->id,
                'enrollment_type' => EnrollmentType::STUDENT,
                'approval_status' => ApprovalStatus::APPROVED,
                'status' => EnrollmentStatus::ACTIVE,
            ]);
        }

        ClassSchedule::factory()->upcoming()->create([
            'student_id' => $this->child->id,
            'program_id' => $program->id,
            'title' => 'Amy math class',
            'scheduled_at' => now()->addDay()->setTime(10, 0),
            'meeting_link' => 'https://example.test/live/amy',
            'session_data' => [
                'preparation_checklist' => ['Practice flash cards'],
            ],
        ]);

        ClassSchedule::factory()->upcoming()->create([
            'student_id' => $secondChild->id,
            'program_id' => $program->id,
            'title' => 'Zoe coding class',
            'scheduled_at' => now()->addDays(3)->setTime(12, 15),
            'meeting_link' => 'https://example.test/live/zoe',
            'session_data' => [
                'preparation_checklist' => ['Open Scratch project'],
            ],
        ]);

        $response = $this->actingAs($this->parent)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Dashboard')
            ->has('childCards', 2)
            ->where('childCards.0.name', 'Amy Learner')
            ->where('childCards.0.next_live_class.topic', 'Amy math class')
            ->where('childCards.0.next_live_class.meeting_link', 'https://example.test/live/amy')
            ->where('childCards.0.next_live_class.preparation_checklist.0', 'Practice flash cards')
            ->where('childCards.1.name', 'Zoe Learner')
            ->where('childCards.1.next_live_class.topic', 'Zoe coding class')
            ->where('childCards.1.next_live_class.meeting_link', 'https://example.test/live/zoe')
            ->where('childCards.1.next_live_class.preparation_checklist.0', 'Open Scratch project')
        );
    }

    public function test_parent_dashboard_shows_current_homework_completion_and_help_status(): void
    {
        $program = Program::factory()->create(['is_active' => true]);
        Enrollment::factory()->create([
            'user_id' => $this->child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
        ]);

        ClassSchedule::factory()->completed()->create([
            'student_id' => $this->child->id,
            'program_id' => $program->id,
            'session_data' => [
                'homework' => [
                    'current' => 'Practice multiplication worksheet',
                    'estimated_practice_time' => 25,
                    'due_date' => '2026-06-20',
                    'completed' => false,
                    'needs_help' => true,
                ],
            ],
        ]);

        $response = $this->actingAs($this->parent)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Dashboard')
            ->has('childCards', 1)
            ->where('childCards.0.homework.current', 'Practice multiplication worksheet')
            ->where('childCards.0.homework.estimated_practice_time', '25 min')
            ->where('childCards.0.homework.due_date', '2026-06-20')
            ->where('childCards.0.homework.status', 'Not completed')
            ->where('childCards.0.homework.is_completed', false)
            ->where('childCards.0.homework.needs_help', true)
            ->where('childCards.0.homework_status', 'Not completed')
        );
    }

    public function test_parent_dashboard_does_not_expose_private_mentor_session_notes(): void
    {
        $program = Program::factory()->create([
            'is_active' => true,
        ]);
        Enrollment::factory()->create([
            'user_id' => $this->child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
        ]);

        ClassSchedule::factory()->completed()->create([
            'student_id' => $this->child->id,
            'program_id' => $program->id,
            'session_notes' => 'Private internal note for mentor only.',
            'session_data' => [
                'homework_status' => 'Assigned',
            ],
        ]);

        $response = $this->actingAs($this->parent)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Dashboard')
            ->has('childCards', 1)
            ->where('childCards.0.latest_mentor_note', null)
        );
    }

    public function test_parent_dashboard_shows_latest_parent_visible_mentor_note_only(): void
    {
        $program = Program::factory()->create(['is_active' => true]);
        Enrollment::factory()->create([
            'user_id' => $this->child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
        ]);

        ClassSchedule::factory()->completed()->create([
            'student_id' => $this->child->id,
            'program_id' => $program->id,
            'scheduled_at' => now()->subDays(4),
            'completed_at' => now()->subDays(4),
            'session_notes' => 'Older private note.',
            'session_data' => [
                'parent_note' => 'Older parent-visible note.',
            ],
        ]);

        ClassSchedule::factory()->completed()->create([
            'student_id' => $this->child->id,
            'program_id' => $program->id,
            'scheduled_at' => now()->subDay(),
            'completed_at' => now()->subDay(),
            'session_notes' => 'Newest private note.',
            'session_data' => [
                'mentor_notes' => [
                    [
                        'note' => 'Hidden structured note.',
                        'visible_to_parent' => false,
                    ],
                    [
                        'note' => 'Newest parent-visible note.',
                        'visible_to_parent' => true,
                    ],
                ],
            ],
        ]);

        $response = $this->actingAs($this->parent)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertDontSee('Newest private note.');
        $response->assertDontSee('Older private note.');
        $response->assertDontSee('Hidden structured note.');
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Dashboard')
            ->has('childCards', 1)
            ->where('childCards.0.latest_mentor_note', 'Newest parent-visible note.')
        );
    }

    public function test_parent_child_detail_shows_parent_visible_mentor_note_history(): void
    {
        $program = Program::factory()->create(['is_active' => true]);
        Enrollment::factory()->create([
            'user_id' => $this->child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
        ]);

        ClassSchedule::factory()->completed()->create([
            'student_id' => $this->child->id,
            'program_id' => $program->id,
            'title' => 'Older class',
            'scheduled_at' => now()->subDays(6),
            'completed_at' => now()->subDays(6),
            'session_notes' => 'Older private internal note.',
            'session_data' => [
                'public_mentor_note' => 'Older parent note.',
            ],
        ]);

        ClassSchedule::factory()->completed()->create([
            'student_id' => $this->child->id,
            'program_id' => $program->id,
            'title' => 'Latest class',
            'scheduled_at' => now()->subDays(2),
            'completed_at' => now()->subDays(2),
            'session_notes' => 'Latest private internal note.',
            'session_data' => [
                'mentor_note_for_parent' => 'Latest parent note.',
            ],
        ]);

        $response = $this->actingAs($this->parent)->get("/parent/children/{$this->child->id}");

        $response->assertStatus(200);
        $response->assertDontSee('Older private internal note.');
        $response->assertDontSee('Latest private internal note.');
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Child')
            ->where('child.parent_visible_mentor_notes.0.note', 'Latest parent note.')
            ->where('child.parent_visible_mentor_notes.0.class_title', 'Latest class')
            ->where('child.parent_visible_mentor_notes.1.note', 'Older parent note.')
            ->where('child.parent_visible_mentor_notes.1.class_title', 'Older class')
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

    public function test_parent_can_open_linked_child_learning_dashboard(): void
    {
        $program = Program::factory()->create(['is_active' => true]);
        Enrollment::factory()->create([
            'user_id' => $this->child->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
            'progress' => 42,
        ]);

        $response = $this->actingAs($this->parent)->get("/parent/children/{$this->child->id}/learning-dashboard");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('parentView.child.id', $this->child->id)
            ->where('parentView.child.name', $this->child->name)
            ->where('parentView.backRoute', 'parent.dashboard')
            ->where('enrolledProgram.id', $program->id)
            ->where('enrolledProgram.progress', 42.0)
            ->where('availablePrograms', [])
            ->where('notifications', [])
            ->where('unreadNotificationCount', 0)
        );
    }

    public function test_parent_child_learning_dashboard_uses_selected_child_content_only(): void
    {
        $selectedProgram = Program::factory()->create([
            'name' => 'Selected Program',
            'is_active' => true,
        ]);
        Enrollment::factory()->create([
            'user_id' => $this->child->id,
            'program_id' => $selectedProgram->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
        ]);

        $secondChild = User::factory()->create();
        $secondChild->assignRole('student');
        $this->parent->children()->attach($secondChild->id);

        $otherProgram = Program::factory()->create([
            'name' => 'Other Program',
            'is_active' => true,
        ]);
        Enrollment::factory()->create([
            'user_id' => $secondChild->id,
            'program_id' => $otherProgram->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
        ]);

        $response = $this->actingAs($this->parent)->get("/parent/children/{$this->child->id}/learning-dashboard");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('parentView.child.id', $this->child->id)
            ->where('enrolledProgram.id', $selectedProgram->id)
            ->where('enrolledProgram.name', 'Selected Program')
        );
    }

    public function test_parent_cannot_open_unlinked_child(): void
    {
        $response = $this->actingAs($this->parent)->get("/parent/children/{$this->otherChild->id}");

        $response->assertNotFound();
    }

    public function test_parent_cannot_open_unlinked_child_learning_dashboard(): void
    {
        $response = $this->actingAs($this->parent)->get("/parent/children/{$this->otherChild->id}/learning-dashboard");

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

    public function test_parent_cannot_access_lesson_or_resource_content_routes(): void
    {
        $program = Program::factory()->create(['is_active' => true]);
        $lesson = Lesson::factory()->create(['program_id' => $program->id]);
        $resource = LessonResource::factory()->create(['lesson_id' => $lesson->id]);

        $this->actingAs($this->parent)
            ->get("/lessons/{$lesson->id}")
            ->assertForbidden();

        $this->actingAs($this->parent)
            ->post("/lessons/{$lesson->id}/start")
            ->assertForbidden();

        $this->actingAs($this->parent)
            ->get("/lesson-resources/{$resource->id}/preview")
            ->assertForbidden();

        $this->actingAs($this->parent)
            ->post("/lesson-resources/{$resource->id}/mark-viewed")
            ->assertForbidden();
    }

    public function test_parent_cannot_edit_lessons_programs_or_groups(): void
    {
        $program = Program::factory()->create(['is_active' => true]);
        $lesson = Lesson::factory()->create(['program_id' => $program->id]);
        $schedule = ClassSchedule::factory()->upcoming()->create([
            'student_id' => $this->child->id,
            'program_id' => $program->id,
        ]);

        $this->actingAs($this->parent)
            ->get("/admin/programs/{$program->id}/edit")
            ->assertForbidden();

        $this->actingAs($this->parent)
            ->get("/admin/programs/{$program->id}/lessons/{$lesson->id}/edit")
            ->assertForbidden();

        $this->actingAs($this->parent)
            ->get('/admin/class-schedules/create')
            ->assertForbidden();

        $this->actingAs($this->parent)
            ->get("/admin/class-schedules/{$schedule->id}/edit")
            ->assertForbidden();
    }
}
