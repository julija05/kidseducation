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
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
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
}
