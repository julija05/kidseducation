<?php

namespace Tests\Unit;

use App\Models\ClassSchedule;
use App\Models\User;
use App\Models\Program;
use App\Models\Lesson;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class ClassScheduleTest extends TestCase
{
    use RefreshDatabase, CreatesRoles;

    private User $admin;
    private User $student;
    private Program $program;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->createRoles();
        
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        
        $this->student = User::factory()->create();
        $this->student->assignRole('student');
        
        $this->program = Program::factory()->create();
    }

    public function test_class_schedule_has_correct_fillable_attributes(): void
    {
        $schedule = new ClassSchedule();
        
        $expectedFillable = [
            'student_id',
            'admin_id',
            'program_id',
            'lesson_id',
            'title',
            'description',
            'scheduled_at',
            'duration_minutes',
            'location',
            'meeting_link',
            'status',
            'type',
            'cancellation_reason',
            'cancelled_at',
            'cancelled_by',
            'session_notes',
            'session_data',
            'completed_at',
            'student_notified_at',
            'reminder_sent_at',
        ];

        $this->assertEquals($expectedFillable, $schedule->getFillable());
    }

    public function test_class_schedule_has_correct_default_attributes(): void
    {
        $schedule = new ClassSchedule();
        
        $this->assertEquals('scheduled', $schedule->status);
        $this->assertEquals('lesson', $schedule->type);
        $this->assertEquals(60, $schedule->duration_minutes);
    }

    public function test_class_schedule_casts_attributes_correctly(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'scheduled_at' => '2024-12-01 10:00:00',
            'session_data' => ['test' => 'data'],
            'duration_minutes' => '90',
        ]);

        $this->assertInstanceOf(\DateTime::class, $schedule->scheduled_at);
        $this->assertIsArray($schedule->session_data);
        $this->assertIsInt($schedule->duration_minutes);
    }

    public function test_student_relationship(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'student_id' => $this->student->id,
        ]);

        $this->assertInstanceOf(User::class, $schedule->student);
        $this->assertEquals($this->student->id, $schedule->student->id);
    }

    public function test_admin_relationship(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'admin_id' => $this->admin->id,
        ]);

        $this->assertInstanceOf(User::class, $schedule->admin);
        $this->assertEquals($this->admin->id, $schedule->admin->id);
    }

    public function test_program_relationship(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'program_id' => $this->program->id,
        ]);

        $this->assertInstanceOf(Program::class, $schedule->program);
        $this->assertEquals($this->program->id, $schedule->program->id);
    }

    public function test_lesson_relationship(): void
    {
        $lesson = Lesson::factory()->create(['program_id' => $this->program->id]);
        
        $schedule = ClassSchedule::factory()->create([
            'lesson_id' => $lesson->id,
            'program_id' => $this->program->id,
        ]);

        $this->assertInstanceOf(Lesson::class, $schedule->lesson);
        $this->assertEquals($lesson->id, $schedule->lesson->id);
    }

    public function test_cancelled_by_relationship(): void
    {
        $schedule = ClassSchedule::factory()->cancelled()->create([
            'cancelled_by' => $this->admin->id,
        ]);

        $this->assertInstanceOf(User::class, $schedule->cancelledBy);
        $this->assertEquals($this->admin->id, $schedule->cancelledBy->id);
    }

    public function test_upcoming_scope(): void
    {
        // Create past schedules
        ClassSchedule::factory()->count(2)->create([
            'scheduled_at' => now()->subDays(1),
            'status' => 'completed',
        ]);

        // Create upcoming schedules
        ClassSchedule::factory()->count(3)->create([
            'scheduled_at' => now()->addDays(1),
            'status' => 'scheduled',
        ]);

        // Create cancelled future schedule (should not be included)
        ClassSchedule::factory()->create([
            'scheduled_at' => now()->addDays(1),
            'status' => 'cancelled',
        ]);

        $upcomingSchedules = ClassSchedule::upcoming()->get();
        
        $this->assertCount(3, $upcomingSchedules);
        
        foreach ($upcomingSchedules as $schedule) {
            $this->assertTrue($schedule->scheduled_at->isFuture());
            $this->assertContains($schedule->status, ['scheduled', 'confirmed']);
        }
    }

    public function test_today_scope(): void
    {
        // Create schedule for today
        ClassSchedule::factory()->create([
            'scheduled_at' => now()->setTime(14, 0), // 2 PM today
        ]);

        // Create schedule for tomorrow
        ClassSchedule::factory()->create([
            'scheduled_at' => now()->addDay()->setTime(14, 0),
        ]);

        $todaySchedules = ClassSchedule::today()->get();
        
        $this->assertCount(1, $todaySchedules);
        $this->assertTrue($todaySchedules->first()->scheduled_at->isToday());
    }

    public function test_this_week_scope(): void
    {
        // Create schedule for this week
        ClassSchedule::factory()->create([
            'scheduled_at' => now()->addDays(2),
        ]);

        // Create schedule for next week
        ClassSchedule::factory()->create([
            'scheduled_at' => now()->addWeeks(2),
        ]);

        $thisWeekSchedules = ClassSchedule::thisWeek()->get();
        
        $this->assertCount(1, $thisWeekSchedules);
    }

    public function test_for_student_scope(): void
    {
        ClassSchedule::factory()->count(2)->create(['student_id' => $this->student->id]);
        ClassSchedule::factory()->create(); // Different student

        $studentSchedules = ClassSchedule::forStudent($this->student->id)->get();
        
        $this->assertCount(2, $studentSchedules);
        
        foreach ($studentSchedules as $schedule) {
            $this->assertEquals($this->student->id, $schedule->student_id);
        }
    }

    public function test_for_admin_scope(): void
    {
        ClassSchedule::factory()->count(3)->create(['admin_id' => $this->admin->id]);
        ClassSchedule::factory()->create(); // Different admin

        $adminSchedules = ClassSchedule::forAdmin($this->admin->id)->get();
        
        $this->assertCount(3, $adminSchedules);
        
        foreach ($adminSchedules as $schedule) {
            $this->assertEquals($this->admin->id, $schedule->admin_id);
        }
    }

    public function test_by_status_scope(): void
    {
        ClassSchedule::factory()->count(2)->scheduled()->create();
        ClassSchedule::factory()->count(3)->completed()->create();
        ClassSchedule::factory()->cancelled()->create();

        $scheduledCount = ClassSchedule::byStatus('scheduled')->count();
        $completedCount = ClassSchedule::byStatus('completed')->count();
        $cancelledCount = ClassSchedule::byStatus('cancelled')->count();
        
        $this->assertEquals(2, $scheduledCount);
        $this->assertEquals(3, $completedCount);
        $this->assertEquals(1, $cancelledCount);
    }

    public function test_status_check_methods(): void
    {
        $scheduledClass = ClassSchedule::factory()->scheduled()->create();
        $confirmedClass = ClassSchedule::factory()->confirmed()->create();
        $cancelledClass = ClassSchedule::factory()->cancelled()->create();
        $completedClass = ClassSchedule::factory()->completed()->create();

        // Test isScheduled
        $this->assertTrue($scheduledClass->isScheduled());
        $this->assertFalse($confirmedClass->isScheduled());

        // Test isConfirmed
        $this->assertTrue($confirmedClass->isConfirmed());
        $this->assertFalse($scheduledClass->isConfirmed());

        // Test isCancelled
        $this->assertTrue($cancelledClass->isCancelled());
        $this->assertFalse($scheduledClass->isCancelled());

        // Test isCompleted
        $this->assertTrue($completedClass->isCompleted());
        $this->assertFalse($scheduledClass->isCompleted());
    }

    public function test_is_past_method(): void
    {
        $pastSchedule = ClassSchedule::factory()->create([
            'scheduled_at' => now()->subHour(),
        ]);

        $futureSchedule = ClassSchedule::factory()->create([
            'scheduled_at' => now()->addHour(),
        ]);

        $this->assertTrue($pastSchedule->isPast());
        $this->assertFalse($futureSchedule->isPast());
    }

    public function test_is_upcoming_method(): void
    {
        $upcomingSchedule = ClassSchedule::factory()->scheduled()->create([
            'scheduled_at' => now()->addHour(),
        ]);

        $pastSchedule = ClassSchedule::factory()->scheduled()->create([
            'scheduled_at' => now()->subHour(),
        ]);

        $cancelledSchedule = ClassSchedule::factory()->cancelled()->create([
            'scheduled_at' => now()->addHour(),
        ]);

        $this->assertTrue($upcomingSchedule->isUpcoming());
        $this->assertFalse($pastSchedule->isUpcoming());
        $this->assertFalse($cancelledSchedule->isUpcoming());
    }

    public function test_can_be_cancelled_method(): void
    {
        $scheduledClass = ClassSchedule::factory()->scheduled()->create([
            'scheduled_at' => now()->addHour(),
        ]);

        $completedClass = ClassSchedule::factory()->completed()->create();
        $cancelledClass = ClassSchedule::factory()->cancelled()->create();
        $pastClass = ClassSchedule::factory()->scheduled()->create([
            'scheduled_at' => now()->subHour(),
        ]);

        $this->assertTrue($scheduledClass->canBeCancelled());
        $this->assertFalse($completedClass->canBeCancelled());
        $this->assertFalse($cancelledClass->canBeCancelled());
        $this->assertFalse($pastClass->canBeCancelled());
    }

    public function test_confirm_method(): void
    {
        $schedule = ClassSchedule::factory()->scheduled()->create();
        
        $result = $schedule->confirm();
        
        $this->assertTrue($result);
        $this->assertTrue($schedule->fresh()->isConfirmed());
    }

    public function test_confirm_method_fails_for_non_scheduled(): void
    {
        $schedule = ClassSchedule::factory()->completed()->create();
        
        $result = $schedule->confirm();
        
        $this->assertFalse($result);
        $this->assertFalse($schedule->fresh()->isConfirmed());
    }

    public function test_cancel_method(): void
    {
        $schedule = ClassSchedule::factory()->scheduled()->create([
            'scheduled_at' => now()->addHour(),
        ]);
        
        $result = $schedule->cancel('Test reason', $this->admin);
        
        $this->assertTrue($result);
        
        $schedule->refresh();
        $this->assertTrue($schedule->isCancelled());
        $this->assertEquals('Test reason', $schedule->cancellation_reason);
        $this->assertEquals($this->admin->id, $schedule->cancelled_by);
        $this->assertNotNull($schedule->cancelled_at);
    }

    public function test_cancel_method_fails_when_cannot_be_cancelled(): void
    {
        $schedule = ClassSchedule::factory()->completed()->create();
        
        $result = $schedule->cancel('Test reason', $this->admin);
        
        $this->assertFalse($result);
        $this->assertFalse($schedule->fresh()->isCancelled());
    }

    public function test_complete_method(): void
    {
        $schedule = ClassSchedule::factory()->confirmed()->create();
        
        $sessionData = ['topics_covered' => ['Math', 'Science']];
        $result = $schedule->complete('Great session', $sessionData);
        
        $this->assertTrue($result);
        
        $schedule->refresh();
        $this->assertTrue($schedule->isCompleted());
        $this->assertEquals('Great session', $schedule->session_notes);
        $this->assertEquals($sessionData, $schedule->session_data);
        $this->assertNotNull($schedule->completed_at);
    }

    public function test_complete_method_fails_for_cancelled_schedule(): void
    {
        $schedule = ClassSchedule::factory()->cancelled()->create();
        
        $result = $schedule->complete('Notes', []);
        
        $this->assertFalse($result);
        $this->assertFalse($schedule->fresh()->isCompleted());
    }

    public function test_reschedule_method(): void
    {
        $schedule = ClassSchedule::factory()->scheduled()->create([
            'scheduled_at' => now()->addDays(1),
        ]);
        
        $newTime = now()->addDays(2);
        $result = $schedule->reschedule($newTime);
        
        $this->assertTrue($result);
        
        $schedule->refresh();
        $this->assertEquals($newTime->format('Y-m-d H:i:s'), $schedule->scheduled_at->format('Y-m-d H:i:s'));
        $this->assertTrue($schedule->isScheduled()); // Should reset to scheduled
    }

    public function test_mark_student_notified_method(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'student_notified_at' => null,
        ]);
        
        $result = $schedule->markStudentNotified();
        
        $this->assertTrue($result);
        $this->assertNotNull($schedule->fresh()->student_notified_at);
    }

    public function test_mark_reminder_sent_method(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'reminder_sent_at' => null,
        ]);
        
        $result = $schedule->markReminderSent();
        
        $this->assertTrue($result);
        $this->assertNotNull($schedule->fresh()->reminder_sent_at);
    }

    public function test_get_formatted_scheduled_time(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'scheduled_at' => '2024-12-01 14:30:00',
        ]);
        
        $formatted = $schedule->getFormattedScheduledTime();
        
        $this->assertStringContainsString('Dec 01, 2024', $formatted);
        $this->assertStringContainsString('2:30 PM', $formatted);
    }

    public function test_get_formatted_duration(): void
    {
        $schedule1 = ClassSchedule::factory()->create(['duration_minutes' => 60]);
        $schedule2 = ClassSchedule::factory()->create(['duration_minutes' => 90]);
        $schedule3 = ClassSchedule::factory()->create(['duration_minutes' => 30]);
        
        $this->assertEquals('1h', $schedule1->getFormattedDuration());
        $this->assertEquals('1h 30m', $schedule2->getFormattedDuration());
        $this->assertEquals('30m', $schedule3->getFormattedDuration());
    }

    public function test_get_status_color(): void
    {
        $scheduled = ClassSchedule::factory()->scheduled()->create();
        $confirmed = ClassSchedule::factory()->confirmed()->create();
        $cancelled = ClassSchedule::factory()->cancelled()->create();
        $completed = ClassSchedule::factory()->completed()->create();
        
        $this->assertEquals('yellow', $scheduled->getStatusColor());
        $this->assertEquals('green', $confirmed->getStatusColor());
        $this->assertEquals('red', $cancelled->getStatusColor());
        $this->assertEquals('blue', $completed->getStatusColor());
    }

    public function test_get_type_label(): void
    {
        $lesson = ClassSchedule::factory()->lesson()->create();
        $assessment = ClassSchedule::factory()->assessment()->create();
        $consultation = ClassSchedule::factory()->consultation()->create();
        
        $this->assertEquals('Lesson', $lesson->getTypeLabel());
        $this->assertEquals('Assessment', $assessment->getTypeLabel());
        $this->assertEquals('Consultation', $consultation->getTypeLabel());
    }

    public function test_needs_reminder(): void
    {
        // Schedule 25 hours in future (needs reminder)
        $needsReminder = ClassSchedule::factory()->create([
            'scheduled_at' => now()->addHours(25),
            'reminder_sent_at' => null,
            'status' => 'scheduled',
        ]);

        // Schedule 12 hours in future (doesn't need reminder yet)
        $tooEarly = ClassSchedule::factory()->create([
            'scheduled_at' => now()->addHours(12),
            'reminder_sent_at' => null,
            'status' => 'scheduled',
        ]);

        // Already sent reminder
        $alreadySent = ClassSchedule::factory()->create([
            'scheduled_at' => now()->addHours(25),
            'reminder_sent_at' => now(),
            'status' => 'scheduled',
        ]);

        $this->assertTrue($needsReminder->needsReminder());
        $this->assertFalse($tooEarly->needsReminder());
        $this->assertFalse($alreadySent->needsReminder());
    }

    public function test_get_enrollment(): void
    {
        // Create enrollment
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
        ]);

        $schedule = ClassSchedule::factory()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
        ]);

        $result = $schedule->getEnrollment();
        
        $this->assertInstanceOf(Enrollment::class, $result);
        $this->assertEquals($enrollment->id, $result->id);
    }

    public function test_get_enrollment_returns_null_when_no_program(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'program_id' => null,
        ]);

        $result = $schedule->getEnrollment();
        
        $this->assertNull($result);
    }
}