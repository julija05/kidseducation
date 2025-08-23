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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->integer('level')->default(1);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('content_type')->default('video'); // video, text, interactive, quiz
            $table->text('content_url')->nullable(); // URL to video, document, etc.
            $table->text('content_body')->nullable(); // Text content for text lessons
            $table->integer('duration_minutes')->default(30);
            $table->integer('order_in_level')->default(1);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable(); // Additional lesson data
            $table->timestamps();

            // Indexes
            $table->index(['program_id', 'level', 'order_in_level']);
            $table->index(['program_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
