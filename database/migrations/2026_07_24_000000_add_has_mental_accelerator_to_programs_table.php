<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a per-program flag that enables the kid-friendly Mental Accelerator
     * (Flash Anzan) practice tool. Only programs with this flag expose the tool
     * to students; the Mental Arithmetic program uses it.
     */
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            if (! Schema::hasColumn('programs', 'has_mental_accelerator')) {
                $table->boolean('has_mental_accelerator')->default(false)->after('is_active');
            }
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            if (Schema::hasColumn('programs', 'has_mental_accelerator')) {
                $table->dropColumn('has_mental_accelerator');
            }
        });
    }
};
