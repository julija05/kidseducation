<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CacheHeaders
{
    public function handle(Request $request, Closure $next, $cacheControl = null)
    {
        $response = $next($request);

        // Helper function to set headers based on response type
        $setHeader = function ($response, $key, $value) {
            if ($response instanceof StreamedResponse || $response instanceof BinaryFileResponse) {
                $response->headers->set($key, $value);
            } else {
                $response->header($key, $value);
            }
        };

        // NUCLEAR SOLUTION: Disable ALL caching to fix language switching
        // This ensures language changes work immediately for all users
        // Trade-off: Performance impact but guaranteed language switching functionality
        $setHeader($response, 'Cache-Control', 'no-cache, no-store, must-revalidate');
        $setHeader($response, 'Pragma', 'no-cache');
        $setHeader($response, 'Expires', '0');

        // Add security headers
        $setHeader($response, 'X-Content-Type-Options', 'nosniff');
        $setHeader($response, 'X-Frame-Options', 'SAMEORIGIN');
        $setHeader($response, 'X-XSS-Protection', '1; mode=block');
        $setHeader($response, 'Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;

        // ===== UNREACHABLE CODE BELOW (kept for reference) =====
        // The return above makes this code unreachable, but keeping it 
        // in case you want to re-enable conditional caching later

        // Don't cache language switching requests
        if ($request->is('language/*')) {
            $setHeader($response, 'Cache-Control', 'no-cache, no-store, must-revalidate');
            $setHeader($response, 'Pragma', 'no-cache');
            $setHeader($response, 'Expires', '0');
            return $response;
        }

        // Don't cache if language was recently switched (check for cache busting parameters)
        if ($request->has(['lang_switched', 'v'])) {
            $setHeader($response, 'Cache-Control', 'no-cache, no-store, must-revalidate');
            $setHeader($response, 'Pragma', 'no-cache');
            $setHeader($response, 'Expires', '0');
            return $response;
        }

        // For all other pages (API endpoints, assets, etc.), allow caching
        // Set default cache control
        if ($cacheControl) {
            $setHeader($response, 'Cache-Control', $cacheControl);
        } else {
            // Get route name safely
            $routeName = $request->route() ? $request->route()->getName() : '';

            // Check if it's admin/student pages
            if (str_starts_with($routeName, 'admin.') || str_starts_with($routeName, 'student.')) {
                // No caching for admin/student pages
                $setHeader($response, 'Cache-Control', 'no-cache, no-store, must-revalidate');
                $setHeader($response, 'Pragma', 'no-cache');
                $setHeader($response, 'Expires', '0');
            } else {
                // Cache other resources (APIs, assets, etc.) for 30 minutes
                $setHeader($response, 'Cache-Control', 'public, max-age=1800');
            }
        }

        // Add security headers
        $setHeader($response, 'X-Content-Type-Options', 'nosniff');
        $setHeader($response, 'X-Frame-Options', 'SAMEORIGIN');
        $setHeader($response, 'X-XSS-Protection', '1; mode=block');
        $setHeader($response, 'Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}
