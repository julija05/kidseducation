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
        // Ensure session is properly started for database-based sessions on production
        if (config('session.driver') === 'database' && !$request->hasSession()) {
            $request->setLaravelSession(Session::driver());
        }

        // Force session start for production environment
        if (app()->environment('production')) {
            // Ensure session ID exists
            if (!Session::getId()) {
                Session::start();
            }
            
            // Ensure CSRF token exists
            if (!Session::token()) {
                Session::regenerateToken();
            }
        }

        $response = $next($request);

        // Ensure session is saved for production
        if (app()->environment('production')) {
            Session::save();
        }

        return $response;
    }
}