<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpFoundation\Response;

class HandleCsrfErrors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            return $next($request);
        } catch (TokenMismatchException $e) {
            // Log CSRF token mismatch for debugging
            \Log::warning('CSRF Token Mismatch', [
                'url' => $request->url(),
                'method' => $request->method(),
                'user_agent' => $request->header('User-Agent'),
                'ip' => $request->ip(),
                'session_id' => $request->session()->getId(),
                'has_token' => $request->hasHeader('X-CSRF-TOKEN') || $request->has('_token'),
                'is_inertia' => $request->header('X-Inertia'),
            ]);

            // For Inertia requests, return JSON with reload instruction
            if ($request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Session expired. Please refresh the page.',
                    'reload_required' => true,
                ], 419); // 419 is Laravel's CSRF token mismatch status code
            }

            // For regular requests, redirect back with error
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Session expired. Please refresh and try again.',
                    'error' => 'csrf_token_mismatch',
                ], 419);
            }

            // For form submissions, redirect back with error
            return redirect()->back()
                ->withInput($request->except(['password', 'password_confirmation', '_token']))
                ->withErrors(['csrf' => 'Session expired. Please try again.']);
        }
    }
}