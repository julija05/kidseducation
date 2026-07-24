<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Practice resources are short practice prompts (a written message such as
     * "Practice the Big Friend rule") and/or an attached file (e.g. a PDF),
     * posted by a mentor to one of their learning groups. Every student in that
     * group sees them in their Practice section.
     */
    public function up(): void
    {
        if (! Schema::hasTable('practice_resources')) {
            Schema::create('practice_resources', function (Blueprint $table) {
                $table->id();
                $table->foreignId('learning_group_id')->constrained()->cascadeOnDelete();
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->string('title');
                $table->text('message')->nullable();
                $table->string('file_path')->nullable();
                $table->string('file_name')->nullable();
                $table->unsignedBigInteger('file_size')->nullable();
                $table->string('mime_type', 191)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index(['learning_group_id', 'is_active']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_resources');
    }
};
