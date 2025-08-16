<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for kids' security features
     */
    public function up(): void
    {
        // Parental Controls table
        Schema::create('parental_controls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('parent_email')->nullable();
            $table->string('parent_name')->nullable();
            $table->json('time_restrictions')->nullable();
            $table->json('content_filters')->nullable();
            $table->boolean('activity_monitoring')->default(true);
            $table->enum('report_frequency', ['daily', 'weekly', 'monthly'])->default('weekly');
            $table->string('emergency_contact')->nullable();
            $table->json('allowed_features')->nullable();
            $table->json('blocked_features')->nullable();
            $table->integer('daily_time_limit')->nullable(); // minutes
            $table->integer('weekly_time_limit')->nullable(); // minutes
            $table->json('bedtime_restriction')->nullable();
            $table->json('weekend_restrictions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('last_updated_by')->nullable();
            $table->timestamps();
            
            $table->index(['student_id', 'is_active']);
        });

        // Student Activities tracking table
        Schema::create('student_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('activity_type');
            $table->json('activity_data')->nullable();
            $table->ipAddress('ip_address');
            $table->text('user_agent')->nullable();
            $table->string('session_id');
            $table->timestamp('timestamp');
            $table->date('date');
            $table->time('time');
            $table->timestamps();
            
            $table->index(['student_id', 'date']);
            $table->index(['student_id', 'activity_type']);
            $table->index(['student_id', 'timestamp']);
        });

        // Daily Usage Tracking table
        Schema::create('daily_usage_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->integer('total_minutes')->default(0);
            $table->timestamp('first_activity')->nullable();
            $table->timestamp('last_activity')->nullable();
            $table->integer('session_count')->default(0);
            $table->json('activity_breakdown')->nullable();
            $table->timestamps();
            
            $table->unique(['student_id', 'date']);
            $table->index(['student_id', 'date']);
        });

        // Security Logs table
        Schema::create('security_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('event_type');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->json('event_data');
            $table->ipAddress('ip_address');
            $table->text('user_agent')->nullable();
            $table->string('session_id')->nullable();
            $table->boolean('resolved')->default(false);
            $table->text('resolution_notes')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            $table->index(['student_id', 'event_type']);
            $table->index(['severity', 'resolved']);
            $table->index(['created_at']);
        });

        // Content Moderation Logs table
        Schema::create('content_moderation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('content_type'); // 'text', 'image', 'video', etc.
            $table->text('content_preview')->nullable(); // First 200 chars
            $table->string('content_hash'); // For duplicate detection
            $table->json('violations');
            $table->enum('severity', ['safe', 'warning', 'danger', 'blocked'])->default('safe');
            $table->boolean('allowed')->default(true);
            $table->boolean('requires_review')->default(false);
            $table->boolean('reviewed')->default(false);
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->json('moderation_details')->nullable();
            $table->timestamps();
            
            $table->index(['student_id', 'severity']);
            $table->index(['requires_review', 'reviewed']);
            $table->index(['content_hash']);
        });

        // Privacy Events Log table
        Schema::create('privacy_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('privacy_safe_id'); // Hashed user ID for privacy
            $table->string('event_type');
            $table->json('event_details')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('compliance_event')->default(false);
            $table->string('legal_basis')->nullable(); // GDPR legal basis
            $table->timestamp('retention_until')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'event_type']);
            $table->index(['privacy_safe_id']);
            $table->index(['compliance_event']);
            $table->index(['retention_until']);
        });

        // Parental Reports table
        Schema::create('parental_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('report_type'); // 'daily', 'weekly', 'monthly', 'incident'
            $table->date('report_period_start');
            $table->date('report_period_end');
            $table->json('report_data');
            $table->string('parent_email');
            $table->boolean('sent')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->string('delivery_status')->nullable();
            $table->text('delivery_error')->nullable();
            $table->timestamps();
            
            $table->index(['student_id', 'report_type']);
            $table->index(['sent', 'sent_at']);
        });

        // Blocked Content table
        Schema::create('blocked_content', function (Blueprint $table) {
            $table->id();
            $table->string('content_type'); // 'word', 'phrase', 'url', 'pattern'
            $table->text('content_value');
            $table->string('block_reason');
            $table->enum('severity', ['low', 'medium', 'high'])->default('medium');
            $table->boolean('is_active')->default(true);
            $table->string('category')->nullable(); // 'personal_info', 'inappropriate', 'contact', etc.
            $table->unsignedBigInteger('added_by')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['content_type', 'is_active']);
            $table->index(['category', 'severity']);
        });

        // Session Security table
        Schema::create('session_security', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('session_id');
            $table->ipAddress('ip_address');
            $table->text('user_agent');
            $table->timestamp('session_start');
            $table->timestamp('last_activity');
            $table->boolean('is_active')->default(true);
            $table->enum('termination_reason', ['logout', 'timeout', 'security', 'admin'])->nullable();
            $table->json('security_flags')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_active']);
            $table->index(['session_id']);
            $table->index(['ip_address']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_security');
        Schema::dropIfExists('blocked_content');
        Schema::dropIfExists('parental_reports');
        Schema::dropIfExists('privacy_events');
        Schema::dropIfExists('content_moderation_logs');
        Schema::dropIfExists('security_logs');
        Schema::dropIfExists('daily_usage_tracking');
        Schema::dropIfExists('student_activities');
        Schema::dropIfExists('parental_controls');
    }
};