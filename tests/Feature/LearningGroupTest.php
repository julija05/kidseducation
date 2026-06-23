<?php

namespace Tests\Feature;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Models\ClassSchedule;
use App\Models\Enrollment;
use App\Models\LearningGroup;
use App\Models\Lesson;
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

    public function test_mentor_cannot_create_learning_group_for_unapproved_program(): void
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

        $response->assertSessionHasErrors('program_id');

        $this->assertDatabaseMissing('learning_groups', [
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

    public function test_admin_can_add_and_remove_approved_student_from_group(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');

        $program = Program::factory()->create(['is_active' => true]);
        $student = $this->approvedStudentForProgram($program);

        $group = LearningGroup::create([
            'name' => 'Group With Students',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 10,
        ]);

        $response = $this->actingAs($admin)->post("/admin/learning-groups/{$group->id}/students", [
            'student_id' => $student->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('learning_group_student', [
            'learning_group_id' => $group->id,
            'student_id' => $student->id,
        ]);
        $this->assertEquals(1, $group->fresh()->students()->count());

        $response = $this->actingAs($admin)->delete("/admin/learning-groups/{$group->id}/students/{$student->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('learning_group_student', [
            'learning_group_id' => $group->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_student_cannot_be_duplicated_in_same_group(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');

        $program = Program::factory()->create(['is_active' => true]);
        $student = $this->approvedStudentForProgram($program);

        $group = LearningGroup::create([
            'name' => 'Unique Students Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 10,
        ]);

        $group->students()->attach($student->id);

        $response = $this->actingAs($admin)->post("/admin/learning-groups/{$group->id}/students", [
            'student_id' => $student->id,
        ]);

        $response->assertSessionHasErrors('student_id');
        $this->assertEquals(1, $group->fresh()->students()->whereKey($student->id)->count());
    }

    public function test_mentor_can_manage_students_only_for_own_group(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');

        $otherMentor = User::factory()->create();
        $otherMentor->assignRole('mentor');

        $program = Program::factory()->create(['is_active' => true]);
        $student = $this->approvedStudentForProgram($program);
        Enrollment::where('user_id', $student->id)
            ->where('program_id', $program->id)
            ->update(['assigned_mentor_id' => $mentor->id]);

        $group = LearningGroup::create([
            'name' => 'Mentor Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 10,
        ]);

        $response = $this->actingAs($mentor)->post("/mentor/learning-groups/{$group->id}/students", [
            'student_id' => $student->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('learning_group_student', [
            'learning_group_id' => $group->id,
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($otherMentor)->delete("/mentor/learning-groups/{$group->id}/students/{$student->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('learning_group_student', [
            'learning_group_id' => $group->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_mentor_cannot_add_student_assigned_to_another_mentor(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');

        $otherMentor = User::factory()->create();
        $otherMentor->assignRole('mentor');

        $program = Program::factory()->create(['is_active' => true]);

        Enrollment::factory()->create([
            'user_id' => $mentor->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::MENTOR,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
        ]);

        $student = $this->approvedStudentForProgram($program);
        Enrollment::where('user_id', $student->id)
            ->where('program_id', $program->id)
            ->update(['assigned_mentor_id' => $otherMentor->id]);

        $group = LearningGroup::create([
            'name' => 'Mentor Restricted Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 10,
        ]);

        $response = $this->actingAs($mentor)->post("/mentor/learning-groups/{$group->id}/students", [
            'student_id' => $student->id,
        ]);

        $response->assertSessionHasErrors('student_id');
        $this->assertDatabaseMissing('learning_group_student', [
            'learning_group_id' => $group->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_mentor_create_page_only_lists_approved_active_programs(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');

        $approvedProgram = Program::factory()->create([
            'name' => 'Approved Program',
            'is_active' => true,
        ]);
        $unapprovedProgram = Program::factory()->create([
            'name' => 'Unapproved Program',
            'is_active' => true,
        ]);

        Enrollment::factory()->create([
            'user_id' => $mentor->id,
            'program_id' => $approvedProgram->id,
            'enrollment_type' => EnrollmentType::MENTOR,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
        ]);

        Enrollment::factory()->create([
            'user_id' => $mentor->id,
            'program_id' => $unapprovedProgram->id,
            'enrollment_type' => EnrollmentType::MENTOR,
            'approval_status' => ApprovalStatus::PENDING,
            'status' => EnrollmentStatus::PAUSED,
        ]);

        $response = $this->actingAs($mentor)->get('/mentor/learning-groups/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Mentor/LearningGroups/Create')
            ->has('programs', 1)
            ->where('programs.0.id', $approvedProgram->id)
            ->where('programs.0.name', 'Approved Program')
        );
    }

    public function test_mentor_can_open_group_dashboard_with_class_and_overview_data(): void
    {
        $mentor = User::factory()->create(['name' => 'Grace Mentor']);
        $mentor->assignRole('mentor');

        $program = Program::factory()->create([
            'name' => 'Mental Math',
            'is_active' => true,
        ]);

        $lesson = Lesson::factory()->create([
            'program_id' => $program->id,
            'title' => 'Two digit addition',
            'level' => 2,
            'is_active' => true,
        ]);

        $firstStudent = $this->approvedStudentForProgram($program);
        $firstStudent->update(['name' => 'Ada Learner']);
        $secondStudent = $this->approvedStudentForProgram($program);
        $secondStudent->update(['name' => 'Ben Learner']);

        $group = LearningGroup::create([
            'name' => 'Saturday Math Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 10,
        ]);
        $group->students()->attach([$firstStudent->id, $secondStudent->id]);

        $nextClass = ClassSchedule::factory()->confirmed()->create([
            'student_id' => null,
            'admin_id' => $mentor->id,
            'program_id' => $program->id,
            'lesson_id' => $lesson->id,
            'title' => 'Saturday Math Group',
            'description' => 'Addition strategies',
            'scheduled_at' => now()->addDays(2)->setTime(15, 30),
            'meeting_link' => 'https://example.test/live/saturday',
            'is_group_class' => true,
            'max_students' => 10,
        ]);
        $nextClass->students()->attach([$firstStudent->id, $secondStudent->id]);

        $completedClass = ClassSchedule::factory()->completed()->create([
            'student_id' => null,
            'admin_id' => $mentor->id,
            'program_id' => $program->id,
            'title' => 'Saturday Math Group',
            'is_group_class' => true,
            'max_students' => 10,
            'session_data' => [
                'homework' => [
                    'current' => 'Practice addition worksheet',
                    'completed' => false,
                    'needs_help' => true,
                ],
                'attendance' => [
                    $firstStudent->id => 'attended',
                    $secondStudent->id => 'missed',
                ],
                'help_requests' => [
                    [
                        'student_id' => $firstStudent->id,
                        'message' => 'Needs help with carrying.',
                    ],
                ],
            ],
        ]);
        $completedClass->students()->attach([$firstStudent->id, $secondStudent->id]);

        $response = $this->actingAs($mentor)->get("/mentor/learning-groups/{$group->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Mentor/LearningGroups/Show')
            ->where('group.name', 'Saturday Math Group')
            ->where('group.program.name', 'Mental Math')
            ->where('group.mentor.name', 'Grace Mentor')
            ->has('group.students', 2)
            ->where('group.students.0.name', 'Ada Learner')
            ->where('group.students.1.name', 'Ben Learner')
            ->where('group.next_live_class.date', $nextClass->scheduled_at->format('M d, Y'))
            ->where('group.next_live_class.time', '3:30 PM')
            ->where('group.next_live_class.meeting_link', 'https://example.test/live/saturday')
            ->where('group.current_lesson.title', 'Two digit addition')
            ->where('group.homework_summary.assigned_count', 1)
            ->where('group.homework_summary.not_completed_count', 1)
            ->where('group.homework_summary.needs_help_count', 1)
            ->where('group.homework_summary.latest.current', 'Practice addition worksheet')
            ->where('group.attendance_summary.classes_completed', 1)
            ->where('group.attendance_summary.attended_count', 1)
            ->where('group.attendance_summary.missed_count', 1)
            ->where('group.attendance_summary.attendance_rate', 50)
            ->where('group.help_requests.0.student_name', 'Ada Learner')
            ->where('group.help_requests.0.message', 'Needs help with carrying.')
        );
    }

    public function test_mentor_cannot_open_another_mentor_group_dashboard(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');

        $otherMentor = User::factory()->create();
        $otherMentor->assignRole('mentor');

        $program = Program::factory()->create(['is_active' => true]);

        $group = LearningGroup::create([
            'name' => 'Private Group',
            'program_id' => $program->id,
            'mentor_id' => $otherMentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 10,
        ]);

        $response = $this->actingAs($mentor)->get("/mentor/learning-groups/{$group->id}");

        $response->assertForbidden();
    }

    public function test_admin_can_open_group_dashboard(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $mentor = User::factory()->create(['name' => 'Admin Visible Mentor']);
        $mentor->assignRole('mentor');

        $program = Program::factory()->create([
            'name' => 'Coding Basics',
            'is_active' => true,
        ]);

        $student = $this->approvedStudentForProgram($program);

        $group = LearningGroup::create([
            'name' => 'Coding Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 10,
        ]);
        $group->students()->attach($student->id);

        $response = $this->actingAs($admin)->get("/admin/learning-groups/{$group->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/LearningGroups/Show')
            ->where('group.name', 'Coding Group')
            ->where('group.program.name', 'Coding Basics')
            ->where('group.mentor.name', 'Admin Visible Mentor')
            ->has('group.students', 1)
        );
    }

    private function approvedStudentForProgram(Program $program): User
    {
        $student = User::factory()->create();
        $student->assignRole('student');

        Enrollment::factory()->create([
            'user_id' => $student->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'approval_status' => ApprovalStatus::APPROVED,
            'status' => EnrollmentStatus::ACTIVE,
        ]);

        return $student;
    }
}
