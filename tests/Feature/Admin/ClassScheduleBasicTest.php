<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Program;
use App\Models\Enrollment;
use App\Models\ClassSchedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class ClassScheduleBasicTest extends TestCase
{
    use RefreshDatabase, CreatesRoles;

    public function test_admin_can_access_class_schedules_page(): void
    {
        $this->createRoles();
        
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get('/admin/class-schedules');
        
        $response->assertStatus(200);
    }

    public function test_admin_can_create_basic_schedule(): void
    {
        $this->createRoles();
        
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        $student = User::factory()->create();
        $student->assignRole('student');

        $scheduleData = [
            'student_id' => $student->id,
            'admin_id' => $admin->id,
            'title' => 'Math Tutoring Session',
            'description' => 'Basic math review',
            'scheduled_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'duration_minutes' => 60,
            'type' => 'lesson',
        ];

        $response = $this->actingAs($admin)
            ->post('/admin/class-schedules', $scheduleData);

        $response->assertRedirect('/admin/class-schedules');
        
        $this->assertDatabaseHas('class_schedules', [
            'student_id' => $student->id,
            'admin_id' => $admin->id,
            'title' => 'Math Tutoring Session',
            'status' => 'scheduled',
        ]);
    }

    public function test_schedule_model_basic_methods(): void
    {
        $this->createRoles();
        
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        $student = User::factory()->create();
        $student->assignRole('student');

        $schedule = ClassSchedule::create([
            'student_id' => $student->id,
            'admin_id' => $admin->id,
            'title' => 'Test Class',
            'scheduled_at' => now()->addDay(),
            'duration_minutes' => 60,
            'type' => 'lesson',
            'status' => 'scheduled',
        ]);

        $this->assertTrue($schedule->isScheduled());
        $this->assertFalse($schedule->isCompleted());
        $this->assertTrue($schedule->canBeCancelled());
        
        // Test relationships
        $this->assertEquals($student->id, $schedule->student->id);
        $this->assertEquals($admin->id, $schedule->admin->id);
    }
}