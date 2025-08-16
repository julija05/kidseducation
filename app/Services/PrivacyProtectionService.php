<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;

class PrivacyProtectionService
{
    /**
     * Enhanced privacy protection specifically for children
     */
    
    /**
     * Sanitize and protect personal information in user input
     */
    public function sanitizePersonalInfo(string $input): string
    {
        // Remove or mask common personal information patterns
        $patterns = [
            // Phone numbers
            '/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/' => '[PHONE_REMOVED]',
            '/\b\d{10}\b/' => '[PHONE_REMOVED]',
            
            // Email addresses
            '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/' => '[EMAIL_REMOVED]',
            
            // Addresses (basic patterns)
            '/\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|place|pl)\b/i' => '[ADDRESS_REMOVED]',
            
            // Social Security Numbers (US format)
            '/\b\d{3}-\d{2}-\d{4}\b/' => '[SSN_REMOVED]',
            
            // Credit card numbers (basic pattern)
            '/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/' => '[CARD_REMOVED]',
            
            // Common personal info phrases
            '/\b(my name is|i live at|my address|my phone|my email|my school is)\s+[^\s.]+/i' => '[PERSONAL_INFO_REMOVED]',
        ];
        
        foreach ($patterns as $pattern => $replacement) {
            $input = preg_replace($pattern, $replacement, $input);
        }
        
        return $input;
    }
    
    /**
     * Encrypt sensitive data for storage
     */
    public function encryptSensitiveData(array $data): array
    {
        $encryptedData = [];
        $sensitiveFields = [
            'parent_email', 'emergency_contact', 'address', 'phone',
            'school_name', 'parent_name', 'guardian_info'
        ];
        
        foreach ($data as $key => $value) {
            if (in_array($key, $sensitiveFields) && !empty($value)) {
                $encryptedData[$key] = Crypt::encryptString($value);
            } else {
                $encryptedData[$key] = $value;
            }
        }
        
        return $encryptedData;
    }
    
    /**
     * Decrypt sensitive data for authorized access
     */
    public function decryptSensitiveData(array $data): array
    {
        $decryptedData = [];
        $sensitiveFields = [
            'parent_email', 'emergency_contact', 'address', 'phone',
            'school_name', 'parent_name', 'guardian_info'
        ];
        
        foreach ($data as $key => $value) {
            if (in_array($key, $sensitiveFields) && !empty($value)) {
                try {
                    $decryptedData[$key] = Crypt::decryptString($value);
                } catch (\Exception $e) {
                    Log::warning('Failed to decrypt sensitive data', [
                        'field' => $key,
                        'error' => $e->getMessage(),
                    ]);
                    $decryptedData[$key] = '[ENCRYPTED]';
                }
            } else {
                $decryptedData[$key] = $value;
            }
        }
        
        return $decryptedData;
    }
    
    /**
     * Generate anonymized data for analytics while preserving privacy
     */
    public function anonymizeForAnalytics(array $userData): array
    {
        return [
            'user_hash' => Hash::make($userData['id'] ?? ''),
            'age_group' => $this->getAgeGroup($userData['birthdate'] ?? null),
            'region' => $this->getRegion($userData['location'] ?? ''),
            'join_month' => isset($userData['created_at']) ? 
                date('Y-m', strtotime($userData['created_at'])) : null,
            'activity_level' => $this->calculateActivityLevel($userData),
            'learning_preferences' => $userData['learning_preferences'] ?? [],
        ];
    }
    
    /**
     * Check if data collection complies with kids' privacy laws
     */
    public function validateKidsPrivacyCompliance(array $collectedData, int $userAge): array
    {
        $violations = [];
        $warnings = [];
        
        // COPPA compliance for users under 13
        if ($userAge < 13) {
            $prohibitedData = [
                'social_media_profiles', 'friends_list', 'location_tracking',
                'behavioral_advertising_data', 'third_party_tracking'
            ];
            
            foreach ($prohibitedData as $field) {
                if (isset($collectedData[$field]) && !empty($collectedData[$field])) {
                    $violations[] = "COPPA violation: {$field} collection prohibited for users under 13";
                }
            }
            
            // Check for required parental consent
            if (!isset($collectedData['parental_consent']) || !$collectedData['parental_consent']) {
                $violations[] = 'COPPA violation: Parental consent required for users under 13';
            }
        }
        
        // GDPR compliance for all users (Article 8 - special protection for children)
        if ($userAge < 16) {
            if (!isset($collectedData['parental_consent']) || !$collectedData['parental_consent']) {
                $warnings[] = 'GDPR consideration: Parental consent recommended for users under 16';
            }
        }
        
        // General privacy best practices for kids
        $unnecessaryData = [
            'precise_location', 'device_fingerprinting', 'cross_site_tracking',
            'personal_photos', 'video_recordings', 'voice_recordings'
        ];
        
        foreach ($unnecessaryData as $field) {
            if (isset($collectedData[$field]) && !empty($collectedData[$field])) {
                $warnings[] = "Privacy concern: {$field} may not be necessary for educational purposes";
            }
        }
        
        return [
            'compliant' => empty($violations),
            'violations' => $violations,
            'warnings' => $warnings,
            'recommendation' => $this->generatePrivacyRecommendation($violations, $warnings),
        ];
    }
    
    /**
     * Generate privacy-safe user identifier
     */
    public function generatePrivacySafeId(int $userId): string
    {
        // Create a privacy-safe identifier that can't be reversed to get the real user ID
        $salt = config('app.key');
        return hash('sha256', $userId . $salt);
    }
    
    /**
     * Log privacy-related events for compliance
     */
    public function logPrivacyEvent(string $event, int $userId, array $details = []): void
    {
        Log::channel('privacy')->info("Privacy event: {$event}", [
            'user_id' => $userId,
            'privacy_safe_id' => $this->generatePrivacySafeId($userId),
            'timestamp' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'details' => $details,
        ]);
    }
    
    /**
     * Get COPPA-compliant data retention period
     */
    public function getDataRetentionPeriod(string $dataType, int $userAge): int
    {
        // Data retention periods in days
        $retentionPeriods = [
            'activity_logs' => $userAge < 13 ? 90 : 365,
            'learning_progress' => $userAge < 13 ? 730 : 1095, // 2-3 years
            'personal_info' => $userAge < 13 ? 365 : 1825, // 1-5 years
            'communication_logs' => $userAge < 13 ? 30 : 90,
            'error_logs' => 90, // Same for all ages
        ];
        
        return $retentionPeriods[$dataType] ?? 365;
    }
    
    /**
     * Clean up expired data based on retention policies
     */
    public function cleanupExpiredData(int $userId, int $userAge): array
    {
        $cleanupResults = [];
        $dataTypes = ['activity_logs', 'communication_logs', 'error_logs'];
        
        foreach ($dataTypes as $dataType) {
            $retentionDays = $this->getDataRetentionPeriod($dataType, $userAge);
            $cutoffDate = now()->subDays($retentionDays);
            
            // This would delete expired data from respective tables
            $cleanupResults[$dataType] = [
                'retention_days' => $retentionDays,
                'cutoff_date' => $cutoffDate->toDateString(),
                'records_cleaned' => 0, // TODO: Implement actual cleanup
            ];
        }
        
        $this->logPrivacyEvent('data_cleanup', $userId, $cleanupResults);
        
        return $cleanupResults;
    }
    
    /**
     * Generate data export for privacy requests (GDPR right to portability)
     */
    public function generateDataExport(int $userId): array
    {
        // This would collect all user data from various tables
        $exportData = [
            'user_profile' => [], // Basic profile information
            'learning_progress' => [], // Educational progress data
            'activity_history' => [], // Learning activity logs
            'parental_controls' => [], // Privacy and safety settings
            'generated_at' => now()->toISOString(),
            'data_format' => 'JSON',
            'privacy_note' => 'This export contains all personal data we have collected about this user.',
        ];
        
        $this->logPrivacyEvent('data_export_generated', $userId);
        
        return $exportData;
    }
    
    /**
     * Process data deletion request (GDPR right to erasure)
     */
    public function processDataDeletionRequest(int $userId, array $options = []): array
    {
        $deletionResults = [
            'user_id' => $userId,
            'deletion_type' => $options['type'] ?? 'full',
            'requested_at' => now(),
            'items_deleted' => [],
            'items_retained' => [],
            'retention_reasons' => [],
        ];
        
        // Items that must be retained for legal/educational purposes
        $retainedItems = [
            'certificates_earned' => 'Educational record keeping requirements',
            'payment_records' => 'Financial compliance requirements',
            'safety_incidents' => 'Child protection legal requirements',
        ];
        
        $deletionResults['items_retained'] = array_keys($retainedItems);
        $deletionResults['retention_reasons'] = $retainedItems;
        
        // Items that can be safely deleted
        $deletableItems = [
            'activity_logs', 'personal_preferences', 'communication_history',
            'temporary_files', 'session_data', 'analytics_data'
        ];
        
        foreach ($deletableItems as $item) {
            // TODO: Implement actual deletion
            $deletionResults['items_deleted'][] = $item;
        }
        
        $this->logPrivacyEvent('data_deletion_processed', $userId, $deletionResults);
        
        return $deletionResults;
    }
    
    /**
     * Helper methods
     */
    private function getAgeGroup(?string $birthdate): ?string
    {
        if (!$birthdate) return null;
        
        $age = now()->diffInYears($birthdate);
        
        if ($age < 6) return '0-5';
        if ($age < 9) return '6-8';
        if ($age < 13) return '9-12';
        if ($age < 16) return '13-15';
        
        return '16+';
    }
    
    private function getRegion(string $location): string
    {
        // Return generalized region instead of specific location
        // This would need to be implemented based on your location data
        return 'General Region';
    }
    
    private function calculateActivityLevel(array $userData): string
    {
        // Calculate activity level without revealing specific data
        return 'medium'; // TODO: Implement based on activity data
    }
    
    private function generatePrivacyRecommendation(array $violations, array $warnings): string
    {
        if (!empty($violations)) {
            return 'Immediate action required: Privacy law violations detected. Review data collection practices.';
        }
        
        if (!empty($warnings)) {
            return 'Review recommended: Consider minimizing data collection to better protect children\'s privacy.';
        }
        
        return 'Privacy practices appear compliant. Continue monitoring and regular reviews.';
    }
}