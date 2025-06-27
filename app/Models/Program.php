<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    /** @use HasFactory<\Database\Factories\ProgramFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
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
    protected $attributes = [
        'icon' => 'BookOpen',
        'color' => 'bg-blue-600',
        'lightColor' => 'bg-blue-100',
        'textColor' => 'text-blue-900',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot(['enrolled_at', 'completed_at', 'status', 'progress'])
            ->withTimestamps();
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'student_program');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
