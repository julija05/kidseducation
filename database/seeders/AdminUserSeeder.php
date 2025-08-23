<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role if it doesn't exist
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        // Create student role if it doesn't exist
        Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);

        // Create admin user if it doesn't exist
        $admin = User::firstOrCreate(
            ['email' => 'admin@abacoding.com'],
            [
                'name' => 'Abacoding Admin',
                'password' => Hash::make('Abacoding2024!@#'),
                'email_verified_at' => now(),
            ]
        );

        $admin->assignRole('admin');
    }
}
