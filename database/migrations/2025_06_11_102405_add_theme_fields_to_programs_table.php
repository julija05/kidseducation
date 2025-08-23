<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            // Add slug for URL-friendly names
            $table->string('slug')->after('name');

            // Add theme/styling fields - use a column that definitely exists
            $table->string('icon')->default('BookOpen')->after('price');
            $table->string('color')->default('bg-blue-500')->after('icon');
            $table->string('light_color')->default('bg-blue-50')->after('color');
            $table->string('border_color')->default('border-blue-500')->after('light_color');
            $table->string('text_color')->default('text-blue-700')->after('border_color');

            // Add duration in weeks (keeping original duration field for backward compatibility)
            $table->integer('duration_weeks')->nullable()->after('text_color');

            // Add active status
            $table->boolean('is_active')->default(true)->after('duration_weeks');

            // Add indexes for better performance
            $table->index('slug');
            $table->index('is_active');
        });

        // Generate slugs for existing programs
        $this->generateSlugsForExistingPrograms();

        // Convert duration string to duration_weeks if possible
        $this->convertDurationToWeeks();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropIndex(['is_active']);

            $table->dropColumn([
                'slug',
                'icon',
                'color',
                'light_color',
                'border_color',
                'text_color',
                'duration_weeks',
                'is_active',
            ]);
        });
    }

    /**
     * Generate slugs for existing programs
     */
    private function generateSlugsForExistingPrograms()
    {
        $programs = DB::table('programs')->get();

        foreach ($programs as $program) {
            $slug = Str::slug($program->name);

            // Ensure slug is unique
            $originalSlug = $slug;
            $count = 1;

            while (DB::table('programs')->where('slug', $slug)->where('id', '!=', $program->id)->exists()) {
                $slug = $originalSlug.'-'.$count;
                $count++;
            }

            DB::table('programs')
                ->where('id', $program->id)
                ->update(['slug' => $slug]);
        }
    }

    /**
     * Convert duration string to weeks if possible
     */
    private function convertDurationToWeeks()
    {
        $programs = DB::table('programs')->get();

        foreach ($programs as $program) {
            $weeks = null;

            // Try to extract weeks from duration string
            // Examples: "24 weeks", "6 months", "1 year"
            if (preg_match('/(\d+)\s*weeks?/i', $program->duration, $matches)) {
                $weeks = (int) $matches[1];
            } elseif (preg_match('/(\d+)\s*months?/i', $program->duration, $matches)) {
                $weeks = (int) $matches[1] * 4; // Approximate
            } elseif (preg_match('/(\d+)\s*years?/i', $program->duration, $matches)) {
                $weeks = (int) $matches[1] * 52;
            }

            if ($weeks !== null) {
                DB::table('programs')
                    ->where('id', $program->id)
                    ->update(['duration_weeks' => $weeks]);
            }
        }
    }
};
