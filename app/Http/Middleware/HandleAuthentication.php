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
            // Handle session expiration gracefully for Inertia requests
            if ($request->hasSession()) {
                // Session exists but user is not authenticated - likely expired
                Log::info('Session expired, authentication failed', [
                    'url' => $request->url(),
                    'method' => $request->method(),
                    'session_id' => $request->session()->getId(),
                    'user_agent' => $request->header('User-Agent'),
                    'is_inertia' => $request->header('X-Inertia') ? true : false,
                ]);

                // Clear the expired session to prevent issues
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
        // For Inertia requests, we need to return a JSON response that Inertia can handle
        if ($request->expectsJson() || $request->header('X-Inertia')) {
            return null; // This will cause a 401, which Inertia handles properly
        }

        return route('login');
    }
}
