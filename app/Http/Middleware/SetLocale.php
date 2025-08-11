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

        // Priority order: User preference > URL parameter > Session > Default
        $locale = null;
        
        // Check if user is authenticated and has a language preference
        if (Auth::check() && Auth::user()->language_preference) {
            $locale = Auth::user()->language_preference;
            $debugInfo['source'] = 'user_preference';
            $debugInfo['user_preference'] = $locale;
        }
        
        // Fall back to URL parameter, session, or default
        if (!$locale) {
            $urlLocale = $request->get('locale');
            $sessionLocale = $request->hasSession() ? Session::get('locale') : null;
            $configLocale = config('app.locale');
            
            $debugInfo['url_locale'] = $urlLocale;
            $debugInfo['session_locale'] = $sessionLocale;
            $debugInfo['config_locale'] = $configLocale;
            
            $locale = $urlLocale ?? $sessionLocale ?? $configLocale;
            
            if ($urlLocale) $debugInfo['source'] = 'url_parameter';
            elseif ($sessionLocale) $debugInfo['source'] = 'session';
            else $debugInfo['source'] = 'config_default';
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