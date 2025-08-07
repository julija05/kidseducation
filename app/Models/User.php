<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Notifications\CustomVerifyEmail;
use App\Notifications\CustomResetPassword;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */

    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'address',
        'language_preference',
        'language_selected',
        'theme_preference',
        'avatar_preference',
        'avatar_path',
        'avatar_type',
        'avatar_value',
        'is_demo_account',
        'demo_created_at',
        'demo_expires_at',
        'demo_program_slug',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'language_selected' => 'boolean',
            'is_demo_account' => 'boolean',
            'demo_created_at' => 'datetime',
            'demo_expires_at' => 'datetime',
        ];
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class, 'enrollments')
            ->withPivot(['enrolled_at', 'completed_at', 'status', 'progress'])
            ->withTimestamps();
    }

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function scheduledClasses(): HasMany
    {
        return $this->hasMany(ClassSchedule::class, 'student_id');
    }

    public function teachingClasses(): HasMany
    {
        return $this->hasMany(ClassSchedule::class, 'admin_id');
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function getActiveProgram()
    {
        return $this->programs()
            ->wherePivot('status', 'active')
            ->first();
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail);
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }

    /**
     * Check if user has demo access (active demo period)
     */
    public function hasDemoAccess(): bool
    {
        return $this->demo_created_at && 
               $this->demo_expires_at && 
               $this->demo_expires_at->isFuture();
    }

    /**
     * Check if demo access has expired
     */
    public function isDemoExpired(): bool
    {
        return $this->demo_created_at && 
               $this->demo_expires_at && 
               $this->demo_expires_at->isPast();
    }

    /**
     * Check if user can start demo (hasn't used demo yet)
     */
    public function canStartDemo(): bool
    {
        // If user has never had demo access, they can start
        return !$this->demo_created_at;
    }

    /**
     * Start demo access for a program
     */
    public function startDemo(string $programSlug): void
    {
        $this->update([
            'is_demo_account' => false, // Keep as false since this is regular user with demo access
            'demo_created_at' => now(),
            'demo_expires_at' => now()->addDays(7),
            'demo_program_slug' => $programSlug,
        ]);
    }

    /**
     * Get the demo program if user has demo access
     */
    public function getDemoProgram()
    {
        if (!$this->hasDemoAccess() || !$this->demo_program_slug) {
            return null;
        }

        return Program::where('slug', $this->demo_program_slug)->first();
    }

    /**
     * Check if user can access a specific lesson in demo mode
     */
    public function canAccessLessonInDemo($lesson): bool
    {
        if (!$this->hasDemoAccess()) {
            return false;
        }

        $demoProgram = $this->getDemoProgram();
        if (!$demoProgram || $lesson->program_id !== $demoProgram->id) {
            return false;
        }

        // Only allow access to the first lesson (level 1, order_in_level 1)
        return $lesson->level === 1 && $lesson->order_in_level === 1;
    }

    /**
     * Get days remaining in demo
     */
    public function getDemoRemainingDays(): int
    {
        if (!$this->hasDemoAccess()) {
            return 0;
        }

        return now()->diffInDays($this->demo_expires_at, false);
    }

    /**
     * Scope for users with active demo access
     */
    public function scopeWithActiveDemoAccess($query)
    {
        return $query->whereNotNull('demo_created_at')
                    ->where('demo_expires_at', '>', now());
    }

    /**
     * Check if this is a demo account
     */
    public function isDemoAccount(): bool
    {
        return $this->is_demo_account || $this->hasDemoAccess();
    }

    /**
     * Scope for users with expired demo access
     */
    public function scopeWithExpiredDemoAccess($query)
    {
        return $query->whereNotNull('demo_created_at')
                    ->where('demo_expires_at', '<', now());
    }
}
