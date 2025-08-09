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
        // Check if table already exists to prevent duplicate creation
        if (Schema::hasTable('reviews')) {
            return;
        }

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('reviewable'); // reviewable_type and reviewable_id for polymorphic relationship
            $table->tinyInteger('rating')->unsigned()->comment('Rating from 1 to 5');
            $table->text('comment')->nullable();
            $table->boolean('is_approved')->default(true); // Auto-approve for now, can be moderated later
            $table->timestamps();

            // Indexes for better query performance
            // Note: morphs() already creates an index for reviewable_type and reviewable_id
            $table->index('rating');
            $table->index('is_approved');
            $table->index('created_at');

            // Ensure one review per user per reviewable entity
            $table->unique(['user_id', 'reviewable_type', 'reviewable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};