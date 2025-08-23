<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);

        // Create permissions (you can add more as needed)
        $permissions = [
            'manage-users',
            'manage-programs',
            'manage-lessons',
            'manage-enrollments',
            'manage-news',
            'access-admin-panel',
            'view-analytics',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Assign permissions to admin role
        $adminRole->givePermissionTo($permissions);

        // Students don't need special permissions beyond basic access
        echo "Roles and permissions created successfully!\n";
    }
}
