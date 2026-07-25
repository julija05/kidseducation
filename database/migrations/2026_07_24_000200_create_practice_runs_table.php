<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A practice run records the summary of one completed Mental Accelerator
     * (Flash Anzan) session: which settings the student played and how many of
     * the rounds they answered correctly. Runs are the data source for the
     * practice-related achievement badges (e.g. "Flash Master", "Sharp Shooter").
     */
    public function up(): void
    {
        if (! Schema::hasTable('practice_runs')) {
            Schema::create('practice_runs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                // The program the student was enrolled in when practicing (nullable
                // so a run is never lost if the enrollment/program is later removed).
                $table->foreignId('program_id')->nullable()->constrained()->nullOnDelete();
                // Settings the student chose for the run.
                $table->string('operation', 20);
                $table->unsignedTinyInteger('min_digits');
                $table->unsignedTinyInteger('max_digits');
                $table->decimal('display_time', 4, 2);
                $table->unsignedTinyInteger('numbers_per_round');
                // Outcome of the run.
                $table->unsignedSmallInteger('total_rounds');
                $table->unsignedSmallInteger('correct_rounds');
                $table->timestamps();

                // Achievement queries look runs up per student, newest first.
                $table->index(['user_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_runs');
    }
};
