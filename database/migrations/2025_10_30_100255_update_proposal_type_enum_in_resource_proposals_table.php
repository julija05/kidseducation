<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Change proposal_type and status from ENUM to VARCHAR to support new values
     */
    public function up(): void
    {
        // Change ENUM to VARCHAR to support all proposal types (resource, lesson, level)
        // Using raw SQL because Laravel has issues modifying ENUMs
        \DB::statement("ALTER TABLE resource_proposals MODIFY COLUMN proposal_type VARCHAR(50) NOT NULL DEFAULT 'resource_create'");

        // Change status ENUM to VARCHAR to support 'applied' status
        \DB::statement("ALTER TABLE resource_proposals MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     * Restore original ENUM values
     */
    public function down(): void
    {
        // Restore original ENUMs (only if you need to rollback)
        \DB::statement("ALTER TABLE resource_proposals MODIFY COLUMN proposal_type ENUM('create', 'update', 'delete') NOT NULL DEFAULT 'create'");
        \DB::statement("ALTER TABLE resource_proposals MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
    }
};
