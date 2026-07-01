<?php

namespace Tests\Feature\Mentor;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Models\ClassSchedule;
use App\Models\Enrollment;
use App\Models\LearningGroup;
use App\Models\Meeting;
use App\Models\MeetingParticipant;
use App\Models\Notification;
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

    public function test_mentor_dashboard_shows_active_groups_with_next_class_and_student_count(): void
    {
        $activeGroup = LearningGroup::create([
            'name' => 'Active Mentor Group',
            'program_id' => $this->program->id,
            'mentor_id' => $this->mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 8,
        ]);
        $activeGroup->students()->attach($this->assignedStudent->id);

        $inactiveGroup = LearningGroup::create([
            'name' => 'Inactive Mentor Group',
            'program_id' => $this->program->id,
            'mentor_id' => $this->mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_COMPLETED,
            'max_students' => 8,
        ]);
        $inactiveGroup->students()->attach($this->assignedStudent->id);

        $otherMentorGroup = LearningGroup::create([
            'name' => 'Other Mentor Group',
            'program_id' => $this->program->id,
            'mentor_id' => $this->otherMentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 8,
        ]);
        $otherMentorGroup->students()->attach($this->otherStudent->id);

        $nextClass = ClassSchedule::factory()->confirmed()->create([
            'student_id' => null,
            'admin_id' => $this->mentor->id,
            'program_id' => $this->program->id,
            'title' => 'Active Mentor Group',
            'description' => 'Live abacus practice',
            'scheduled_at' => now()->addDays(3)->setTime(14, 15),
            'is_group_class' => true,
            'max_students' => 8,
        ]);
        $nextClass->students()->attach($this->assignedStudent->id);

        $response = $this->actingAs($this->mentor)->get('/mentor/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Mentor/Dashboard')
            ->has('activeGroups', 1)
            ->where('activeGroups.0.id', $activeGroup->id)
            ->where('activeGroups.0.name', 'Active Mentor Group')
            ->where('activeGroups.0.students_count', 1)
            ->where('activeGroups.0.max_students', 8)
            ->where('activeGroups.0.next_live_class.topic', 'Live abacus practice')
            ->where('activeGroups.0.next_live_class.date', $nextClass->scheduled_at->format('M d, Y'))
            ->where('activeGroups.0.next_live_class.time', '2:15 PM')
            ->has('studentGroupOptions', 1)
            ->where('studentGroupOptions.0.id', $activeGroup->id)
            ->where('allStudents.0.groups.0.name', 'Active Mentor Group')
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

    public function test_mentor_can_schedule_a_meeting_for_every_student_in_owned_group(): void
    {
        $secondStudent = User::factory()->create();
        $secondStudent->assignRole('student');

        $group = $this->createGroup($this->mentor);
        $group->students()->attach([$this->assignedStudent->id, $secondStudent->id]);

        $response = $this->actingAs($this->mentor)->post('/mentor/meetings', [
            'title' => 'Group arithmetic class',
            'description' => 'Weekly group class',
            'meeting_type' => 'group',
            'learning_group_id' => $group->id,
            'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
            'meeting_url' => 'https://example.test/classroom',
        ]);

        $response->assertRedirect('/mentor/meetings');

        $meeting = Meeting::where('learning_group_id', $group->id)->firstOrFail();
        $this->assertEqualsCanonicalizing(
            [$this->assignedStudent->id, $secondStudent->id],
            $meeting->participants()->pluck('student_id')->all()
        );
        $this->assertSame(2, $meeting->max_participants);

        foreach ([$this->assignedStudent, $secondStudent] as $student) {
            $notification = Notification::where('type', 'meeting')
                ->whereJsonContains('data->student_id', $student->id)
                ->first();

            $this->assertNotNull($notification);
            $this->assertSame($meeting->id, $notification->data['meeting_id']);
            $this->assertSame($group->id, $notification->data['group_id']);
        }
    }

    public function test_mentor_cannot_schedule_for_another_mentors_group(): void
    {
        $group = $this->createGroup($this->otherMentor);
        $group->students()->attach($this->otherStudent->id);

        $response = $this->actingAs($this->mentor)->post('/mentor/meetings', [
            'title' => 'Unauthorized group class',
            'meeting_type' => 'group',
            'learning_group_id' => $group->id,
            'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
        ]);

        $response->assertSessionHasErrors('learning_group_id');
        $this->assertDatabaseMissing('meetings', ['title' => 'Unauthorized group class']);
    }

    public function test_mentor_can_record_attendance_for_own_meeting(): void
    {
        $meeting = Meeting::create([
            'mentor_id' => $this->mentor->id,
            'title' => 'Attendance class',
            'meeting_type' => 'individual',
            'scheduled_at' => now()->subHour(),
            'duration_minutes' => 30,
            'max_participants' => 1,
            'status' => 'scheduled',
        ]);
        $participant = MeetingParticipant::create([
            'meeting_id' => $meeting->id,
            'student_id' => $this->assignedStudent->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->mentor)->post("/mentor/meetings/{$meeting->id}/attendance", [
            'attendance' => [[
                'participant_id' => $participant->id,
                'status' => 'attended',
            ]],
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('meeting_participants', [
            'id' => $participant->id,
            'status' => 'attended',
            'attendance_marked_by' => $this->mentor->id,
        ]);
        $this->assertNotNull($participant->fresh()->attendance_marked_at);

        $this->actingAs($this->mentor)
            ->get('/mentor/dashboard')
            ->assertInertia(fn ($page) => $page
                ->where('attendanceSummary.total_records', 1)
                ->where('attendanceSummary.attended_count', 1)
                ->where('attendanceSummary.missed_count', 0)
                ->where('attendanceSummary.attendance_rate', 100)
                ->where('attendanceSummary.recent_records.0.student_name', $this->assignedStudent->name)
                ->where('allStudents.0.meeting_attendance.attendance_rate', 100)
            );
    }

    public function test_group_meeting_attendance_is_included_in_the_mentor_group_dashboard(): void
    {
        $group = $this->createGroup($this->mentor);
        $group->students()->attach($this->assignedStudent->id);

        $meeting = Meeting::create([
            'mentor_id' => $this->mentor->id,
            'learning_group_id' => $group->id,
            'title' => 'Group attendance class',
            'meeting_type' => 'group',
            'scheduled_at' => now()->subHour(),
            'duration_minutes' => 45,
            'max_participants' => 1,
            'status' => 'completed',
        ]);
        $participant = MeetingParticipant::create([
            'meeting_id' => $meeting->id,
            'student_id' => $this->assignedStudent->id,
            'status' => 'attended',
            'attendance_marked_at' => now(),
            'attendance_marked_by' => $this->mentor->id,
        ]);

        $this->actingAs($this->mentor)
            ->get("/mentor/learning-groups/{$group->id}")
            ->assertInertia(fn ($page) => $page
                ->where('group.attendance_summary.classes_completed', 1)
                ->where('group.attendance_summary.attendance_records', 1)
                ->where('group.attendance_summary.attended_count', 1)
                ->where('group.attendance_summary.missed_count', 0)
                ->where('group.attendance_summary.attendance_rate', 100)
                ->where('group.attendance_summary.student_history.0.student_id', $this->assignedStudent->id)
                ->where('group.attendance_summary.student_history.0.records.0.class_id', "meeting-{$meeting->id}")
                ->where('group.attendance_summary.student_history.0.records.0.class_title', 'Group attendance class')
                ->where('group.attendance_summary.student_history.0.records.0.marked_by', $this->mentor->name)
            );
    }

    private function createGroup(User $mentor): LearningGroup
    {
        return LearningGroup::create([
            'name' => "{$mentor->name}'s group",
            'program_id' => $this->program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 10,
        ]);
    }
}
