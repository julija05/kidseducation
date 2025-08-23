<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('lesson_resources')) {
            Schema::create('lesson_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['video', 'document', 'link', 'download', 'interactive', 'quiz']);
            $table->string('resource_url')->nullable(); // YouTube URL, file URL, external link
            $table->string('file_path')->nullable(); // Local file storage path
            $table->string('file_name')->nullable(); // Original file name
            $table->string('file_size')->nullable(); // File size in bytes
            $table->string('mime_type')->nullable(); // File MIME type
            $table->integer('order')->default(1); // Order within the lesson
            $table->boolean('is_downloadable')->default(false);
            $table->boolean('is_required')->default(true); // Required for lesson completion
            $table->json('metadata')->nullable(); // Additional resource-specific data
            $table->timestamps();

            // Indexes
            $table->index(['lesson_id', 'order']);
            $table->index(['lesson_id', 'type']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_resources');
    }
};
