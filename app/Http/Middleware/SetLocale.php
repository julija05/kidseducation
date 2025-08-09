<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Priority order: User preference > URL parameter > Session > Default
        $locale = null;
        $userHasPreference = false;
        
        // Check if user is authenticated and has a language preference
        if (Auth::check() && Auth::user()->language_preference) {
            $locale = Auth::user()->language_preference;
            $userHasPreference = true;
        }
        
        // Fall back to URL parameter, session, or default
        $locale = $locale 
            ?? $request->get('locale') 
            ?? Session::get('locale') 
            ?? config('app.locale');
        
        // Validate locale
        if (!in_array($locale, config('app.supported_locales', ['en', 'mk']))) {
            $locale = config('app.locale');
        }
        
        // Set locale
        App::setLocale($locale);
        
        // Only update session if user doesn't have a saved preference
        // This prevents overriding user's saved language preference
        if (!$userHasPreference) {
            Session::put('locale', $locale);
        }
        
        return $next($request);
    }
}