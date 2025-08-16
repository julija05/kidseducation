<?php

namespace App\Http\Middleware;

use App\Services\ParentNotificationService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class KidsSecurityMiddleware
{
    protected ParentNotificationService $parentNotificationService;

    public function __construct(ParentNotificationService $parentNotificationService)
    {
        $this->parentNotificationService = $parentNotificationService;
    }

    /**
     * Enhanced security middleware specifically designed for children's safety
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Enhanced session security for kids
        $this->enforceSessionSecurity($request);
        
        // 2. Rate limiting - more strict for kids
        $this->enforceRateLimiting($request);
        
        // 3. IP and user agent monitoring
        $this->monitorSuspiciousActivity($request);
        
        // 4. Block suspicious patterns
        if ($this->detectSuspiciousActivity($request)) {
            $user = Auth::user();
            
            Log::warning('Suspicious activity blocked for kid user', [
                'user_id' => Auth::id(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
            ]);
            
            // Send immediate parent notification for critical security events
            if ($user && $user->hasRole('student')) {
                $this->parentNotificationService->sendRealTimeAlert($user, 'suspicious_activity', [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'attempted_url' => $request->fullUrl(),
                    'blocked_reason' => 'Suspicious activity pattern detected'
                ]);
            }
            
            return response()->json(['message' => 'Access denied for security reasons'], 403);
        }
        
        return $next($request);
    }
    
    /**
     * Enhanced session security for children
     */
    private function enforceSessionSecurity(Request $request): void
    {
        if (!Auth::check()) {
            return;
        }
        
        $user = Auth::user();
        
        // Only apply enhanced security to student accounts
        if (!$user->hasRole('student')) {
            return;
        }
        
        // Check session age - shorter for kids (30 minutes max)
        $sessionStartTime = $request->session()->get('session_start_time');
        if (!$sessionStartTime) {
            $request->session()->put('session_start_time', now());
        } elseif (now()->diffInMinutes($sessionStartTime) > 30) {
            Log::info('Student session expired due to time limit', [
                'user_id' => $user->id,
                'session_duration' => now()->diffInMinutes($sessionStartTime),
            ]);
            
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
        
        // Track IP changes for security
        $currentIp = $request->ip();
        $sessionIp = $request->session()->get('session_ip');
        
        if (!$sessionIp) {
            $request->session()->put('session_ip', $currentIp);
        } elseif ($sessionIp !== $currentIp) {
            Log::warning('IP address changed during student session', [
                'user_id' => $user->id,
                'original_ip' => $sessionIp,
                'new_ip' => $currentIp,
            ]);
            
            // Force re-authentication for IP changes
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }
    
    /**
     * Strict rate limiting for kids' accounts
     */
    private function enforceRateLimiting(Request $request): void
    {
        if (!Auth::check() || !Auth::user()->hasRole('student')) {
            return;
        }
        
        $key = 'kids_rate_limit:' . Auth::id();
        
        // More restrictive rate limiting for kids
        // 60 requests per minute (vs standard 120)
        if (RateLimiter::tooManyAttempts($key, 60)) {
            Log::warning('Rate limit exceeded for student', [
                'user_id' => Auth::id(),
                'ip' => $request->ip(),
            ]);
            
            abort(429, 'Too many requests. Please slow down.');
        }
        
        RateLimiter::hit($key, 60); // 60 seconds
    }
    
    /**
     * Monitor for suspicious activity patterns
     */
    private function monitorSuspiciousActivity(Request $request): void
    {
        if (!Auth::check() || !Auth::user()->hasRole('student')) {
            return;
        }
        
        $user = Auth::user();
        $suspicious = false;
        $reasons = [];
        
        // Check for rapid page changes (possible bot behavior)
        $pageChangeKey = 'page_changes:' . $user->id;
        $pageChanges = RateLimiter::attempts($pageChangeKey);
        
        if ($pageChanges > 30) { // More than 30 page changes per minute
            $suspicious = true;
            $reasons[] = 'rapid_page_changes';
        }
        
        RateLimiter::hit($pageChangeKey, 60);
        
        // Check for unusual user agent
        $userAgent = $request->userAgent();
        if (empty($userAgent) || $this->isSuspiciousUserAgent($userAgent)) {
            $suspicious = true;
            $reasons[] = 'suspicious_user_agent';
        }
        
        // Check for script injection attempts in any input
        if ($this->containsScriptInjection($request)) {
            $suspicious = true;
            $reasons[] = 'script_injection_attempt';
        }
        
        if ($suspicious) {
            Log::warning('Suspicious activity detected for student', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'user_agent' => $userAgent,
                'reasons' => $reasons,
                'url' => $request->fullUrl(),
            ]);
        }
    }
    
    /**
     * Detect and block suspicious activity
     */
    private function detectSuspiciousActivity(Request $request): bool
    {
        if (!Auth::check() || !Auth::user()->hasRole('student')) {
            return false;
        }
        
        // Block known attack patterns
        $url = $request->fullUrl();
        $suspiciousPatterns = [
            '/admin', '/api/admin', '/.env', '/config', '/database',
            'javascript:', 'data:', 'vbscript:', '<script',
            'eval(', 'document.cookie', 'localStorage'
        ];
        
        foreach ($suspiciousPatterns as $pattern) {
            if (stripos($url, $pattern) !== false) {
                return true;
            }
        }
        
        // Check request parameters for malicious content
        foreach ($request->all() as $value) {
            if (is_string($value) && $this->containsMaliciousContent($value)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if user agent looks suspicious
     */
    private function isSuspiciousUserAgent(string $userAgent): bool
    {
        $suspiciousAgents = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
            'python', 'php', 'java', 'ruby', 'perl', 'postman'
        ];
        
        $userAgentLower = strtolower($userAgent);
        
        foreach ($suspiciousAgents as $agent) {
            if (strpos($userAgentLower, $agent) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for script injection attempts
     */
    private function containsScriptInjection(Request $request): bool
    {
        $allInput = $request->all();
        
        foreach ($allInput as $input) {
            if (is_string($input) && $this->containsMaliciousContent($input)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for malicious content in input
     */
    private function containsMaliciousContent(string $content): bool
    {
        $maliciousPatterns = [
            '/<script[^>]*>.*?<\/script>/is',
            '/javascript:/i',
            '/vbscript:/i',
            '/data:text\/html/i',
            '/eval\s*\(/i',
            '/document\.cookie/i',
            '/localStorage/i',
            '/sessionStorage/i',
            '/<iframe[^>]*>/i',
            '/<object[^>]*>/i',
            '/<embed[^>]*>/i',
            '/onload\s*=/i',
            '/onerror\s*=/i',
            '/onclick\s*=/i',
        ];
        
        foreach ($maliciousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        
        return false;
    }
}