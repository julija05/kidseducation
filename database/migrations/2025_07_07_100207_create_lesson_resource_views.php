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
        Schema::create('lesson_resource_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('lesson_resource_id')->constrained()->onDelete('cascade');
            $table->timestamp('viewed_at');
            $table->timestamps();

            // Ensure a user can only have one view record per resource
            $table->unique(['user_id', 'lesson_resource_id']);

            // Add indexes for performance
            $table->index(['user_id', 'viewed_at']);
            $table->index(['lesson_resource_id', 'viewed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_resource_views');
    }
};
