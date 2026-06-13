<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('child_profiles')) {
            Schema::create('child_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('parent_user_id')->constrained('users')->cascadeOnDelete();
                $table->string('child_name', 191);
                $table->unsignedTinyInteger('age')->nullable();
                $table->string('grade_class', 100)->nullable();
                $table->string('status', 50)->default('pending')->index();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('parent_user_id');
                $table->index('created_at');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('child_profiles');
    }
};
