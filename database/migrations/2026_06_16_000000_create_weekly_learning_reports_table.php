<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('weekly_learning_reports')) {
            Schema::create('weekly_learning_reports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('child_user_id')->nullable()->constrained('users')->onDelete('cascade');
                $table->foreignId('class_schedule_id')->nullable()->constrained()->onDelete('cascade');
                $table->foreignId('program_id')->nullable()->constrained()->onDelete('set null');
                $table->unsignedSmallInteger('week_number');
                $table->date('week_start_date')->nullable();
                $table->date('week_end_date')->nullable();
                $table->string('group_name', 191)->nullable();
                $table->text('what_we_learned');
                $table->text('what_to_practice');
                $table->text('next_focus');
                $table->text('individual_child_note')->nullable();
                $table->timestamp('published_at')->nullable();
                $table->timestamps();

                $table->index(['child_user_id', 'published_at']);
                $table->index(['class_schedule_id', 'published_at']);
                $table->index(['program_id', 'week_number']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_learning_reports');
    }
};
