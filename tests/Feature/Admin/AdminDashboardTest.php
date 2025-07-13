<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Program;
use App\Models\Lesson;
use App\Models\News;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        \Spatie\Permission\Models\Role::create(['name' => 'student']);
        \Spatie\Permission\Models\Role::create(['name' => 'admin']);

        // Create test users
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->student = User::factory()->create();
        $this->student->assignRole('student');
    }

    public function test_admin_can_access_dashboard(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page->component('Admin/AdminDashboard/AdminDashboard'));
    }

    public function test_student_cannot_access_admin_dashboard(): void
    {
        $response = $this->actingAs($this->student)->get('/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_admin_dashboard(): void
    {
        $response = $this->get('/admin/dashboard');

        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_view_programs_index(): void
    {
        Program::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->get('/admin/programs');

        $response->assertStatus(200);
        $response->assertInertia(
            fn($page) =>
            $page->component('Admin/Programs/AdminPrograms')
                ->has('programs', 3)
        );
    }

    public function test_admin_can_create_program(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/programs/create');

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page->component('Admin/Programs/Create'));
    }

    public function test_admin_can_store_program(): void
    {
        $programData = [
            'name' => 'Test Program',
            'description' => 'A test program description',
            'slug' => 'test-program',
            'is_active' => true
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/programs', $programData);

        $response->assertRedirect();
        $this->assertDatabaseHas('programs', $programData);
    }

    // public function test_admin_can_edit_program(): void
    // {
    //     $program = Program::factory()->create();

    //     $response = $this->actingAs($this->admin)->get("/admin/programs/{$program->id}/edit");

    //     $response->assertStatus(200);
    //     $response->assertInertia(
    //         fn($page) =>
    //         $page->component('Admin/Programs/Edit')
    //             ->has('program')
    //     );
    // }

    public function test_admin_can_view_news_index(): void
    {
        News::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->get('/admin/news');

        $response->assertStatus(200);
        $response->assertInertia(
            fn($page) =>
            $page->component('Admin/News/Index')
                ->has('news', 3)
        );
    }

    public function test_admin_can_create_news(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/news/create');

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page->component('Admin/News/Create'));
    }

    public function test_admin_can_store_news(): void
    {
        $newsData = [
            'title' => 'Test News',
            'content' => 'Test news content'
        ];

        $response = $this->actingAs($this->admin)
            ->post('/admin/news', $newsData);

        $response->assertRedirect();
        $this->assertDatabaseHas('news', $newsData);
    }


    public function test_student_cannot_access_admin_routes(): void
    {
        $routes = [
            '/admin/programs',
            '/admin/news'
        ];

        foreach ($routes as $route) {
            $response = $this->actingAs($this->student)->get($route);
            $response->assertStatus(403);
        }
    }
}
