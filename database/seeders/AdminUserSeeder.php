<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user if it doesn't exist
        $admin = User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@abacoding.com')],
            [
                'name' => env('ADMIN_NAME', 'Abacoding Admin'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'defaultpassword123')),
                'email_verified_at' => now(),
            ]
        );

        $admin->assignRole('admin');
    }
}
