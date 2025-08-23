<?php

namespace Tests\Feature\Admin;

use App\Models\Lesson;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class AdminLessonTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    private User $admin;

    private User $student;

    private Program $program;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles safely
        $this->createRoles();

        // Create test users
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->student = User::factory()->create();
        $this->student->assignRole('student');

        // Create test program
        $this->program = Program::factory()->create();
    }

    public function test_admin_can_view_lessons_index(): void
    {
        // Create some lessons
        Lesson::factory()->count(3)->create([
            'program_id' => $this->program->id,
            'level' => 1,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.programs.lessons.index', $this->program->slug));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Programs/Lessons/Index')
            ->has('program')
            ->has('lessonsByLevel')
        );
    }

    public function test_admin_can_create_lesson(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.programs.lessons.create', $this->program->slug));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Programs/Lessons/Create')
            ->has('program')
            ->has('availableLevels')
            ->has('contentTypes')
        );
    }

    public function test_admin_can_store_lesson(): void
    {
        $lessonData = [
            'title' => 'Test Lesson',
            'description' => 'A test lesson description',
            'level' => 1,
            'content_type' => 'text',
            'content_body' => 'This is the lesson content',
            'duration_minutes' => 45,
            'order_in_level' => 1,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.programs.lessons.store', $this->program->slug), $lessonData);

        $response->assertRedirect(route('admin.programs.lessons.index', $this->program->slug));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('lessons', [
            'program_id' => $this->program->id,
            'title' => 'Test Lesson',
            'level' => 1,
            'content_type' => 'text',
        ]);
    }

    public function test_admin_can_edit_lesson(): void
    {
        $lesson = Lesson::factory()->create([
            'program_id' => $this->program->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.programs.lessons.edit', [$this->program->slug, $lesson->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Programs/Lessons/Edit')
            ->has('program')
            ->has('lesson')
            ->where('lesson.id', $lesson->id)
        );
    }

    public function test_admin_can_update_lesson(): void
    {
        $lesson = Lesson::factory()->create([
            'program_id' => $this->program->id,
            'title' => 'Original Title',
        ]);

        $updateData = [
            'title' => 'Updated Lesson Title',
            'description' => 'Updated description',
            'level' => 2,
            'content_type' => 'video',
            'content_url' => 'https://example.com/video',
            'duration_minutes' => 60,
            'order_in_level' => 1,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.programs.lessons.update', [$this->program->slug, $lesson->id]), $updateData);

        $response->assertRedirect(route('admin.programs.lessons.index', $this->program->slug));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('lessons', [
            'id' => $lesson->id,
            'title' => 'Updated Lesson Title',
            'level' => 2,
            'content_type' => 'video',
        ]);
    }

    public function test_admin_can_delete_lesson(): void
    {
        $lesson = Lesson::factory()->create([
            'program_id' => $this->program->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.programs.lessons.destroy', [$this->program->slug, $lesson->id]));

        $response->assertRedirect(route('admin.programs.lessons.index', $this->program->slug));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('lessons', ['id' => $lesson->id]);
    }

    public function test_admin_cannot_edit_lesson_from_different_program(): void
    {
        $anotherProgram = Program::factory()->create();
        $lesson = Lesson::factory()->create([
            'program_id' => $anotherProgram->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.programs.lessons.edit', [$this->program->slug, $lesson->id]));

        $response->assertStatus(404);
    }

    public function test_lesson_validation_rules(): void
    {
        // Test required fields
        $response = $this->actingAs($this->admin)
            ->post(route('admin.programs.lessons.store', $this->program->slug), []);

        $response->assertSessionHasErrors(['title', 'level', 'content_type', 'duration_minutes']);

        // Test invalid level
        $response = $this->actingAs($this->admin)
            ->post(route('admin.programs.lessons.store', $this->program->slug), [
                'title' => 'Test',
                'level' => 15, // Above max
                'content_type' => 'text',
                'duration_minutes' => 30,
            ]);

        $response->assertSessionHasErrors(['level']);

        // Test invalid content type
        $response = $this->actingAs($this->admin)
            ->post(route('admin.programs.lessons.store', $this->program->slug), [
                'title' => 'Test',
                'level' => 1,
                'content_type' => 'invalid_type',
                'duration_minutes' => 30,
            ]);

        $response->assertSessionHasErrors(['content_type']);
    }

    public function test_lessons_grouped_by_level(): void
    {
        // Create lessons in different levels
        Lesson::factory()->create([
            'program_id' => $this->program->id,
            'level' => 1,
            'title' => 'Level 1 Lesson',
        ]);

        Lesson::factory()->create([
            'program_id' => $this->program->id,
            'level' => 2,
            'title' => 'Level 2 Lesson',
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.programs.lessons.index', $this->program->slug));

        $response->assertInertia(fn ($page) => $page->has('lessonsByLevel', 2) // Should have 2 levels
            ->where('lessonsByLevel.0.level', 1)
            ->where('lessonsByLevel.1.level', 2)
        );
    }

    public function test_auto_assign_order_in_level(): void
    {
        // Create a lesson in level 1
        Lesson::factory()->create([
            'program_id' => $this->program->id,
            'level' => 1,
            'order_in_level' => 1,
        ]);

        // Create another lesson in same level without specifying order
        $lessonData = [
            'title' => 'Second Lesson',
            'level' => 1,
            'content_type' => 'text',
            'duration_minutes' => 30,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.programs.lessons.store', $this->program->slug), $lessonData);

        $response->assertRedirect();

        // Should be assigned order 2 automatically
        $this->assertDatabaseHas('lessons', [
            'title' => 'Second Lesson',
            'level' => 1,
            'order_in_level' => 2,
        ]);
    }

    public function test_student_cannot_access_lesson_management(): void
    {
        $response = $this->actingAs($this->student)
            ->get(route('admin.programs.lessons.index', $this->program->slug));

        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_lesson_management(): void
    {
        $response = $this->get(route('admin.programs.lessons.index', $this->program->slug));

        $response->assertRedirect(route('login'));
    }
}
