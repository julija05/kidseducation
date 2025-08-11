<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LanguageController extends Controller
{
    /**
     * Switch the application language
     */
    public function switch(Request $request, $locale)
    {
        \Log::info('=== LANGUAGE SWITCH START ===', [
            'requested_locale' => $locale,
            'current_session_locale' => Session::get('locale'),
            'session_id' => $request->session()->getId(),
            'referer' => $request->header('referer'),
            'user_agent' => $request->header('user-agent')
        ]);

        // Validate locale
        if (!in_array($locale, config('app.supported_locales', ['en', 'mk']))) {
            \Log::error('Invalid locale requested', ['locale' => $locale]);
            abort(404);
        }

        // Store locale in session
        Session::put('locale', $locale);
        Session::save(); // Force save
        
        \Log::info('Language switched successfully', [
            'new_locale' => $locale,
            'session_after_save' => Session::get('locale'),
            'session_id' => $request->session()->getId()
        ]);

        // Redirect back with cache busting to force fresh page load
        $redirectUrl = $request->header('referer', '/');
        $separator = strpos($redirectUrl, '?') !== false ? '&' : '?';
        $redirectUrl .= $separator . 'v=' . time();
        
        return redirect($redirectUrl)
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
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