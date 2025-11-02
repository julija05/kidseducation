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
        if (!Schema::hasTable('resource_proposals')) {
            Schema::create('resource_proposals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lesson_resource_id')->nullable()->constrained('lesson_resources')->onDelete('cascade');
                $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
                $table->foreignId('proposed_by')->constrained('users')->onDelete('cascade');
                $table->enum('proposal_type', ['create', 'update', 'delete'])->default('create');

                // Proposed changes (JSON)
                $table->json('proposed_data')->nullable(); // Stores proposed resource data
                $table->string('proposed_title')->nullable();
                $table->text('proposed_description')->nullable();
                $table->enum('proposed_resource_type', ['youtube', 'pdf', 'word', 'other'])->nullable();
                $table->string('proposed_youtube_url')->nullable();
                $table->string('proposed_file_path')->nullable();
                $table->integer('proposed_order')->nullable();

                // Original data (for reference in updates)
                $table->json('original_data')->nullable();

                // Approval workflow
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->text('mentor_notes')->nullable();
                $table->text('admin_notes')->nullable();
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamp('reviewed_at')->nullable();

                $table->timestamps();

                $table->index(['status', 'lesson_id']);
                $table->index('proposed_by');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('resource_proposals')) {
            Schema::dropIfExists('resource_proposals');
        }
    }
};
