<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasTranslations;

class Lesson extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'program_id',
        'level',
        'title',
        'description',
        'title_translations',
        'description_translations',
        'content_body_translations',
        'content_type',
        'content_url',
        'content_body',
        'duration_minutes',
        'order_in_level',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'duration_minutes' => 'integer',
        'level' => 'integer',
        'order_in_level' => 'integer',
        'title_translations' => 'array',
        'description_translations' => 'array',
        'content_body_translations' => 'array',
    ];

    // Relationships
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function resources(): HasMany
    {
        return $this->hasMany(LessonResource::class);
    }

    public function resourcesByLanguage(string $language = null): HasMany
    {
        $language = $language ?? app()->getLocale();
        return $this->hasMany(LessonResource::class)->where('language', $language);
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByLevel($query, int $level)
    {
        return $query->where('level', $level);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('level', 'asc')
            ->orderBy('order_in_level', 'asc');
    }

    public function scopeWithResources($query)
    {
        return $query->with(['resources' => function ($query) {
            $query->orderBy('order');
        }]);
    }

    // Simple accessors
    public function getFormattedDurationAttribute(): string
    {
        if ($this->duration_minutes < 60) {
            return $this->duration_minutes . ' min';
        }

        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;

        return $minutes === 0
            ? $hours . ' hr'
            : $hours . ' hr ' . $minutes . ' min';
    }

    public function getContentTypeDisplayAttribute(): string
    {
        return match ($this->content_type) {
            'video' => 'Video',
            'text' => 'Reading',
            'interactive' => 'Interactive',
            'quiz' => 'Quiz',
            'mixed' => 'Mixed Content',
            default => 'Content'
        };
    }

    // Helper methods for user-specific data
    public function userProgress(User $user): ?LessonProgress
    {
        return $this->progress()->where('user_id', $user->id)->first();
    }

    public function hasUserCompleted(User $user): bool
    {
        $progress = $this->userProgress($user);
        return $progress && $progress->status === 'completed';
    }

    public function hasUserStarted(User $user): bool
    {
        $progress = $this->userProgress($user);
        return $progress && $progress->status !== 'not_started';
    }
    
    // Check if this lesson is unlocked for a user based on level requirements
    public function isUnlockedForUser(User $user): bool
    {
        return $this->program->isLevelUnlockedForUser($user, $this->level);
    }
    
    // Translation accessors
    public function getTranslatedTitleAttribute(): string
    {
        return $this->getTranslatedAttribute('title');
    }
    
    public function getTranslatedDescriptionAttribute(): ?string
    {
        return $this->getTranslatedAttribute('description');
    }
    
    public function getTranslatedContentBodyAttribute(): ?string
    {
        return $this->getTranslatedAttribute('content_body');
    }
}
