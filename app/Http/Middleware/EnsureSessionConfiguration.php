<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class EnsureSessionConfiguration
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ensure session is properly started for database-based sessions
        if (config('session.driver') === 'database' && !$request->hasSession()) {
            try {
                $request->setLaravelSession(Session::driver());
            } catch (\Exception $e) {
                \Log::warning('Failed to set Laravel session', [
                    'error' => $e->getMessage(),
                    'url' => $request->url(),
                ]);
            }
        }

        // Ensure session is started
        if (!Session::getId()) {
            try {
                Session::start();
                \Log::debug('Started new session', [
                    'session_id' => Session::getId(),
                    'url' => $request->url(),
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to start session', [
                    'error' => $e->getMessage(),
                    'url' => $request->url(),
                ]);
            }
        }
        
        // Ensure CSRF token exists
        if (!Session::token()) {
            try {
                Session::regenerateToken();
                \Log::debug('Generated new CSRF token', [
                    'session_id' => Session::getId(),
                    'url' => $request->url(),
                ]);
            } catch (\Exception $e) {
                \Log::warning('Failed to generate CSRF token', [
                    'error' => $e->getMessage(),
                    'session_id' => Session::getId(),
                ]);
            }
        }

        // Handle session timeout gracefully
        $response = $next($request);

        // Ensure session is saved
        try {
            Session::save();
        } catch (\Exception $e) {
            \Log::warning('Failed to save session', [
                'error' => $e->getMessage(),
                'session_id' => Session::getId(),
            ]);
        }

        return $response;
    }
}