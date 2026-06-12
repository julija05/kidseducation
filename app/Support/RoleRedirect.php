<?php

namespace App\Support;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RoleRedirect
{
    public static function routeNameFor(User $user): string
    {
        self::assignParentRoleWhenMissing($user);

        if ($user->hasRole('admin')) {
            return 'admin.dashboard';
        }

        if ($user->hasRole('mentor')) {
            return 'mentor.dashboard';
        }

        if ($user->hasRole('parent')) {
            return 'parent.dashboard';
        }

        return 'dashboard';
    }

    private static function assignParentRoleWhenMissing(User $user): void
    {
        if ($user->roles()->exists()) {
            return;
        }

        $parentRole = Role::firstOrCreate(['name' => 'parent', 'guard_name' => 'web']);
        $user->assignRole($parentRole);
        $user->load('roles');
    }
}
