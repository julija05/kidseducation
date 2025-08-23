<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, add the new columns if they don't exist
        if (! Schema::hasColumn('users', 'first_name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('first_name')->nullable()->after('name');
                $table->string('last_name')->nullable()->after('first_name');
                $table->text('address')->nullable()->after('email');
            });
        }

        // Now migrate existing user data
        $users = DB::table('users')->whereNull('first_name')->get();

        foreach ($users as $user) {
            $nameParts = explode(' ', trim($user->name), 2);
            $firstName = $nameParts[0] ?? '';
            $lastName = $nameParts[1] ?? '';

            // If there's only one part, use it as first name
            if (empty($lastName) && ! empty($firstName)) {
                $lastName = 'User'; // Default last name
            }

            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'address']);
        });
    }
};
