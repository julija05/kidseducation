<?php

namespace Tests\Feature\Admin;

use App\Models\ChildProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class AdminChildProfileTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createRoles();

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    public function test_admin_can_see_child_profiles(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');

        $profile = ChildProfile::factory()->create([
            'parent_user_id' => $parent->id,
            'child_name' => 'Visible Child',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/child-profiles');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/ChildProfiles/Index')
            ->where('childProfiles.data.0.id', $profile->id)
            ->where('childProfiles.data.0.child_name', 'Visible Child')
            ->where('childProfiles.data.0.parent.id', $parent->id)
        );
    }

    public function test_admin_can_open_child_profile_detail(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');

        $profile = ChildProfile::factory()->create([
            'parent_user_id' => $parent->id,
            'child_name' => 'Detail Child',
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/child-profiles/{$profile->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/ChildProfiles/Show')
            ->where('childProfile.id', $profile->id)
            ->where('childProfile.child_name', 'Detail Child')
            ->where('childProfile.parent.id', $parent->id)
        );
    }
}
