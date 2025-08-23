<?php

namespace Tests\Traits;

use Spatie\Permission\Models\Role;

trait CreatesRoles
{
    /**
     * Create roles safely, avoiding duplicates
     */
    protected function createRoles(): void
    {
        // Create student role if it doesn't exist
        if (! Role::where('name', 'student')->where('guard_name', 'web')->exists()) {
            Role::create(['name' => 'student', 'guard_name' => 'web']);
        }

        // Create admin role if it doesn't exist
        if (! Role::where('name', 'admin')->where('guard_name', 'web')->exists()) {
            Role::create(['name' => 'admin', 'guard_name' => 'web']);
        }
    }

    /**
     * Get or create a role safely
     */
    protected function getOrCreateRole(string $name, string $guard = 'web'): Role
    {
        return Role::firstOrCreate([
            'name' => $name,
            'guard_name' => $guard,
        ]);
    }
}
