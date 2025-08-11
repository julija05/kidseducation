<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LanguageController extends Controller
{
    /**
     * Switch the application language
     */
    public function switch(Request $request, $locale)
    {
        // Validate locale
        if (!in_array($locale, config('app.supported_locales', ['en', 'mk']))) {
            abort(404);
        }

        // If user is authenticated, update their preference AND session
        if (Auth::check()) {
            $user = Auth::user();
            
            // Always update user's language preference when they explicitly switch
            $user->update([
                'language_preference' => $locale,
                'language_selected' => true
            ]);
            
            // Also update session for immediate effect
            Session::put('locale', $locale);
        } else {
            // Guest user - store in session only
            Session::put('locale', $locale);
        }

        // Get the referer URL or fall back to home
        $redirectUrl = $request->header('referer', '/');
        
        // Add cache busting parameter to force fresh page load
        $separator = strpos($redirectUrl, '?') !== false ? '&' : '?';
        $redirectUrl .= $separator . 'lang_switched=' . $locale . '&t=' . time();
        
        // For POST requests (from our aggressive form), use a full page reload response
        if ($request->isMethod('POST')) {
            return response()->view('language-switch-redirect', [
                'redirectUrl' => $redirectUrl,
                'locale' => $locale,
                'localeNames' => [
                    'en' => 'English',
                    'mk' => 'Македонски'
                ]
            ])->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
        }
        
        // For GET requests, use normal redirect with no-cache headers
        return redirect($redirectUrl)
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0')
            ->header('Refresh', "0; url=$redirectUrl");
    }

    /**
     * Set user language preference
     */
    public function setPreference(Request $request)
    {
        $request->validate([
            'language' => 'required|string|in:en,mk',
            'first_time' => 'boolean'
        ]);

        $user = Auth::user();
        
        if (!$user) {
            abort(401, 'Unauthorized');
        }

        // Update user's language preference
        $user->update([
            'language_preference' => $request->language,
            'language_selected' => true
        ]);

        // Also store in session for immediate effect
        Session::put('locale', $request->language);

        // Return Inertia response to preserve scroll position
        return back()->with('success', 'Language preference updated successfully');
    }
}