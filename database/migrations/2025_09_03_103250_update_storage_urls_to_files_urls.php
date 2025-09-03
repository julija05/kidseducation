<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update programs table - image column
        if (Schema::hasTable('programs') && Schema::hasColumn('programs', 'image')) {
            DB::table('programs')
                ->where('image', 'like', '/storage/%')
                ->update([
                    'image' => DB::raw("REPLACE(image, '/storage/', '/files/')")
                ]);
        }

        // Update news table - image column
        if (Schema::hasTable('news') && Schema::hasColumn('news', 'image')) {
            DB::table('news')
                ->where('image', 'like', '/storage/%')
                ->update([
                    'image' => DB::raw("REPLACE(image, '/storage/', '/files/')")
                ]);
        }

        // Update users table - avatar_path column
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'avatar_path')) {
            DB::table('users')
                ->where('avatar_path', 'like', '/storage/%')
                ->update([
                    'avatar_path' => DB::raw("REPLACE(avatar_path, '/storage/', '/files/')")
                ]);
        }

        // Update lesson_resources table - resource_url and file_path columns
        if (Schema::hasTable('lesson_resources')) {
            // Update resource_url column
            if (Schema::hasColumn('lesson_resources', 'resource_url')) {
                DB::table('lesson_resources')
                    ->where('resource_url', 'like', '/storage/%')
                    ->update([
                        'resource_url' => DB::raw("REPLACE(resource_url, '/storage/', '/files/')")
                    ]);
            }

            // Update file_path column
            if (Schema::hasColumn('lesson_resources', 'file_path')) {
                DB::table('lesson_resources')
                    ->where('file_path', 'like', '/storage/%')
                    ->update([
                        'file_path' => DB::raw("REPLACE(file_path, '/storage/', '/files/')")
                    ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the URL changes back to /storage/

        // Update programs table
        if (Schema::hasTable('programs') && Schema::hasColumn('programs', 'image')) {
            DB::table('programs')
                ->where('image', 'like', '/files/%')
                ->update([
                    'image' => DB::raw("REPLACE(image, '/files/', '/storage/')")
                ]);
        }

        // Update news table
        if (Schema::hasTable('news') && Schema::hasColumn('news', 'image')) {
            DB::table('news')
                ->where('image', 'like', '/files/%')
                ->update([
                    'image' => DB::raw("REPLACE(image, '/files/', '/storage/')")
                ]);
        }

        // Update users table
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'avatar_path')) {
            DB::table('users')
                ->where('avatar_path', 'like', '/files/%')
                ->update([
                    'avatar_path' => DB::raw("REPLACE(avatar_path, '/files/', '/storage/')")
                ]);
        }

        // Update lesson_resources table
        if (Schema::hasTable('lesson_resources')) {
            // Update resource_url column
            if (Schema::hasColumn('lesson_resources', 'resource_url')) {
                DB::table('lesson_resources')
                    ->where('resource_url', 'like', '/files/%')
                    ->update([
                        'resource_url' => DB::raw("REPLACE(resource_url, '/files/', '/storage/')")
                    ]);
            }

            // Update file_path column
            if (Schema::hasColumn('lesson_resources', 'file_path')) {
                DB::table('lesson_resources')
                    ->where('file_path', 'like', '/files/%')
                    ->update([
                        'file_path' => DB::raw("REPLACE(file_path, '/files/', '/storage/')")
                    ]);
            }
        }
    }
};
