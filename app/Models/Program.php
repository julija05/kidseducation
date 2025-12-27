<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Program extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'description',
        'name_translations',
        'description_translations',
        'duration',
        'price',
        'requires_monthly_payment',
        'slug',
        'icon',
        'color',
        'light_color',
        'border_color',
        'text_color',
        'duration_weeks',
        'is_active',
        'level_requirements',
        'approval_status',
        'proposed_by',
        'approved_by',
        'approved_at',
        'rejected_at',
        'rejection_reason',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'requires_monthly_payment' => 'boolean',
        'is_active' => 'boolean',
        'level_requirements' => 'array',
        'name_translations' => 'array',
        'description_translations' => 'array',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    protected $attributes = [
        'icon' => 'BookOpen',
        'color' => 'bg-blue-600',
        'light_color' => 'bg-blue-100',
        'text_color' => 'text-blue-900',
    ];

    // Relationships
    /**
     * Get the user who proposed this program (mentor)
     */
    public function proposedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proposed_by');
    }

    /**
     * Get the user who approved/rejected this program (admin)
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot(['enrolled_at', 'completed_at', 'status', 'progress', 'approval_status'])
            ->withTimestamps();
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class);
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function approvedReviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable')->approved();
    }

    // Review-related methods
    public function getAverageRatingAttribute(): float
    {
        return $this->approvedReviews()->avg('rating') ?? 0;
    }

    public function getTotalReviewsCountAttribute(): int
    {
        return $this->approvedReviews()->count();
    }

    public function getTopReviewsAttribute()
    {
        return $this->approvedReviews()
            ->with('user')
            ->orderBy('rating', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get only approved programs (fully approved and public)
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', \App\Constants\ApprovalStatus::APPROVED);
    }

    /**
     * Scope to get only pending programs (legacy)
     */
    public function scopePending($query)
    {
        return $query->where('approval_status', \App\Constants\ApprovalStatus::PENDING);
    }

    /**
     * Scope to get programs pending initial review
     */
    public function scopePendingInitialReview($query)
    {
        return $query->where('approval_status', \App\Constants\ApprovalStatus::PENDING_INITIAL_REVIEW);
    }

    /**
     * Scope to get programs in content development stage
     */
    public function scopeContentDevelopment($query)
    {
        return $query->where('approval_status', \App\Constants\ApprovalStatus::CONTENT_DEVELOPMENT);
    }

    /**
     * Scope to get programs pending final review
     */
    public function scopePendingFinalReview($query)
    {
        return $query->where('approval_status', \App\Constants\ApprovalStatus::PENDING_FINAL_REVIEW);
    }

    /**
     * Scope to get only rejected programs
     */
    public function scopeRejected($query)
    {
        return $query->where('approval_status', \App\Constants\ApprovalStatus::REJECTED);
    }

    /**
     * Scope to get programs proposed by a specific mentor
     */
    public function scopeProposedBy($query, $userId)
    {
        return $query->where('proposed_by', $userId);
    }

    /**
     * Scope to get programs needing admin review (both initial and final)
     */
    public function scopeNeedingReview($query)
    {
        return $query->whereIn('approval_status', [
            \App\Constants\ApprovalStatus::PENDING_INITIAL_REVIEW,
            \App\Constants\ApprovalStatus::PENDING_FINAL_REVIEW,
        ]);
    }

    /**
     * Check if the program can be resubmitted (only rejected programs)
     */
    public function canResubmit(): bool
    {
        return $this->isRejected();
    }

    // Approval status checks
    /**
     * Check if the program is fully approved and public
     */
    public function isApproved(): bool
    {
        return $this->approval_status === \App\Constants\ApprovalStatus::APPROVED;
    }

    /**
     * Check if the program is pending initial review
     */
    public function isPendingInitialReview(): bool
    {
        return $this->approval_status === \App\Constants\ApprovalStatus::PENDING_INITIAL_REVIEW;
    }

    /**
     * Check if the program is in content development stage
     */
    public function isInContentDevelopment(): bool
    {
        return $this->approval_status === \App\Constants\ApprovalStatus::CONTENT_DEVELOPMENT;
    }

    /**
     * Check if the program is pending final review
     */
    public function isPendingFinalReview(): bool
    {
        return $this->approval_status === \App\Constants\ApprovalStatus::PENDING_FINAL_REVIEW;
    }

    /**
     * Check if the program is pending approval (legacy or any pending state)
     */
    public function isPending(): bool
    {
        return in_array($this->approval_status, [
            \App\Constants\ApprovalStatus::PENDING,
            \App\Constants\ApprovalStatus::PENDING_INITIAL_REVIEW,
            \App\Constants\ApprovalStatus::PENDING_FINAL_REVIEW,
        ]);
    }

    /**
     * Check if the program is rejected
     */
    public function isRejected(): bool
    {
        return $this->approval_status === \App\Constants\ApprovalStatus::REJECTED;
    }

    /**
     * Check if the program was proposed by a mentor
     */
    public function isProposedByMentor(): bool
    {
        return $this->proposed_by !== null;
    }

    /**
     * Check if mentor can add content to this program
     */
    public function canAddContent(): bool
    {
        return $this->approval_status === \App\Constants\ApprovalStatus::CONTENT_DEVELOPMENT;
    }

    /**
     * Check if the program needs admin review
     */
    public function needsReview(): bool
    {
        return in_array($this->approval_status, [
            \App\Constants\ApprovalStatus::PENDING_INITIAL_REVIEW,
            \App\Constants\ApprovalStatus::PENDING_FINAL_REVIEW,
        ]);
    }

    // Route key
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // Basic accessors
    public function getThemeDataAttribute(): array
    {
        return [
            'icon' => $this->icon,
            'color' => $this->color,
            'lightColor' => $this->light_color,
            'borderColor' => $this->border_color,
            'textColor' => $this->text_color,
        ];
    }

    // Check if a level is unlocked for a user
    public function isLevelUnlockedForUser(User $user, int $level): bool
    {
        $enrollment = $user->enrollments()
            ->where('program_id', $this->id)
            ->where('approval_status', 'approved')
            ->first();

        if (! $enrollment) {
            return false;
        }

        return $enrollment->isLevelUnlocked($level);
    }

    // Get default level requirements if not set
    public function getDefaultLevelRequirements(): array
    {
        return [
            '1' => 0,    // Level 1 - always unlocked
            '2' => 10,   // Level 2 - need 10 points
            '3' => 25,   // Level 3 - need 25 points
            '4' => 50,   // Level 4 - need 50 points
            '5' => 100,  // Level 5 - need 100 points
        ];
    }

    // Get effective level requirements (use custom or default)
    public function getEffectiveLevelRequirements(): array
    {
        return $this->level_requirements ?? $this->getDefaultLevelRequirements();
    }

    // Get total lessons count for this program
    public function getTotalLessonsCount(): int
    {
        return $this->lessons()->count();
    }

    // Translation accessors
    public function getTranslatedNameAttribute(): string
    {
        return $this->getTranslatedAttribute('name');
    }

    public function getTranslatedDescriptionAttribute(): string
    {
        return $this->getTranslatedAttribute('description');
    }
}
