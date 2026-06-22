<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('learning_groups')) {
            Schema::create('learning_groups', function (Blueprint $table) {
                $table->id();
                $table->string('name', 191);
                $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
                $table->foreignId('mentor_id')->constrained('users')->onDelete('cascade');
                $table->date('start_date');
                $table->date('end_date');
                $table->string('status', 50)->default('draft');
                $table->unsignedInteger('max_students')->default(10);
                $table->text('description')->nullable();
                $table->timestamps();

                $table->index('program_id');
                $table->index('mentor_id');
                $table->index('status');
                $table->index(['start_date', 'end_date']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_groups');
    }
};
