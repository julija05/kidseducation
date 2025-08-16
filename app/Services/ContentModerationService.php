<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class ContentModerationService
{
    /**
     * Content moderation specifically designed for children's safety
     */
    
    private array $prohibitedWords = [
        // Personal information patterns
        'phone', 'address', 'email', 'password', 'location', 'school',
        'home', 'parents', 'mom', 'dad', 'mother', 'father', 'family',
        
        // Meeting/contact attempts
        'meet', 'secret', 'alone', 'private', 'don\'t tell', 'our secret',
        'just between us', 'special friend', 'come over', 'visit me',
        
        // Inappropriate content
        'mature', 'adult', '18+', 'grown up only', 'not for kids',
        
        // Social media and external platforms
        'instagram', 'facebook', 'snapchat', 'tiktok', 'whatsapp',
        'discord', 'telegram', 'skype', 'zoom', 'messenger',
        
        // Financial/commercial
        'money', 'buy', 'sell', 'purchase', 'credit card', 'payment',
        'free gift', 'prize', 'winner', 'contest', 'reward',
        
        // Suspicious/grooming language
        'beautiful', 'pretty', 'handsome', 'cute', 'special', 'chosen',
        'mature for your age', 'old soul', 'grown up', 'sophisticated',
        
        // URLs and external links indicators
        'www.', 'http', '.com', '.net', '.org', 'link', 'website', 'url'
    ];
    
    private array $suspiciousPatterns = [
        '/\b\d{10,}\b/', // Phone numbers
        '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', // Email addresses
        '/\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|lane|ln)\b/i', // Addresses
        '/\b(password|pwd|pass)\s*[:=]\s*\w+/i', // Password sharing
        '/\b(meet\s+me|let\'s\s+meet|want\s+to\s+meet)\b/i', // Meeting requests
        '/\b(send\s+me|give\s+me\s+your)\s+(photo|picture|pic|image)/i', // Photo requests
        '/\b(don\'t\s+tell|keep\s+secret|our\s+secret|between\s+us)\b/i', // Secrecy requests
        '/\b(add\s+me|follow\s+me)\s+on\s+\w+/i', // Social media requests
        '/https?:\/\/[^\s]+/i', // URLs
        '/\b(gift|prize|money|cash|reward)\s+for\s+you\b/i', // Grooming with rewards
    ];
    
    /**
     * Moderate content for kids' safety
     */
    public function moderateContent(string $content, ?int $userId = null): array
    {
        $violations = [];
        $severity = 'safe';
        $cleanContent = $this->sanitizeContent($content);
        
        // Check for prohibited words
        $wordViolations = $this->checkProhibitedWords($content);
        if (!empty($wordViolations)) {
            $violations = array_merge($violations, $wordViolations);
            $severity = 'warning';
        }
        
        // Check for suspicious patterns
        $patternViolations = $this->checkSuspiciousPatterns($content);
        if (!empty($patternViolations)) {
            $violations = array_merge($violations, $patternViolations);
            $severity = 'danger';
        }
        
        // Check for excessive personal information sharing
        if ($this->containsPersonalInfo($content)) {
            $violations[] = 'personal_information_detected';
            $severity = 'danger';
        }
        
        // Log moderation results
        if (!empty($violations)) {
            Log::warning('Content moderation triggered', [
                'user_id' => $userId,
                'violations' => $violations,
                'severity' => $severity,
                'content_preview' => substr($content, 0, 100),
                'timestamp' => now(),
            ]);
        }
        
        return [
            'allowed' => empty($violations) || $severity === 'warning',
            'severity' => $severity,
            'violations' => $violations,
            'clean_content' => $cleanContent,
            'requires_review' => $severity === 'danger',
        ];
    }
    
    /**
     * Check content against prohibited words
     */
    private function checkProhibitedWords(string $content): array
    {
        $violations = [];
        $contentLower = strtolower($content);
        
        foreach ($this->prohibitedWords as $word) {
            if (strpos($contentLower, strtolower($word)) !== false) {
                $violations[] = "prohibited_word: {$word}";
            }
        }
        
        return $violations;
    }
    
    /**
     * Check content against suspicious patterns
     */
    private function checkSuspiciousPatterns(string $content): array
    {
        $violations = [];
        
        foreach ($this->suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                $violations[] = "suspicious_pattern: {$pattern}";
            }
        }
        
        return $violations;
    }
    
    /**
     * Check if content contains personal information
     */
    private function containsPersonalInfo(string $content): bool
    {
        // Look for patterns that might be personal info
        $personalInfoPatterns = [
            '/\b\d{3}-\d{3}-\d{4}\b/', // Phone format XXX-XXX-XXXX
            '/\b\d{10}\b/', // 10 digit phone
            '/\bI live at\b/i',
            '/\bmy address is\b/i',
            '/\bmy phone number\b/i',
            '/\bmy email is\b/i',
            '/\bmy school is\b/i',
            '/\bgo to.*school\b/i',
        ];
        
        foreach ($personalInfoPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Sanitize content for safe display
     */
    private function sanitizeContent(string $content): string
    {
        // Remove potentially dangerous HTML/JS
        $content = strip_tags($content);
        
        // Remove URLs
        $content = preg_replace('/https?:\/\/[^\s]+/i', '[LINK_REMOVED]', $content);
        
        // Remove email addresses
        $content = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', '[EMAIL_REMOVED]', $content);
        
        // Remove phone numbers
        $content = preg_replace('/\b\d{10,}\b/', '[PHONE_REMOVED]', $content);
        
        // Escape HTML entities
        $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');
        
        return trim($content);
    }
    
    /**
     * Check if a URL is safe for kids
     */
    public function isUrlSafe(string $url): bool
    {
        // Whitelist of allowed domains for kids
        $allowedDomains = [
            'youtube.com',
            'youtu.be',
            'khanacademy.org',
            'scratch.mit.edu',
            'code.org',
            'pbskids.org',
            'nationalgeographic.com',
            'nasa.gov',
            'smithsonianeducation.org',
        ];
        
        $domain = parse_url($url, PHP_URL_HOST);
        if (!$domain) {
            return false;
        }
        
        // Remove www. prefix
        $domain = preg_replace('/^www\./', '', $domain);
        
        foreach ($allowedDomains as $allowedDomain) {
            if ($domain === $allowedDomain || str_ends_with($domain, '.' . $allowedDomain)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Moderate image content (basic checks)
     */
    public function moderateImage(string $imagePath): array
    {
        $violations = [];
        
        // Check file size (limit for kids' uploads)
        $maxSize = 5 * 1024 * 1024; // 5MB max
        if (filesize($imagePath) > $maxSize) {
            $violations[] = 'file_too_large';
        }
        
        // Check file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $fileType = mime_content_type($imagePath);
        if (!in_array($fileType, $allowedTypes)) {
            $violations[] = 'invalid_file_type';
        }
        
        // Check image dimensions (reasonable limits)
        $imageInfo = getimagesize($imagePath);
        if ($imageInfo) {
            $width = $imageInfo[0];
            $height = $imageInfo[1];
            
            if ($width > 2048 || $height > 2048) {
                $violations[] = 'image_too_large';
            }
        }
        
        return [
            'allowed' => empty($violations),
            'violations' => $violations,
        ];
    }
    
    /**
     * Generate a moderation report
     */
    public function generateModerationReport(int $userId, array $violations): void
    {
        if (empty($violations)) {
            return;
        }
        
        // Store moderation incident for admin review
        Log::channel('security')->warning('Kids content moderation incident', [
            'user_id' => $userId,
            'violations' => $violations,
            'timestamp' => now(),
            'requires_admin_review' => true,
        ]);
        
        // TODO: Could integrate with external moderation APIs like:
        // - Google Cloud Vision API for image moderation
        // - AWS Rekognition for content analysis
        // - OpenAI Moderation API for text analysis
    }
}