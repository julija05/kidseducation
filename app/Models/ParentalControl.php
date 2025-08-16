<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentalControl extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'parent_email',
        'parent_name',
        'time_restrictions',
        'content_filters',
        'activity_monitoring',
        'report_frequency',
        'emergency_contact',
        'allowed_features',
        'blocked_features',
        'daily_time_limit',
        'weekly_time_limit',
        'bedtime_restriction',
        'weekend_restrictions',
        'is_active',
        'last_updated_by',
    ];

    protected $casts = [
        'time_restrictions' => 'array',
        'content_filters' => 'array', 
        'activity_monitoring' => 'boolean',
        'allowed_features' => 'array',
        'blocked_features' => 'array',
        'bedtime_restriction' => 'array',
        'weekend_restrictions' => 'array',
        'is_active' => 'boolean',
        'daily_time_limit' => 'integer', // minutes
        'weekly_time_limit' => 'integer', // minutes
    ];

    /**
     * Get the student that owns the parental controls
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Check if student can access the platform at current time
     */
    public function canAccessNow(): bool
    {
        if (!$this->is_active) {
            return true;
        }

        $now = now();
        $currentTime = $now->format('H:i');
        $currentDay = strtolower($now->format('l'));

        // Check bedtime restrictions
        if ($this->bedtime_restriction && isset($this->bedtime_restriction['enabled']) && $this->bedtime_restriction['enabled']) {
            $bedtime = $this->bedtime_restriction['bedtime'] ?? '21:00';
            $waketime = $this->bedtime_restriction['waketime'] ?? '07:00';
            
            if ($this->isTimeBetween($currentTime, $bedtime, $waketime)) {
                return false;
            }
        }

        // Check daily time restrictions
        if ($this->time_restrictions && isset($this->time_restrictions[$currentDay])) {
            $dayRestrictions = $this->time_restrictions[$currentDay];
            
            if (isset($dayRestrictions['blocked']) && $dayRestrictions['blocked']) {
                return false;
            }
            
            if (isset($dayRestrictions['start_time']) && isset($dayRestrictions['end_time'])) {
                $startTime = $dayRestrictions['start_time'];
                $endTime = $dayRestrictions['end_time'];
                
                if (!$this->isTimeBetween($currentTime, $startTime, $endTime)) {
                    return false;
                }
            }
        }

        // Check if daily time limit has been exceeded
        if ($this->daily_time_limit && $this->daily_time_limit > 0) {
            $todayUsage = $this->getTodayUsageMinutes();
            if ($todayUsage >= $this->daily_time_limit) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if a feature is allowed
     */
    public function isFeatureAllowed(string $feature): bool
    {
        if (!$this->is_active) {
            return true;
        }

        // If blocked features list exists and contains the feature, block it
        if ($this->blocked_features && in_array($feature, $this->blocked_features)) {
            return false;
        }

        // If allowed features list exists and doesn't contain the feature, block it
        if ($this->allowed_features && !in_array($feature, $this->allowed_features)) {
            return false;
        }

        return true;
    }

    /**
     * Get remaining daily time in minutes
     */
    public function getRemainingDailyTime(): int
    {
        if (!$this->daily_time_limit || $this->daily_time_limit <= 0) {
            return -1; // Unlimited
        }

        $usedTime = $this->getTodayUsageMinutes();
        $remaining = $this->daily_time_limit - $usedTime;
        
        return max(0, $remaining);
    }

    /**
     * Check if content passes parental filters
     */
    public function passesContentFilter(string $content): bool
    {
        if (!$this->is_active || !$this->content_filters) {
            return true;
        }

        $filters = $this->content_filters;

        // Check strictness level
        $strictness = $filters['strictness'] ?? 'medium';
        
        switch ($strictness) {
            case 'strict':
                return $this->applyStrictFilters($content);
            case 'medium':
                return $this->applyMediumFilters($content);
            case 'relaxed':
                return $this->applyRelaxedFilters($content);
            default:
                return true;
        }
    }

    /**
     * Get today's usage in minutes
     */
    private function getTodayUsageMinutes(): int
    {
        // This would typically query an activity tracking table
        // For now, return a placeholder
        return 0; // TODO: Implement activity tracking
    }

    /**
     * Check if current time is between start and end times
     */
    private function isTimeBetween(string $currentTime, string $startTime, string $endTime): bool
    {
        $current = strtotime($currentTime);
        $start = strtotime($startTime);
        $end = strtotime($endTime);

        // Handle overnight restrictions (e.g., 21:00 to 07:00)
        if ($start > $end) {
            return $current >= $start || $current <= $end;
        }

        return $current >= $start && $current <= $end;
    }

    /**
     * Apply strict content filters
     */
    private function applyStrictFilters(string $content): bool
    {
        $prohibitedWords = [
            'contact', 'meet', 'phone', 'address', 'email', 'social media',
            'facebook', 'instagram', 'snapchat', 'discord', 'whatsapp'
        ];

        $contentLower = strtolower($content);
        
        foreach ($prohibitedWords as $word) {
            if (strpos($contentLower, $word) !== false) {
                return false;
            }
        }

        return true;
    }

    /**
     * Apply medium content filters
     */
    private function applyMediumFilters(string $content): bool
    {
        $prohibitedWords = [
            'meet', 'phone', 'address', 'secret', 'private'
        ];

        $contentLower = strtolower($content);
        
        foreach ($prohibitedWords as $word) {
            if (strpos($contentLower, $word) !== false) {
                return false;
            }
        }

        return true;
    }

    /**
     * Apply relaxed content filters
     */
    private function applyRelaxedFilters(string $content): bool
    {
        $prohibitedWords = [
            'meet', 'secret', 'private'
        ];

        $contentLower = strtolower($content);
        
        foreach ($prohibitedWords as $word) {
            if (strpos($contentLower, $word) !== false) {
                return false;
            }
        }

        return true;
    }

    /**
     * Default parental control settings for new students
     */
    public static function getDefaultSettings(): array
    {
        return [
            'time_restrictions' => [
                'monday' => ['start_time' => '15:00', 'end_time' => '20:00'],
                'tuesday' => ['start_time' => '15:00', 'end_time' => '20:00'],
                'wednesday' => ['start_time' => '15:00', 'end_time' => '20:00'],
                'thursday' => ['start_time' => '15:00', 'end_time' => '20:00'],
                'friday' => ['start_time' => '15:00', 'end_time' => '21:00'],
                'saturday' => ['start_time' => '09:00', 'end_time' => '21:00'],
                'sunday' => ['start_time' => '09:00', 'end_time' => '20:00'],
            ],
            'content_filters' => [
                'strictness' => 'medium',
                'block_external_links' => true,
                'block_user_uploads' => false,
                'moderate_all_content' => true,
            ],
            'activity_monitoring' => true,
            'report_frequency' => 'weekly',
            'allowed_features' => [
                'lessons', 'quizzes', 'progress_tracking', 'certificates'
            ],
            'blocked_features' => [
                'chat', 'messaging', 'social_features', 'external_links'
            ],
            'daily_time_limit' => 120, // 2 hours
            'weekly_time_limit' => 600, // 10 hours
            'bedtime_restriction' => [
                'enabled' => true,
                'bedtime' => '21:00',
                'waketime' => '07:00',
            ],
            'is_active' => true,
        ];
    }
}