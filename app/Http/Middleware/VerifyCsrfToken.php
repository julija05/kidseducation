<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;
use Illuminate\Session\TokenMismatchException;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Keep the chat routes excluded as defined in bootstrap/app.php
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     *
     * @throws \Illuminate\Session\TokenMismatchException
     */
    public function handle($request, \Closure $next)
    {
        try {
            return parent::handle($request, $next);
        } catch (TokenMismatchException $e) {
            // Log the CSRF error for debugging
            \Log::warning('CSRF Token Mismatch', [
                'url' => $request->url(),
                'method' => $request->method(),
                'user_agent' => $request->header('User-Agent'),
                'ip' => $request->ip(),
                'session_id' => $request->hasSession() ? $request->session()->getId() : 'NO_SESSION',
                'has_csrf_header' => $request->hasHeader('X-CSRF-TOKEN'),
                'has_csrf_input' => $request->has('_token'),
                'is_inertia' => $request->header('X-Inertia'),
                'expected_token' => $request->hasSession() ? $request->session()->token() : 'NO_TOKEN',
                'provided_token' => $request->header('X-CSRF-TOKEN') ?: $request->input('_token', 'NO_PROVIDED_TOKEN'),
            ]);

            // Regenerate token for fresh start
            if ($request->hasSession()) {
                $request->session()->regenerateToken();
            }

            // Handle different request types
            if ($request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Your session has expired. Please refresh the page and try again.',
                    'reload_required' => true,
                    'new_csrf_token' => csrf_token(),
                ], 419);
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'CSRF token mismatch. Please refresh and try again.',
                    'error' => 'csrf_token_mismatch',
                    'new_csrf_token' => csrf_token(),
                ], 419);
            }

            // For regular form submissions
            return redirect()->back()
                ->withInput($request->except(['password', 'password_confirmation', '_token']))
                ->with('error', 'Your session expired. Please try again.');
        }
    }

    /**
     * Determine if the session and input CSRF tokens match.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function tokensMatch($request)
    {
        // First try the parent method
        if (parent::tokensMatch($request)) {
            return true;
        }

        // If tokens don't match and session is invalid, try to regenerate
        if (!$request->hasValidSignature() && $request->hasSession()) {
            \Log::info('Regenerating CSRF token due to mismatch', [
                'url' => $request->url(),
                'session_id' => $request->session()->getId(),
            ]);
            
            $request->session()->regenerateToken();
            return false; // Still return false to trigger proper handling
        }

        return false;
    }
}