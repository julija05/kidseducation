<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HandleAuthentication extends Middleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  mixed  ...$guards
     * @return mixed
     */
    public function handle($request, Closure $next, ...$guards)
    {
        try {
            // Check if session exists but is invalid/expired
            if ($request->hasSession() && ! $this->auth->guard()->check()) {
                $sessionId = $request->session()->getId();

                // Log potential session expiration
                Log::info('Checking authentication state', [
                    'url' => $request->url(),
                    'method' => $request->method(),
                    'session_id' => $sessionId,
                    'has_session_token' => $request->session()->has('_token'),
                    'is_inertia' => $request->header('X-Inertia') ? true : false,
                ]);
            }

            return parent::handle($request, $next, ...$guards);
        } catch (AuthenticationException $e) {
            // Check if this is a resource request (preview, download, stream)
            $isResourceRequest = $request->is('lesson-resources/*');

            // Handle session expiration gracefully for Inertia requests
            if ($request->hasSession() && !$isResourceRequest) {
                // Session exists but user is not authenticated - likely expired
                Log::info('Session expired, authentication failed', [
                    'url' => $request->url(),
                    'method' => $request->method(),
                    'session_id' => $request->session()->getId(),
                    'user_agent' => $request->header('User-Agent'),
                    'is_inertia' => $request->header('X-Inertia') ? true : false,
                ]);

                // Clear the expired session to prevent issues
                // But NOT for resource requests (they may be in iframes)
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            // Re-throw to let our exception handler deal with it
            throw $e;
        }
    }

    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Always redirect to login for all requests (including Inertia)
        // This prevents the JSON response that users were seeing
        return route('login');
    }
}
