<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip check if user is not authenticated
        if (! Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        // Skip check for admin users to prevent lockout
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        // Check if user is blocked - blocked users are completely logged out
        if ($user->isBlocked()) {
            Auth::logout();

            $message = __('Your account has been blocked. Please contact support for assistance.');

            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 403);
            }

            return redirect()->route('login')->with('error', $message);
        }

        // Suspended users can still access the dashboard but with limited functionality
        // The dashboard will show a suspension message and disable features

        return $next($request);
    }
}
