<?php

namespace Tests\Feature\Integration;

use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class NotificationIntegrationTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

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

    public function test_complete_notification_workflow(): void
    {
        // Step 1: Create an enrollment
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
        ]);

        // Step 2: Approve the enrollment (should create notification)
        $response = $this->actingAs($this->admin)
            ->post("/admin/enrollments/{$enrollment->id}/approve");

        $response->assertRedirect();

        // Step 3: Verify notification was created
        $this->assertEquals(1, Notification::count());
        $notification = Notification::first();
        $this->assertEquals('enrollment', $notification->type);
        $this->assertEquals('approved', $notification->data['action']);

        // Step 4: Test accessing pending enrollments with highlight
        $anotherEnrollment = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)
            ->get("/admin/enrollments/pending?highlight_user={$anotherEnrollment->user_id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('highlight_user_id')
            ->where('highlight_user_id', (string) $anotherEnrollment->user_id)
        );

        // Step 5: Test marking notification as read
        $response = $this->actingAs($this->admin)
            ->patch("/admin/notifications/{$notification->id}/read");

        $response->assertRedirect();
        $notification->refresh();
        $this->assertTrue($notification->is_read);
    }

    public function test_notification_appears_in_admin_layout(): void
    {
        // Create some notifications
        $notification = Notification::factory()->enrollment()->create();

        // Access any admin page and verify notifications are included
        $response = $this->actingAs($this->admin)->get('/admin/enrollments/pending');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('notifications')
            ->has('notifications.recent')
            ->has('notifications.unread_count')
        );
    }

    public function test_enrollment_rejection_creates_proper_notification(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
        ]);

        // Reject the enrollment
        $response = $this->actingAs($this->admin)
            ->post("/admin/enrollments/{$enrollment->id}/reject", [
                'rejection_reason' => 'Insufficient prerequisites',
            ]);

        $response->assertRedirect();

        // Verify notification structure
        $notification = Notification::first();
        $this->assertEquals('enrollment', $notification->type);
        $this->assertEquals('rejected', $notification->data['action']);
        $this->assertEquals($this->student->id, $notification->data['user_id']);
        $this->assertEquals($this->program->name, $notification->data['program_name']);
        $this->assertStringContainsString('rejected', $notification->message);
    }

    public function test_multiple_pending_enrollments_with_highlight_ordering(): void
    {
        // Create multiple enrollments in specific order
        $firstEnrollment = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
            'created_at' => now()->subHours(3),
        ]);

        $secondEnrollment = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
            'created_at' => now()->subHours(2),
        ]);

        $thirdEnrollment = Enrollment::factory()->create([
            'program_id' => $this->program->id,
            'status' => 'paused',
            'approval_status' => 'pending',
            'created_at' => now()->subHours(1),
        ]);

        // Test highlighting the second enrollment (middle one chronologically)
        $response = $this->actingAs($this->admin)
            ->get("/admin/enrollments/pending?highlight_user={$secondEnrollment->user_id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('enrollments', 3)
            ->where('enrollments.0.user.id', $secondEnrollment->user_id) // Should be first due to highlight
            ->where('highlight_user_id', (string) $secondEnrollment->user_id)
        );
    }

    public function test_notification_dropdown_data_structure(): void
    {
        // Create various types of notifications
        Notification::factory()->count(3)->enrollment()->create();
        Notification::factory()->count(2)->general()->create();
        Notification::factory()->count(1)->read()->create();

        $response = $this->actingAs($this->admin)->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('notifications')
            ->has('notifications.recent')
            ->has('notifications.unread_count')
            ->whereType('notifications.unread_count', 'integer')
        );
    }

    public function test_admin_pages_consistently_include_notifications(): void
    {
        Notification::factory()->count(2)->create();

        // Test that enrollments page includes notifications for dropdown
        $response = $this->actingAs($this->admin)->get('/admin/enrollments/pending');

        $response->assertStatus(200);
        $response->assertInertia(fn ($inertiaPage) => $inertiaPage->has('notifications')
            ->has('notifications.recent')
            ->has('notifications.unread_count')
        );
    }
}
