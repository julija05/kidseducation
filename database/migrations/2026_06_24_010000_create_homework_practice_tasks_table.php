<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('homework_practice_tasks')) {
            Schema::create('homework_practice_tasks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('homework_assignment_id')->constrained('homework_assignments')->onDelete('cascade');
                $table->string('prompt', 191);
                $table->unsignedSmallInteger('order')->default(0);
                $table->timestamps();

                $table->index('homework_assignment_id');
                $table->index('order');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('homework_practice_tasks');
    }
};
