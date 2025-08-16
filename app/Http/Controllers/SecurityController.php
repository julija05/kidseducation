<?php

namespace App\Http\Controllers;

use App\Services\ActivityMonitoringService;
use App\Services\ContentModerationService;
use App\Services\ParentNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SecurityController extends Controller
{
    protected $activityService;
    protected $contentService;
    protected $parentNotificationService;

    public function __construct(
        ActivityMonitoringService $activityService,
        ContentModerationService $contentService,
        ParentNotificationService $parentNotificationService
    ) {
        $this->activityService = $activityService;
        $this->contentService = $contentService;
        $this->parentNotificationService = $parentNotificationService;
    }

    /**
     * Log security events for demonstration
     */
    public function logActivity(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('student')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Track the activity
        $this->activityService->trackActivity(
            $user->id,
            $request->input('activity_type', 'page_view'),
            $request->input('data', [])
        );

        return response()->json(['status' => 'logged']);
    }

    /**
     * Moderate content in real-time
     */
    public function moderateContent(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('student')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $content = $request->input('content', '');
        
        $moderation = $this->contentService->moderateContent($content, $user->id);

        // Send parent notification for blocked content if severity is high
        if (!$moderation['allowed'] && in_array($moderation['severity'], ['high', 'critical'])) {
            $this->parentNotificationService->sendRealTimeAlert($user, 'inappropriate_content_attempt', [
                'content_preview' => substr($content, 0, 100),
                'severity' => $moderation['severity'],
                'violations' => $moderation['violations']
            ]);
        }

        return response()->json([
            'allowed' => $moderation['allowed'],
            'severity' => $moderation['severity'],
            'violations' => $moderation['violations'],
            'clean_content' => $moderation['clean_content'],
        ]);
    }

    /**
     * Get security status for dashboard
     */
    public function getSecurityStatus()
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('student')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Mock security status (would be real data in production)
        $status = [
            'session_time_remaining' => 25, // minutes
            'daily_time_used' => 95, // minutes
            'daily_time_limit' => 120, // minutes
            'security_level' => 'high',
            'content_filter_active' => true,
            'parental_monitoring' => true,
            'session_secure' => true,
            'ip_verified' => true,
            'last_activity' => now()->subMinutes(2)->toISOString(),
            'session_start' => now()->subMinutes(95)->toISOString(),
        ];

        return response()->json($status);
    }

    /**
     * Demo security warning (for testing)
     */
    public function triggerSecurityWarning(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('student')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        Log::warning('Demo security warning triggered', [
            'user_id' => $user->id,
            'trigger_type' => $request->input('type', 'demo'),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Security warning logged',
            'warning_type' => $request->input('type', 'demo'),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Check time limits
     */
    public function checkTimeLimits()
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('student')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Mock time limit check (would query real data in production)
        $timeLimits = [
            'daily_limit' => 120, // 2 hours
            'time_used_today' => 95, // 95 minutes used
            'time_remaining' => 25, // 25 minutes left
            'exceeded' => false,
            'warning_threshold' => 10, // Show warning when 10 minutes left
            'should_show_warning' => true, // Show warning now
            'bedtime_restriction' => [
                'enabled' => true,
                'bedtime' => '21:00',
                'current_time' => now()->format('H:i'),
                'within_bedtime' => false,
            ],
        ];

        return response()->json($timeLimits);
    }

    /**
     * Demo parent notification sending
     */
    public function sendDemoParentNotification(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('student')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notificationType = $request->input('type', 'security_alert');
        $testData = $request->input('data', []);

        try {
            switch ($notificationType) {
                case 'security_alert':
                    $result = $this->parentNotificationService->sendSecurityAlert($user, 'content_blocked', $testData);
                    break;
                case 'daily_report':
                    $result = $this->parentNotificationService->sendDailyReport($user, $testData);
                    break;
                case 'weekly_report':
                    $result = $this->parentNotificationService->sendWeeklyReport($user, $testData);
                    break;
                default:
                    return response()->json(['error' => 'Invalid notification type'], 400);
            }

            return response()->json([
                'success' => $result,
                'message' => $result ? 'Parent notification sent successfully' : 'Failed to send notification',
                'type' => $notificationType,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Demo parent notification failed', [
                'user_id' => $user->id,
                'type' => $notificationType,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send notification: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Configure parent notification preferences
     */
    public function configureParentNotifications(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('student')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $preferences = $request->validate([
            'immediate_alerts' => 'boolean',
            'daily_reports' => 'boolean', 
            'weekly_reports' => 'boolean',
            'learning_milestones' => 'boolean',
            'security_summaries' => 'boolean',
            'preferred_time' => 'string',
            'timezone' => 'string',
        ]);

        $config = $this->parentNotificationService->configureNotificationPreferences($user, $preferences);

        return response()->json([
            'success' => true,
            'preferences' => $config,
            'message' => 'Parent notification preferences updated successfully',
        ]);
    }
}