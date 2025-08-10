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
        Schema::table('news', function (Blueprint $table) {
            $table->string('title_en')->nullable()->after('title');
            $table->string('title_mk')->nullable()->after('title_en');
            $table->text('content_en')->nullable()->after('content');
            $table->text('content_mk')->nullable()->after('content_en');
        });

        // Migrate existing data to English fields
        DB::statement("UPDATE news SET title_en = title, content_en = content WHERE title_en IS NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('news', function (Blueprint $table) {
            $table->dropColumn(['title_en', 'title_mk', 'content_en', 'content_mk']);
        });
    }
};