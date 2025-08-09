<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use App\Traits\HasTranslations;

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
        'slug',
        'icon',
        'color',
        'light_color',
        'border_color',
        'text_color',
        'duration_weeks',
        'is_active',
        'level_requirements',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'level_requirements' => 'array',
        'name_translations' => 'array',
        'description_translations' => 'array',
    ];

    protected $attributes = [
        'icon' => 'BookOpen',
        'color' => 'bg-blue-600',
        'light_color' => 'bg-blue-100',
        'text_color' => 'text-blue-900',
    ];

    // Relationships
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
            
        if (!$enrollment) {
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
