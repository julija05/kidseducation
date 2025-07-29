<?php

namespace Tests\Feature\Admin;

use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\Program;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class NotificationTest extends TestCase
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

    public function test_admin_can_view_notifications_page(): void
    {
        Notification::factory()->count(5)->create();
        
        $response = $this->actingAs($this->admin)->get('/admin/notifications');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Notifications/Index')
                ->has('notifications', 5)
                ->has('unread_count')
                ->has('current_type')
        );
    }

    public function test_admin_can_filter_notifications_by_type(): void
    {
        Notification::factory()->count(3)->enrollment()->create();
        Notification::factory()->count(2)->general()->create();
        
        $response = $this->actingAs($this->admin)->get('/admin/notifications?type=enrollment');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Notifications/Index')
                ->has('notifications', 3)
                ->where('current_type', 'enrollment')
        );
    }

    public function test_admin_can_mark_notification_as_read(): void
    {
        $notification = Notification::factory()->unread()->create();
        
        $response = $this->actingAs($this->admin)
            ->patch("/admin/notifications/{$notification->id}/read");
        
        $response->assertRedirect();
        $notification->refresh();
        $this->assertTrue($notification->is_read);
    }

    public function test_admin_can_mark_all_notifications_as_read(): void
    {
        Notification::factory()->count(5)->unread()->create();
        
        $response = $this->actingAs($this->admin)
            ->patch('/admin/notifications/mark-all-read');
        
        $response->assertRedirect();
        $this->assertEquals(0, Notification::unread()->count());
    }

    public function test_admin_can_delete_notification(): void
    {
        $notification = Notification::factory()->create();
        
        $response = $this->actingAs($this->admin)
            ->delete("/admin/notifications/{$notification->id}");
        
        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_admin_can_cleanup_old_notifications(): void
    {
        // Create old notifications
        Notification::factory()->count(3)->create(['created_at' => now()->subDays(45)]);
        // Create recent notifications
        Notification::factory()->count(2)->create(['created_at' => now()->subDays(15)]);
        
        $response = $this->actingAs($this->admin)
            ->post('/admin/notifications/cleanup', ['days' => 30]);
        
        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertEquals(2, Notification::count());
    }

    public function test_notifications_are_included_in_admin_pages(): void
    {
        Notification::factory()->count(3)->create();
        
        $response = $this->actingAs($this->admin)->get('/admin/dashboard');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('notifications')
                ->has('notifications.recent')
                ->has('notifications.unread_count')
        );
    }

    public function test_pending_enrollments_page_prioritizes_highlighted_user(): void
    {
        // Create multiple pending enrollments
        $enrollment1 = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
            'created_at' => now()->subHours(2)
        ]);
        
        $enrollment2 = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
            'created_at' => now()->subHours(1) // More recent
        ]);

        // Request with highlighted user (enrollment1's user should come first despite being older)
        $response = $this->actingAs($this->admin)
            ->get("/admin/enrollments/pending?highlight_user={$enrollment1->user_id}");
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Enrollments/Pending')
                ->has('enrollments', 2)
                ->where('enrollments.0.user.id', $enrollment1->user_id)
                ->where('highlight_user_id', (string) $enrollment1->user_id)
        );
    }

    public function test_pending_enrollments_page_without_highlight_uses_normal_order(): void
    {
        // Create multiple pending enrollments
        $olderEnrollment = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
            'created_at' => now()->subHours(2)
        ]);
        
        $newerEnrollment = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
            'created_at' => now()->subHours(1)
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/enrollments/pending');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Enrollments/Pending')
                ->has('enrollments', 2)
                ->where('enrollments.0.user.id', $olderEnrollment->user_id) // Older first (ASC order)
                ->where('highlight_user_id', null)
        );
    }

    public function test_enrollment_approval_creates_notification(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);

        $initialNotificationCount = Notification::count();

        $response = $this->actingAs($this->admin)
            ->post("/admin/enrollments/{$enrollment->id}/approve");

        $response->assertRedirect();
        $this->assertEquals($initialNotificationCount + 1, Notification::count());
        
        $notification = Notification::latest()->first();
        $this->assertEquals('enrollment', $notification->type);
        $this->assertEquals('approved', $notification->data['action']);
        $this->assertEquals($this->student->id, $notification->data['user_id']);
    }

    public function test_enrollment_rejection_creates_notification(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending'
        ]);

        $initialNotificationCount = Notification::count();

        $response = $this->actingAs($this->admin)
            ->post("/admin/enrollments/{$enrollment->id}/reject", [
                'rejection_reason' => 'Does not meet requirements'
            ]);

        $response->assertRedirect();
        $this->assertEquals($initialNotificationCount + 1, Notification::count());
        
        $notification = Notification::latest()->first();
        $this->assertEquals('enrollment', $notification->type);
        $this->assertEquals('rejected', $notification->data['action']);
        $this->assertEquals($this->student->id, $notification->data['user_id']);
    }

    public function test_student_cannot_access_notification_routes(): void
    {
        $notification = Notification::factory()->create();
        
        $routes = [
            ['GET', '/admin/notifications'],
            ['PATCH', "/admin/notifications/{$notification->id}/read"],
            ['PATCH', '/admin/notifications/mark-all-read'],
            ['DELETE', "/admin/notifications/{$notification->id}"],
            ['POST', '/admin/notifications/cleanup'],
        ];

        foreach ($routes as [$method, $route]) {
            $response = $this->actingAs($this->student);
            
            if ($method === 'GET') {
                $response = $response->get($route);
            } elseif ($method === 'POST') {
                $response = $response->post($route);
            } elseif ($method === 'PATCH') {
                $response = $response->patch($route);
            } elseif ($method === 'DELETE') {
                $response = $response->delete($route);
            }
            
            $response->assertStatus(403);
        }
    }

    public function test_guest_cannot_access_notification_routes(): void
    {
        $notification = Notification::factory()->create();
        
        // Test GET routes
        $response = $this->get('/admin/notifications');
        $response->assertRedirect(route('login'));
        
        // Test PATCH routes (these should redirect to login, not return 405)
        $response = $this->patch("/admin/notifications/{$notification->id}/read");
        $response->assertRedirect(route('login'));
        
        $response = $this->patch('/admin/notifications/mark-all-read');
        $response->assertRedirect(route('login'));
    }

    public function test_notification_controller_returns_json_when_expected(): void
    {
        $notification = Notification::factory()->unread()->create();
        
        $response = $this->actingAs($this->admin)
            ->withHeaders(['Accept' => 'application/json'])
            ->patch("/admin/notifications/{$notification->id}/read");
        
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    public function test_mark_all_as_read_returns_json_when_expected(): void
    {
        Notification::factory()->count(3)->unread()->create();
        
        $response = $this->actingAs($this->admin)
            ->withHeaders(['Accept' => 'application/json'])
            ->patch('/admin/notifications/mark-all-read');
        
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    public function test_notification_cleanup_with_custom_days(): void
    {
        // Create notifications with different ages
        Notification::factory()->create(['created_at' => now()->subDays(5)]);
        Notification::factory()->create(['created_at' => now()->subDays(15)]);
        Notification::factory()->create(['created_at' => now()->subDays(25)]);
        
        $response = $this->actingAs($this->admin)
            ->post('/admin/notifications/cleanup', ['days' => 10]);
        
        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertEquals(1, Notification::count()); // Only the 5-day-old one should remain
    }

    public function test_notification_data_structure_is_correct(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
        ]);

        $notificationService = new NotificationService();
        $notification = $notificationService->createEnrollmentNotification($enrollment);

        $this->assertIsArray($notification->data);
        $this->assertArrayHasKey('action', $notification->data);
        $this->assertArrayHasKey('user_name', $notification->data);
        $this->assertArrayHasKey('user_id', $notification->data);
        $this->assertArrayHasKey('program_name', $notification->data);
        $this->assertArrayHasKey('program_id', $notification->data);
        $this->assertArrayHasKey('enrollment_id', $notification->data);
        
        $this->assertEquals('pending', $notification->data['action']);
        $this->assertEquals($this->student->name, $notification->data['user_name']);
        $this->assertEquals($this->student->id, $notification->data['user_id']);
        $this->assertEquals($this->program->name, $notification->data['program_name']);
        $this->assertEquals($this->program->id, $notification->data['program_id']);
        $this->assertEquals($enrollment->id, $notification->data['enrollment_id']);
    }
}