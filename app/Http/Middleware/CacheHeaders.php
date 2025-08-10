<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CacheHeaders
{
    public function handle(Request $request, Closure $next, $cacheControl = null)
    {
        $response = $next($request);

        // Don't cache if user is authenticated
        if (auth()->check()) {
            return $response;
        }

        // Set default cache control
        if ($cacheControl) {
            $response->header('Cache-Control', $cacheControl);
        } else {
            // Default caching strategy based on route
            $routeName = $request->route()?->getName();
            
            if (str_starts_with($routeName, 'admin.') || str_starts_with($routeName, 'student.')) {
                // No caching for admin/student pages
                $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
                $response->header('Pragma', 'no-cache');
                $response->header('Expires', '0');
            } elseif (in_array($routeName, ['home', 'about', 'contact'])) {
                // Cache static pages for 1 day
                $response->header('Cache-Control', 'public, max-age=86400');
            } elseif (str_starts_with($routeName, 'programs.') || str_starts_with($routeName, 'articles.')) {
                // Cache content pages for 1 hour
                $response->header('Cache-Control', 'public, max-age=3600');
            } else {
                // Default cache for 30 minutes
                $response->header('Cache-Control', 'public, max-age=1800');
            }
        }

        // Add security headers
        $response->header('X-Content-Type-Options', 'nosniff');
        $response->header('X-Frame-Options', 'SAMEORIGIN');
        $response->header('X-XSS-Protection', '1; mode=block');
        $response->header('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        return $response;
    }
}