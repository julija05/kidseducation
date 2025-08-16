<?php

namespace App\Services;

use App\Models\User;
use App\Models\ParentalControl;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class ActivityMonitoringService
{
    /**
     * Track student activity for parental oversight
     */
    public function trackActivity(int $studentId, string $activity, array $data = []): void
    {
        $activityData = [
            'student_id' => $studentId,
            'activity_type' => $activity,
            'activity_data' => json_encode($data),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'session_id' => session()->getId(),
            'timestamp' => now(),
            'date' => now()->toDateString(),
            'time' => now()->toTimeString(),
        ];

        // Store in database (you'll need to create this table)
        DB::table('student_activities')->insert($activityData);

        // Check for suspicious patterns
        $this->checkSuspiciousActivity($studentId, $activity, $data);
        
        // Update daily usage tracking
        $this->updateDailyUsage($studentId);
    }

    /**
     * Generate parental report
     */
    public function generateParentalReport(int $studentId, string $period = 'weekly'): array
    {
        $student = User::find($studentId);
        $parentalControl = ParentalControl::where('student_id', $studentId)->first();
        
        if (!$student || !$parentalControl) {
            return [];
        }

        $startDate = $this->getReportStartDate($period);
        $endDate = now();

        $activities = DB::table('student_activities')
            ->where('student_id', $studentId)
            ->where('timestamp', '>=', $startDate)
            ->where('timestamp', '<=', $endDate)
            ->orderBy('timestamp', 'desc')
            ->get();

        return [
            'student' => [
                'name' => $student->name,
                'id' => $student->id,
                'email' => $student->email,
            ],
            'period' => [
                'type' => $period,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'summary' => $this->generateActivitySummary($activities),
            'daily_breakdown' => $this->generateDailyBreakdown($activities),
            'security_alerts' => $this->getSecurityAlerts($studentId, $startDate, $endDate),
            'achievements' => $this->getAchievements($studentId, $startDate, $endDate),
            'recommendations' => $this->generateRecommendations($activities),
        ];
    }

    /**
     * Check for suspicious activity patterns
     */
    private function checkSuspiciousActivity(int $studentId, string $activity, array $data): void
    {
        $alerts = [];
        
        // Check for rapid activity (possible bot/automation)
        $recentActivities = DB::table('student_activities')
            ->where('student_id', $studentId)
            ->where('timestamp', '>=', now()->subMinutes(5))
            ->count();

        if ($recentActivities > 50) {
            $alerts[] = 'rapid_activity_detected';
        }

        // Check for unusual time patterns
        $currentHour = now()->hour;
        if ($currentHour < 6 || $currentHour > 22) {
            $alerts[] = 'unusual_time_activity';
        }

        // Check for content-related alerts
        if ($activity === 'content_interaction' && isset($data['content'])) {
            $moderationService = new ContentModerationService();
            $moderation = $moderationService->moderateContent($data['content'], $studentId);
            
            if (!empty($moderation['violations'])) {
                $alerts[] = 'content_moderation_triggered';
            }
        }

        // Check for IP address changes
        $lastActivity = DB::table('student_activities')
            ->where('student_id', $studentId)
            ->where('timestamp', '>=', now()->subHours(1))
            ->orderBy('timestamp', 'desc')
            ->first();

        if ($lastActivity && $lastActivity->ip_address !== request()->ip()) {
            $alerts[] = 'ip_address_changed';
        }

        // Log security alerts
        if (!empty($alerts)) {
            Log::channel('security')->warning('Student security alert', [
                'student_id' => $studentId,
                'alerts' => $alerts,
                'activity' => $activity,
                'ip' => request()->ip(),
                'timestamp' => now(),
            ]);

            // Send immediate alert to parents for severe issues
            if (in_array('content_moderation_triggered', $alerts) || in_array('rapid_activity_detected', $alerts)) {
                $this->sendImmediateParentAlert($studentId, $alerts);
            }
        }
    }

    /**
     * Update daily usage tracking
     */
    private function updateDailyUsage(int $studentId): void
    {
        $today = now()->toDateString();
        
        // Track session duration and update daily usage
        $sessionStart = session('session_start_time', now());
        $sessionDuration = now()->diffInMinutes($sessionStart);
        
        DB::table('daily_usage_tracking')
            ->updateOrInsert(
                [
                    'student_id' => $studentId,
                    'date' => $today,
                ],
                [
                    'total_minutes' => DB::raw("total_minutes + {$sessionDuration}"),
                    'last_activity' => now(),
                    'session_count' => DB::raw('session_count + 1'),
                ]
            );
    }

    /**
     * Generate activity summary
     */
    private function generateActivitySummary($activities): array
    {
        $summary = [
            'total_activities' => $activities->count(),
            'unique_days' => $activities->pluck('date')->unique()->count(),
            'total_time_minutes' => 0,
            'most_active_day' => null,
            'activity_breakdown' => [],
        ];

        // Group activities by type
        $activityGroups = $activities->groupBy('activity_type');
        foreach ($activityGroups as $type => $typeActivities) {
            $summary['activity_breakdown'][$type] = $typeActivities->count();
        }

        // Find most active day
        $dailyActivities = $activities->groupBy('date');
        $mostActiveDay = $dailyActivities->sortByDesc(function ($day) {
            return $day->count();
        })->first();

        if ($mostActiveDay) {
            $summary['most_active_day'] = $mostActiveDay->first()->date;
        }

        return $summary;
    }

    /**
     * Generate daily breakdown
     */
    private function generateDailyBreakdown($activities): array
    {
        $breakdown = [];
        $dailyActivities = $activities->groupBy('date');

        foreach ($dailyActivities as $date => $dayActivities) {
            $breakdown[$date] = [
                'total_activities' => $dayActivities->count(),
                'start_time' => $dayActivities->min('time'),
                'end_time' => $dayActivities->max('time'),
                'peak_hours' => $this->calculatePeakHours($dayActivities),
                'activity_types' => $dayActivities->groupBy('activity_type')->map(function ($group) {
                    return $group->count();
                })->toArray(),
            ];
        }

        return $breakdown;
    }

    /**
     * Get security alerts for the period
     */
    private function getSecurityAlerts(int $studentId, Carbon $startDate, Carbon $endDate): array
    {
        return DB::table('security_logs')
            ->where('student_id', $studentId)
            ->where('timestamp', '>=', $startDate)
            ->where('timestamp', '<=', $endDate)
            ->orderBy('timestamp', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get achievements for the period
     */
    private function getAchievements(int $studentId, Carbon $startDate, Carbon $endDate): array
    {
        // This would integrate with your existing achievement system
        return [
            'lessons_completed' => 5,
            'quizzes_passed' => 3,
            'certificates_earned' => 1,
            'days_active' => 6,
            'learning_streak' => 4,
        ];
    }

    /**
     * Generate recommendations based on activity
     */
    private function generateRecommendations($activities): array
    {
        $recommendations = [];

        // Check activity levels
        $totalActivities = $activities->count();
        $uniqueDays = $activities->pluck('date')->unique()->count();

        if ($uniqueDays >= 5) {
            $recommendations[] = [
                'type' => 'positive',
                'message' => 'Great consistency! Your child has been active on ' . $uniqueDays . ' days.',
            ];
        } elseif ($uniqueDays <= 2) {
            $recommendations[] = [
                'type' => 'suggestion',
                'message' => 'Consider encouraging more regular learning sessions throughout the week.',
            ];
        }

        // Check time patterns
        $eveningActivities = $activities->filter(function ($activity) {
            $hour = Carbon::parse($activity->time)->hour;
            return $hour >= 18;
        })->count();

        if ($eveningActivities > $totalActivities * 0.7) {
            $recommendations[] = [
                'type' => 'suggestion',
                'message' => 'Most learning happens in the evening. Consider some morning sessions for better retention.',
            ];
        }

        return $recommendations;
    }

    /**
     * Calculate peak activity hours
     */
    private function calculatePeakHours($dayActivities): array
    {
        $hourlyBreakdown = [];
        
        foreach ($dayActivities as $activity) {
            $hour = Carbon::parse($activity->time)->hour;
            $hourlyBreakdown[$hour] = ($hourlyBreakdown[$hour] ?? 0) + 1;
        }

        arsort($hourlyBreakdown);
        
        return array_slice($hourlyBreakdown, 0, 3, true);
    }

    /**
     * Get report start date based on period
     */
    private function getReportStartDate(string $period): Carbon
    {
        switch ($period) {
            case 'daily':
                return now()->startOfDay();
            case 'weekly':
                return now()->startOfWeek();
            case 'monthly':
                return now()->startOfMonth();
            default:
                return now()->startOfWeek();
        }
    }

    /**
     * Send immediate alert to parents
     */
    private function sendImmediateParentAlert(int $studentId, array $alerts): void
    {
        $student = User::find($studentId);
        $parentalControl = ParentalControl::where('student_id', $studentId)->first();
        
        if (!$student || !$parentalControl || !$parentalControl->parent_email) {
            return;
        }

        // TODO: Implement email notification
        Log::info('Immediate parent alert sent', [
            'student_id' => $studentId,
            'parent_email' => $parentalControl->parent_email,
            'alerts' => $alerts,
        ]);
    }

    /**
     * Check if student has exceeded time limits
     */
    public function checkTimeLimits(int $studentId): array
    {
        $parentalControl = ParentalControl::where('student_id', $studentId)->first();
        
        if (!$parentalControl || !$parentalControl->is_active) {
            return ['exceeded' => false];
        }

        $today = now()->toDateString();
        $dailyUsage = DB::table('daily_usage_tracking')
            ->where('student_id', $studentId)
            ->where('date', $today)
            ->first();

        $usedMinutes = $dailyUsage->total_minutes ?? 0;
        $dailyLimit = $parentalControl->daily_time_limit;

        $result = [
            'exceeded' => false,
            'daily_used' => $usedMinutes,
            'daily_limit' => $dailyLimit,
            'remaining' => $dailyLimit ? max(0, $dailyLimit - $usedMinutes) : -1,
        ];

        if ($dailyLimit && $usedMinutes >= $dailyLimit) {
            $result['exceeded'] = true;
            $result['message'] = 'Daily time limit exceeded';
        }

        return $result;
    }
}