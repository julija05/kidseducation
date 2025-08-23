<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CacheHeaders
{
    public function handle(Request $request, Closure $next, $cacheControl = null)
    {
        $response = $next($request);

        // NUCLEAR SOLUTION: Disable ALL caching to fix language switching
        // This ensures language changes work immediately for all users
        // Trade-off: Performance impact but guaranteed language switching functionality
        $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->header('Pragma', 'no-cache');
        $response->header('Expires', '0');

        return $response;

        // Don't cache language switching requests
        if ($request->is('language/*')) {
            $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
            $response->header('Pragma', 'no-cache');
            $response->header('Expires', '0');

            return $response;
        }

        // Don't cache if language was recently switched (check for cache busting parameters)
        if ($request->has(['lang_switched', 'v'])) {
            $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
            $response->header('Pragma', 'no-cache');
            $response->header('Expires', '0');

            return $response;
        }

        // For all other pages (API endpoints, assets, etc.), allow caching
        // Set default cache control
        if ($cacheControl) {
            $response->header('Cache-Control', $cacheControl);
        } else {
            // Check if it's admin/student pages
            if (str_starts_with($routeName, 'admin.') || str_starts_with($routeName, 'student.')) {
                // No caching for admin/student pages
                $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
                $response->header('Pragma', 'no-cache');
                $response->header('Expires', '0');
            } else {
                // Cache other resources (APIs, assets, etc.) for 30 minutes
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
