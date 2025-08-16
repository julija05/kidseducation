<?php

namespace App\Services;

use App\Models\User;
use App\Mail\ParentSecurityAlert;
use App\Mail\ParentDailyReport;
use App\Mail\ParentWeeklyReport;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ParentNotificationService
{
    /**
     * Send immediate security alert to parents
     */
    public function sendSecurityAlert(User $student, string $alertType, array $details = [])
    {
        $parentEmail = $this->getParentEmail($student);
        
        if (!$parentEmail) {
            Log::warning("No parent email found for student", ['student_id' => $student->id]);
            return false;
        }

        $alertData = [
            'student_name' => $student->name,
            'alert_type' => $alertType,
            'timestamp' => now(),
            'details' => $details,
            'severity' => $this->determineAlertSeverity($alertType),
            'recommendations' => $this->getSecurityRecommendations($alertType),
        ];

        try {
            Mail::to($parentEmail)->send(new ParentSecurityAlert($alertData));
            
            Log::info("Security alert sent to parent", [
                'student_id' => $student->id,
                'parent_email' => $parentEmail,
                'alert_type' => $alertType,
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send security alert", [
                'student_id' => $student->id,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }

    /**
     * Send daily activity report to parents
     */
    public function sendDailyReport(User $student, array $activityData = [])
    {
        $parentEmail = $this->getParentEmail($student);
        
        if (!$parentEmail) {
            return false;
        }

        $reportData = [
            'student_name' => $student->name,
            'date' => now()->format('Y-m-d'),
            'time_spent' => $activityData['time_spent'] ?? 0,
            'lessons_completed' => $activityData['lessons_completed'] ?? 0,
            'programs_accessed' => $activityData['programs_accessed'] ?? [],
            'security_events' => $activityData['security_events'] ?? [],
            'blocked_content_attempts' => $activityData['blocked_content'] ?? 0,
            'learning_achievements' => $activityData['achievements'] ?? [],
            'recommendations' => $this->getDailyRecommendations($activityData),
        ];

        try {
            Mail::to($parentEmail)->send(new ParentDailyReport($reportData));
            
            Log::info("Daily report sent to parent", [
                'student_id' => $student->id,
                'parent_email' => $parentEmail,
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send daily report", [
                'student_id' => $student->id,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }

    /**
     * Send weekly summary report to parents
     */
    public function sendWeeklyReport(User $student, array $weeklyData = [])
    {
        $parentEmail = $this->getParentEmail($student);
        
        if (!$parentEmail) {
            return false;
        }

        $reportData = [
            'student_name' => $student->name,
            'week_start' => now()->startOfWeek()->format('Y-m-d'),
            'week_end' => now()->endOfWeek()->format('Y-m-d'),
            'total_time_spent' => $weeklyData['total_time'] ?? 0,
            'daily_breakdown' => $weeklyData['daily_breakdown'] ?? [],
            'learning_progress' => $weeklyData['learning_progress'] ?? [],
            'security_summary' => $weeklyData['security_summary'] ?? [],
            'content_interactions' => $weeklyData['content_interactions'] ?? [],
            'parent_action_items' => $this->getParentActionItems($weeklyData),
        ];

        try {
            Mail::to($parentEmail)->send(new ParentWeeklyReport($reportData));
            
            Log::info("Weekly report sent to parent", [
                'student_id' => $student->id,
                'parent_email' => $parentEmail,
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send weekly report", [
                'student_id' => $student->id,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }

    /**
     * Send real-time notification for critical events
     */
    public function sendRealTimeAlert(User $student, string $event, array $context = [])
    {
        $criticalEvents = [
            'suspicious_activity',
            'personal_info_shared',
            'inappropriate_contact_attempt',
            'excessive_failed_logins',
            'location_sharing_attempt',
            'external_communication_attempt'
        ];

        if (in_array($event, $criticalEvents)) {
            return $this->sendSecurityAlert($student, $event, $context);
        }

        return false;
    }

    /**
     * Configure parent notification preferences
     */
    public function configureNotificationPreferences(User $student, array $preferences)
    {
        // Store notification preferences for the student's parent
        $config = [
            'immediate_alerts' => $preferences['immediate_alerts'] ?? true,
            'daily_reports' => $preferences['daily_reports'] ?? true,
            'weekly_reports' => $preferences['weekly_reports'] ?? true,
            'learning_milestones' => $preferences['learning_milestones'] ?? true,
            'security_summaries' => $preferences['security_summaries'] ?? true,
            'preferred_time' => $preferences['preferred_time'] ?? '18:00',
            'timezone' => $preferences['timezone'] ?? 'UTC',
        ];

        // In a real implementation, you'd store this in the database
        Log::info("Parent notification preferences configured", [
            'student_id' => $student->id,
            'preferences' => $config,
        ]);

        return $config;
    }

    /**
     * Get parent email from student profile
     */
    protected function getParentEmail(User $student): ?string
    {
        // In a real implementation, you'd have a parent_email field or related parent user
        // For demo purposes, we'll construct a parent email
        return $student->parent_email ?? $this->constructParentEmail($student->email);
    }

    /**
     * Construct parent email from student email for demo
     */
    protected function constructParentEmail(string $studentEmail): string
    {
        // Simple demo logic - in reality you'd have proper parent accounts
        $parts = explode('@', $studentEmail);
        return 'parent.' . $parts[0] . '@' . $parts[1];
    }

    /**
     * Determine alert severity level
     */
    protected function determineAlertSeverity(string $alertType): string
    {
        $severityMap = [
            'personal_info_shared' => 'critical',
            'inappropriate_contact_attempt' => 'critical',
            'location_sharing_attempt' => 'critical',
            'external_communication_attempt' => 'high',
            'suspicious_activity' => 'high',
            'excessive_failed_logins' => 'medium',
            'time_limit_exceeded' => 'low',
            'content_blocked' => 'low',
        ];

        return $severityMap[$alertType] ?? 'medium';
    }

    /**
     * Get security recommendations based on alert type
     */
    protected function getSecurityRecommendations(string $alertType): array
    {
        $recommendations = [
            'personal_info_shared' => [
                'Review with your child what information should never be shared online',
                'Consider additional privacy training sessions',
                'Monitor your child\'s online activities more closely',
                'Update parental control settings if needed'
            ],
            'inappropriate_contact_attempt' => [
                'Immediately discuss online safety with your child',
                'Review who your child is communicating with online',
                'Consider reporting the incident to local authorities',
                'Strengthen communication monitoring settings'
            ],
            'content_blocked' => [
                'Use this as a teaching moment about online safety',
                'Praise your child for the security system working correctly',
                'Review appropriate online behavior guidelines'
            ],
            'time_limit_exceeded' => [
                'Discuss healthy screen time habits with your child',
                'Consider adjusting daily time limits if needed',
                'Plan offline activities as alternatives'
            ]
        ];

        return $recommendations[$alertType] ?? [
            'Monitor your child\'s online activity',
            'Discuss online safety regularly',
            'Keep communication open about their digital experiences'
        ];
    }

    /**
     * Get daily recommendations for parents
     */
    protected function getDailyRecommendations(array $activityData): array
    {
        $recommendations = [];

        if (($activityData['time_spent'] ?? 0) > 120) {
            $recommendations[] = 'Consider encouraging offline activities to balance screen time';
        }

        if (($activityData['blocked_content'] ?? 0) > 0) {
            $recommendations[] = 'Review blocked content attempts with your child as learning opportunities';
        }

        if (($activityData['lessons_completed'] ?? 0) > 3) {
            $recommendations[] = 'Great progress today! Consider celebrating this learning achievement';
        }

        if (empty($recommendations)) {
            $recommendations[] = 'Continue monitoring and supporting your child\'s online learning journey';
        }

        return $recommendations;
    }

    /**
     * Get parent action items from weekly data
     */
    protected function getParentActionItems(array $weeklyData): array
    {
        $actionItems = [];

        if (($weeklyData['security_events'] ?? 0) > 5) {
            $actionItems[] = [
                'priority' => 'high',
                'action' => 'Schedule a conversation about online safety',
                'reason' => 'Multiple security events detected this week'
            ];
        }

        if (($weeklyData['total_time'] ?? 0) > 600) { // More than 10 hours/week
            $actionItems[] = [
                'priority' => 'medium',
                'action' => 'Review screen time balance',
                'reason' => 'High weekly screen time detected'
            ];
        }

        $actionItems[] = [
            'priority' => 'low',
            'action' => 'Review learning progress with your child',
            'reason' => 'Regular check-ins support continued learning'
        ];

        return $actionItems;
    }
}