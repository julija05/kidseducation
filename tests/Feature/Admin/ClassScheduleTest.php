<?php

namespace Tests\Feature\Admin;

use App\Models\ClassSchedule;
use App\Models\User;
use App\Models\Program;
use App\Models\Lesson;
use App\Models\Enrollment;
use App\Models\Notification;
use App\Services\NotificationService;
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

    public function test_admin_can_view_class_schedules_index(): void
    {
        ClassSchedule::factory()->count(3)->create();
        
        $response = $this->actingAs($this->admin)->get('/admin/class-schedules');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/ClassSchedules/Index')
                ->has('schedules')
                ->has('admins')
                ->has('filters')
        );
    }

    public function test_admin_can_view_create_schedule_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/class-schedules/create');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/ClassSchedules/Create')
                ->has('students')
                ->has('admins')
                ->has('programs')
        );
    }

    public function test_admin_can_create_class_schedule(): void
    {
        $scheduleData = [
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
            'title' => 'Math Tutoring Session',
            'description' => 'Focus on algebra basics',
            'scheduled_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
            'location' => 'Online',
            'meeting_link' => 'https://zoom.us/j/123456789',
            'type' => 'lesson',
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/class-schedules', $scheduleData);

        $response->assertRedirect('/admin/class-schedules');
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('class_schedules', [
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
            'title' => 'Math Tutoring Session',
            'status' => 'scheduled',
        ]);

        // Should create notification
        $this->assertDatabaseHas('notifications', [
            'type' => 'schedule',
            'title' => 'Class Scheduled',
        ]);
    }

    public function test_admin_can_create_schedule_with_program_and_lesson(): void
    {
        // Create enrollment
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'approval_status' => 'approved',
            'status' => 'active',
        ]);

        $lesson = Lesson::factory()->create([
            'program_id' => $this->program->id,
        ]);

        $scheduleData = [
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
            'program_id' => $this->program->id,
            'lesson_id' => $lesson->id,
            'title' => 'Math Lesson 1',
            'scheduled_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
            'type' => 'lesson',
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/class-schedules', $scheduleData);

        $response->assertRedirect('/admin/class-schedules');
        
        $this->assertDatabaseHas('class_schedules', [
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'lesson_id' => $lesson->id,
        ]);
    }

    public function test_cannot_create_schedule_for_unenrolled_student(): void
    {
        $scheduleData = [
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
            'program_id' => $this->program->id, // Student not enrolled
            'title' => 'Math Lesson',
            'scheduled_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
            'type' => 'lesson',
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/class-schedules', $scheduleData);

        $response->assertSessionHasErrors(['program_id']);
        $this->assertDatabaseCount('class_schedules', 0);
    }

    public function test_cannot_create_conflicting_schedules(): void
    {
        // Create existing schedule
        ClassSchedule::factory()->create([
            'admin_id' => $this->admin->id,
            'scheduled_at' => now()->addDays(2)->setTime(14, 0), // 2 PM
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);

        // Try to create conflicting schedule
        $scheduleData = [
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
            'title' => 'Conflicting Session',
            'scheduled_at' => now()->addDays(2)->setTime(14, 30)->format('Y-m-d H:i:s'), // 2:30 PM - conflicts
            'duration_minutes' => 60,
            'type' => 'lesson',
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/class-schedules', $scheduleData);

        $response->assertSessionHasErrors(['scheduled_at']);
    }

    public function test_admin_can_view_specific_schedule(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get("/admin/class-schedules/{$schedule->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/ClassSchedules/Show')
                ->has('schedule')
        );
    }

    public function test_admin_can_edit_schedule(): void
    {
        $schedule = ClassSchedule::factory()->scheduled()->create([
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get("/admin/class-schedules/{$schedule->id}/edit");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/ClassSchedules/Edit')
                ->has('schedule')
        );
    }

    public function test_admin_can_update_schedule(): void
    {
        $schedule = ClassSchedule::factory()->scheduled()->create([
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
            'title' => 'Original Title',
        ]);

        $updateData = [
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
            'title' => 'Updated Title',
            'description' => 'Updated description',
            'scheduled_at' => now()->addDays(3)->format('Y-m-d H:i:s'),
            'duration_minutes' => 90,
            'type' => 'assessment',
        ];

        $response = $this->actingAs($this->admin)
            ->put("/admin/class-schedules/{$schedule->id}", $updateData);

        $response->assertRedirect('/admin/class-schedules');
        
        $schedule->refresh();
        $this->assertEquals('Updated Title', $schedule->title);
        $this->assertEquals(90, $schedule->duration_minutes);
    }

    public function test_cannot_edit_completed_schedule(): void
    {
        $schedule = ClassSchedule::factory()->completed()->create();

        $response = $this->actingAs($this->admin)
            ->get("/admin/class-schedules/{$schedule->id}/edit");

        $response->assertRedirect("/admin/class-schedules/{$schedule->id}")
            ->assertSessionHas('error');
    }

    public function test_admin_can_cancel_schedule(): void
    {
        $schedule = ClassSchedule::factory()->scheduled()->create([
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/class-schedules/{$schedule->id}/cancel", [
                'cancellation_reason' => 'Student unavailable',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        $schedule->refresh();
        $this->assertEquals('cancelled', $schedule->status);
        $this->assertEquals('Student unavailable', $schedule->cancellation_reason);
        $this->assertEquals($this->admin->id, $schedule->cancelled_by);
        $this->assertNotNull($schedule->cancelled_at);

        // Should create cancellation notification
        $this->assertDatabaseHas('notifications', [
            'type' => 'schedule',
            'title' => 'Class Cancelled',
        ]);
    }

    public function test_admin_can_complete_schedule(): void
    {
        $schedule = ClassSchedule::factory()->confirmed()->create([
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/class-schedules/{$schedule->id}/complete", [
                'session_notes' => 'Great progress on algebra',
                'session_data' => ['topics_covered' => ['Variables', 'Equations']],
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        $schedule->refresh();
        $this->assertEquals('completed', $schedule->status);
        $this->assertEquals('Great progress on algebra', $schedule->session_notes);
        $this->assertNotNull($schedule->completed_at);
    }

    public function test_can_filter_schedules_by_status(): void
    {
        ClassSchedule::factory()->scheduled()->count(2)->create();
        ClassSchedule::factory()->completed()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->get('/admin/class-schedules?status=completed');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->where('filters.status', 'completed')
        );
    }

    public function test_can_filter_schedules_by_date(): void
    {
        ClassSchedule::factory()->today()->count(2)->create();
        ClassSchedule::factory()->upcoming()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->get('/admin/class-schedules?date_filter=today');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->where('filters.date_filter', 'today')
        );
    }

    public function test_can_search_schedules_by_student_name(): void
    {
        $student1 = User::factory()->create(['name' => 'John Doe']);
        $student2 = User::factory()->create(['name' => 'Jane Smith']);
        
        ClassSchedule::factory()->create(['student_id' => $student1->id]);
        ClassSchedule::factory()->create(['student_id' => $student2->id]);

        $response = $this->actingAs($this->admin)
            ->get('/admin/class-schedules?search=John');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->where('filters.search', 'John')
        );
    }

    public function test_can_get_lessons_for_program(): void
    {
        $lesson1 = Lesson::factory()->create([
            'program_id' => $this->program->id,
            'title' => 'Lesson 1',
            'is_active' => true,
        ]);
        
        $lesson2 = Lesson::factory()->create([
            'program_id' => $this->program->id,
            'title' => 'Lesson 2',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->get("/admin/class-schedules/programs/{$this->program->id}/lessons");

        $response->assertStatus(200);
        $response->assertJsonCount(2);
        $response->assertJsonFragment(['title' => 'Lesson 1']);
        $response->assertJsonFragment(['title' => 'Lesson 2']);
    }

    public function test_can_check_scheduling_conflicts(): void
    {
        // Create existing schedule
        $existingSchedule = ClassSchedule::factory()->create([
            'admin_id' => $this->admin->id,
            'scheduled_at' => now()->addDays(2)->setTime(14, 0), // 2 PM
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->admin)
            ->post('/admin/class-schedules/check-conflicts', [
                'admin_id' => $this->admin->id,
                'scheduled_at' => now()->addDays(2)->setTime(14, 30)->format('Y-m-d H:i:s'), // 2:30 PM
                'duration_minutes' => 60,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'has_conflicts' => true,
            'conflicts' => [
                [
                    'id' => $existingSchedule->id,
                    'title' => $existingSchedule->title,
                ]
            ]
        ]);
    }

    public function test_student_cannot_access_class_schedule_routes(): void
    {
        $schedule = ClassSchedule::factory()->create();
        
        $routes = [
            ['GET', '/admin/class-schedules'],
            ['GET', '/admin/class-schedules/create'],
            ['POST', '/admin/class-schedules'],
            ['GET', "/admin/class-schedules/{$schedule->id}"],
            ['GET', "/admin/class-schedules/{$schedule->id}/edit"],
            ['PUT', "/admin/class-schedules/{$schedule->id}"],
            ['POST', "/admin/class-schedules/{$schedule->id}/cancel"],
            ['POST', "/admin/class-schedules/{$schedule->id}/complete"],
        ];

        foreach ($routes as [$method, $route]) {
            $response = $this->actingAs($this->student);
            
            if ($method === 'GET') {
                $response = $response->get($route);
            } elseif ($method === 'POST') {
                $response = $response->post($route, ['cancellation_reason' => 'test']);
            } elseif ($method === 'PUT') {
                $response = $response->put($route, [
                    'student_id' => $this->student->id,
                    'admin_id' => $this->admin->id,
                    'title' => 'Test',
                    'scheduled_at' => now()->addDay(),
                    'duration_minutes' => 60,
                    'type' => 'lesson',
                ]);
            }
            
            $response->assertStatus(403);
        }
    }

    public function test_guest_cannot_access_class_schedule_routes(): void
    {
        $routes = [
            '/admin/class-schedules',
            '/admin/class-schedules/create',
        ];

        foreach ($routes as $route) {
            $response = $this->get($route);
            $response->assertRedirect(route('login'));
        }
    }

    public function test_notification_service_creates_schedule_notification(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
            'title' => 'Test Class',
        ]);

        $notificationService = new NotificationService();
        $notification = $notificationService->createScheduleNotification($schedule, 'scheduled');

        $this->assertEquals('Class Scheduled', $notification->title);
        $this->assertEquals('schedule', $notification->type);
        $this->assertStringContainsString('Test Class', $notification->message);
        $this->assertStringContainsString($this->admin->name, $notification->message);
        
        $this->assertArrayHasKey('schedule_id', $notification->data);
        $this->assertArrayHasKey('student_id', $notification->data);
        $this->assertArrayHasKey('admin_id', $notification->data);
        $this->assertEquals($schedule->id, $notification->data['schedule_id']);
    }

    public function test_class_schedule_model_relationships(): void
    {
        $schedule = ClassSchedule::factory()->create([
            'student_id' => $this->student->id,
            'admin_id' => $this->admin->id,
            'program_id' => $this->program->id,
        ]);

        $this->assertEquals($this->student->id, $schedule->student->id);
        $this->assertEquals($this->admin->id, $schedule->admin->id);
        $this->assertEquals($this->program->id, $schedule->program->id);
    }

    public function test_class_schedule_scopes(): void
    {
        ClassSchedule::factory()->upcoming()->count(3)->create();
        ClassSchedule::factory()->today()->count(2)->create();
        ClassSchedule::factory()->create(['status' => 'completed']);

        $this->assertEquals(5, ClassSchedule::upcoming()->count());
        $this->assertEquals(2, ClassSchedule::today()->count());
        $this->assertEquals(1, ClassSchedule::byStatus('completed')->count());
    }

    public function test_class_schedule_status_methods(): void
    {
        $scheduledClass = ClassSchedule::factory()->scheduled()->create();
        $confirmedClass = ClassSchedule::factory()->confirmed()->create();
        $cancelledClass = ClassSchedule::factory()->cancelled()->create();
        $completedClass = ClassSchedule::factory()->completed()->create();

        $this->assertTrue($scheduledClass->isScheduled());
        $this->assertTrue($confirmedClass->isConfirmed());
        $this->assertTrue($cancelledClass->isCancelled());
        $this->assertTrue($completedClass->isCompleted());

        $this->assertTrue($scheduledClass->canBeCancelled());
        $this->assertFalse($completedClass->canBeCancelled());
    }

    public function test_schedule_validation_rules(): void
    {
        $invalidData = [
            'student_id' => 999, // Non-existent
            'admin_id' => 999, // Non-existent
            'title' => '', // Required
            'scheduled_at' => '2020-01-01', // Past date
            'duration_minutes' => 5, // Too short
            'type' => 'invalid', // Invalid type
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/class-schedules', $invalidData);

        $response->assertSessionHasErrors([
            'student_id',
            'admin_id',
            'title',
            'scheduled_at',
            'duration_minutes',
            'type',
        ]);
    }
}