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
        // Priority order: URL parameter > User preference > Session > Default
        $locale = null;
        
        // Check URL parameter first (for immediate language switching)
        if ($request->has('lang')) {
            $locale = $request->get('lang');
        }
        // Then check if user is authenticated and has a language preference
        elseif (Auth::check() && Auth::user()->language_preference) {
            $locale = Auth::user()->language_preference;
        }
        // Fall back to session or default
        else {
            $locale = Session::get('locale') ?? config('app.locale');
        }
        
        // Validate locale
        if (!in_array($locale, config('app.supported_locales', ['en', 'mk']))) {
            $locale = config('app.locale');
        }
        
        // Set locale
        App::setLocale($locale);
        
        // Always update session to reflect current locale
        Session::put('locale', $locale);
        
        return $next($request);
    }
}