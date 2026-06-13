<?php

namespace Tests\Feature\Parent;

use App\Models\ChildProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class ChildProfileTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createRoles();
    }

    public function test_parent_can_create_child_profile_without_child_login(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');

        $response = $this->actingAs($parent)->post('/parent/child-profiles', [
            'child_name' => 'Ada Student',
            'age' => 9,
            'grade_class' => '3A',
            'notes' => 'Interested in math.',
        ]);

        $response->assertRedirect(route('parent.dashboard', absolute: false));

        $this->assertDatabaseHas('child_profiles', [
            'parent_user_id' => $parent->id,
            'child_name' => 'Ada Student',
            'age' => 9,
            'grade_class' => '3A',
            'status' => 'pending',
            'notes' => 'Interested in math.',
        ]);

        $this->assertDatabaseMissing('users', [
            'name' => 'Ada Student',
        ]);
    }

    public function test_parent_dashboard_shows_own_child_profiles_only(): void
    {
        $parent = User::factory()->create();
        $parent->assignRole('parent');

        $otherParent = User::factory()->create();
        $otherParent->assignRole('parent');

        $ownProfile = ChildProfile::factory()->create([
            'parent_user_id' => $parent->id,
            'child_name' => 'Own Child',
        ]);

        ChildProfile::factory()->create([
            'parent_user_id' => $otherParent->id,
            'child_name' => 'Other Child',
        ]);

        $response = $this->actingAs($parent)->get('/parent/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Parent/Dashboard')
            ->has('childProfiles', 1)
            ->where('childProfiles.0.id', $ownProfile->id)
            ->where('childProfiles.0.child_name', 'Own Child')
        );
    }
}
