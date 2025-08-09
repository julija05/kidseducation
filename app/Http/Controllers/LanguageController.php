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

        // If user is authenticated and has a language preference, 
        // we should update their preference instead of just session
        if (Auth::check()) {
            $user = Auth::user();
            
            // If user already has a language preference, update it
            if ($user->language_preference) {
                $user->update([
                    'language_preference' => $locale
                ]);
            } else {
                // User doesn't have a preference set, just update session for this session only
                Session::put('locale', $locale);
            }
        } else {
            // Guest user - store in session only
            Session::put('locale', $locale);
        }

        // Redirect back to the previous page
        return redirect()->back();
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