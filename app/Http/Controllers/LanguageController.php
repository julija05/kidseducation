<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;

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

        // Store locale in session
        Session::put('locale', $locale);

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

        // Return back to dashboard with success message
        return redirect()->back()->with('success', 'Language preference updated successfully');
    }
}