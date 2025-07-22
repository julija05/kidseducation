<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'duration',
        'price',
        'image',
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
}
