<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
        $debugInfo = [
            'url' => $request->url(),
            'method' => $request->method(),
            'session_id' => $request->hasSession() ? $request->session()->getId() : 'NO_SESSION',
            'user_authenticated' => Auth::check(),
        ];

        // Unified locale detection for consistent user experience
        $locale = null;
        $urlLocale = $request->get('locale');
        $sessionLocale = $request->hasSession() ? Session::get('locale') : null;
        $configLocale = config('app.locale');
        
        $debugInfo['url_locale'] = $urlLocale;
        $debugInfo['session_locale'] = $sessionLocale;
        $debugInfo['config_locale'] = $configLocale;
        
        // Priority 1: URL parameter (for explicit language switching)
        if ($urlLocale && in_array($urlLocale, config('app.supported_locales', ['en', 'mk']))) {
            $locale = $urlLocale;
            $debugInfo['source'] = 'url_parameter';
            
            // Update authenticated user's preference for consistency
            if (Auth::check() && Auth::user()->language_preference !== $urlLocale) {
                Auth::user()->update(['language_preference' => $urlLocale]);
                $debugInfo['updated_user_preference'] = true;
            }
        }
        // Priority 2: Authenticated user's saved preference
        elseif (Auth::check() && Auth::user()->language_preference) {
            $locale = Auth::user()->language_preference;
            $debugInfo['source'] = 'user_preference';
            $debugInfo['user_preference'] = $locale;
        }
        // Priority 3: Session locale (for guest users)
        elseif ($sessionLocale) {
            $locale = $sessionLocale;
            $debugInfo['source'] = 'session';
        }
        // Priority 4: Default config locale
        else {
            $locale = $configLocale;
            $debugInfo['source'] = 'config_default';
        }
        
        // Validate locale
        if (!in_array($locale, config('app.supported_locales', ['en', 'mk']))) {
            $debugInfo['invalid_locale'] = $locale;
            $locale = config('app.locale');
            $debugInfo['source'] = 'fallback_after_invalid';
        }
        
        $debugInfo['final_locale'] = $locale;
        
        // Set locale
        App::setLocale($locale);
        if ($request->hasSession()) {
            Session::put('locale', $locale);
            $debugInfo['session_updated'] = true;
        } else {
            $debugInfo['session_updated'] = false;
        }
        
        \Log::info('SetLocale Middleware', $debugInfo);
        
        return $next($request);
    }
}