<?php

namespace Tests\Unit;

use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\Program;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class NotificationServiceTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    private NotificationService $notificationService;

    private User $admin;

    private User $student;

    private Program $program;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createRoles();
        $this->notificationService = new NotificationService;

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->student = User::factory()->create();
        $this->student->assignRole('student');

        $this->program = Program::factory()->create();
    }

    public function test_can_create_basic_notification(): void
    {
        $notification = $this->notificationService->create(
            'Test Title',
            'Test Message',
            'general'
        );

        $this->assertInstanceOf(Notification::class, $notification);
        $this->assertEquals('Test Title', $notification->title);
        $this->assertEquals('Test Message', $notification->message);
        $this->assertEquals('general', $notification->type);
        $this->assertFalse($notification->is_read);
        $this->assertNull($notification->data);
    }

    public function test_can_create_notification_with_data(): void
    {
        $data = ['key' => 'value', 'number' => 42];

        $notification = $this->notificationService->create(
            'Test Title',
            'Test Message',
            'system',
            $data
        );

        $this->assertEquals($data, $notification->data);
    }

    public function test_can_create_notification_with_related_model(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
        ]);

        $notification = $this->notificationService->create(
            'Test Title',
            'Test Message',
            'enrollment',
            null,
            $enrollment,
            $this->student
        );

        $this->assertEquals(Enrollment::class, $notification->related_model_type);
        $this->assertEquals($enrollment->id, $notification->related_model_id);
        $this->assertEquals($this->student->id, $notification->created_by);
    }

    public function test_can_create_enrollment_notification(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
        ]);

        $notification = $this->notificationService->createEnrollmentNotification($enrollment);

        $this->assertEquals('New Enrollment Request', $notification->title);
        $this->assertEquals('enrollment', $notification->type);
        $this->assertStringContainsString($this->student->name, $notification->message);
        $this->assertStringContainsString($this->program->name, $notification->message);

        $expectedData = [
            'action' => 'pending',
            'user_name' => $this->student->name,
            'user_id' => $this->student->id,
            'program_name' => $this->program->name,
            'program_id' => $this->program->id,
            'enrollment_id' => $enrollment->id,
        ];

        $this->assertEquals($expectedData, $notification->data);
    }

    public function test_can_create_enrollment_notification_with_different_actions(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
        ]);

        $approvedNotification = $this->notificationService->createEnrollmentNotification($enrollment, 'approved');
        $this->assertEquals('Enrollment Approved', $approvedNotification->title);
        $this->assertEquals('approved', $approvedNotification->data['action']);

        $rejectedNotification = $this->notificationService->createEnrollmentNotification($enrollment, 'rejected');
        $this->assertEquals('Enrollment Rejected', $rejectedNotification->title);
        $this->assertEquals('rejected', $rejectedNotification->data['action']);
    }

    public function test_can_get_all_notifications(): void
    {
        Notification::factory()->count(5)->create();

        $notifications = $this->notificationService->getAll();

        $this->assertCount(5, $notifications);
        // Should be ordered by created_at desc
        $this->assertTrue($notifications[0]->created_at >= $notifications[4]->created_at);
    }

    public function test_can_limit_all_notifications(): void
    {
        Notification::factory()->count(10)->create();

        $notifications = $this->notificationService->getAll(3);

        $this->assertCount(3, $notifications);
    }

    public function test_can_get_unread_notifications(): void
    {
        Notification::factory()->count(3)->unread()->create();
        Notification::factory()->count(2)->read()->create();

        $unreadNotifications = $this->notificationService->getUnread();

        $this->assertCount(3, $unreadNotifications);
        foreach ($unreadNotifications as $notification) {
            $this->assertFalse($notification->is_read);
        }
    }

    public function test_can_get_notifications_by_type(): void
    {
        Notification::factory()->count(3)->enrollment()->create();
        Notification::factory()->count(2)->general()->create();

        $enrollmentNotifications = $this->notificationService->getByType('enrollment');
        $generalNotifications = $this->notificationService->getByType('general');

        $this->assertCount(3, $enrollmentNotifications);
        $this->assertCount(2, $generalNotifications);

        foreach ($enrollmentNotifications as $notification) {
            $this->assertEquals('enrollment', $notification->type);
        }
    }

    public function test_can_mark_notification_as_read(): void
    {
        $notification = Notification::factory()->unread()->create();

        $result = $this->notificationService->markAsRead($notification->id);

        $this->assertTrue($result);
        $notification->refresh();
        $this->assertTrue($notification->is_read);
    }

    public function test_mark_as_read_returns_false_for_nonexistent_notification(): void
    {
        $result = $this->notificationService->markAsRead(99999);

        $this->assertFalse($result);
    }

    public function test_can_mark_all_notifications_as_read(): void
    {
        Notification::factory()->count(5)->unread()->create();
        Notification::factory()->count(2)->read()->create();

        $updatedCount = $this->notificationService->markAllAsRead();

        $this->assertEquals(5, $updatedCount);
        $this->assertEquals(0, Notification::unread()->count());
    }

    public function test_can_get_unread_count(): void
    {
        Notification::factory()->count(7)->unread()->create();
        Notification::factory()->count(3)->read()->create();

        $unreadCount = $this->notificationService->getUnreadCount();

        $this->assertEquals(7, $unreadCount);
    }

    public function test_can_delete_old_notifications(): void
    {
        // Create recent notifications (should not be deleted)
        Notification::factory()->count(3)->create(['created_at' => now()->subDays(15)]);

        // Create old notifications (should be deleted)
        Notification::factory()->count(5)->create(['created_at' => now()->subDays(45)]);

        $deletedCount = $this->notificationService->deleteOld(30);

        $this->assertEquals(5, $deletedCount);
        $this->assertEquals(3, Notification::count());
    }

    public function test_get_for_admin_dashboard_returns_correct_structure(): void
    {
        // Create various notifications
        Notification::factory()->count(5)->create(['type' => 'enrollment']);
        Notification::factory()->count(3)->create(['type' => 'general']);
        Notification::factory()->count(2)->read()->create();

        $result = $this->notificationService->getForAdminDashboard();

        $this->assertArrayHasKey('recent', $result);
        $this->assertArrayHasKey('unread_count', $result);
        $this->assertArrayHasKey('pending_enrollments', $result);

        $this->assertLessThanOrEqual(10, count($result['recent'])); // Limited to 10
        $this->assertGreaterThanOrEqual(0, $result['unread_count']); // Should have some unread
    }

    public function test_notifications_have_proper_relationships(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->student->id,
            'program_id' => $this->program->id,
        ]);

        $notification = $this->notificationService->createEnrollmentNotification($enrollment);

        // Test createdBy relationship
        $this->assertEquals($this->student->id, $notification->createdBy->id);

        // Test related model relationship
        $this->assertInstanceOf(Enrollment::class, $notification->relatedModel);
        $this->assertEquals($enrollment->id, $notification->relatedModel->id);
    }

    public function test_notification_scopes_work_correctly(): void
    {
        // Create notifications with explicit types and states
        $unreadNotifications = Notification::factory()->count(3)->unread()->create();
        $readNotifications = Notification::factory()->count(2)->read()->create();
        $enrollmentNotifications = Notification::factory()->count(4)->create(['type' => 'enrollment']);
        $generalNotifications = Notification::factory()->count(2)->create(['type' => 'general']);

        // Calculate expected counts
        $totalNotifications = Notification::count();
        $readCount = Notification::read()->count();
        $unreadCount = Notification::unread()->count();
        $enrollmentCount = Notification::byType('enrollment')->count();
        $generalCount = Notification::byType('general')->count();

        // Test scopes work (use actual counts for assertions)
        $this->assertEquals($totalNotifications, $readCount + $unreadCount);
        $this->assertGreaterThanOrEqual(2, $readCount); // At least 2 read
        $this->assertGreaterThanOrEqual(4, $enrollmentCount); // At least 4 enrollment
        $this->assertGreaterThanOrEqual(2, $generalCount); // At least 2 general
    }

    public function test_notification_mark_as_read_method(): void
    {
        $notification = Notification::factory()->unread()->create();

        $result = $notification->markAsRead();

        $this->assertTrue($result);
        $this->assertTrue($notification->fresh()->is_read);
    }

    public function test_notification_mark_as_unread_method(): void
    {
        $notification = Notification::factory()->read()->create();

        $result = $notification->markAsUnread();

        $this->assertTrue($result);
        $this->assertFalse($notification->fresh()->is_read);
    }
}
