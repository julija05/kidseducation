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
        \Log::info('=== LANGUAGE SET PREFERENCE START ===', [
            'user_id' => Auth::id(),
            'request_data' => $request->all(),
            'current_locale' => app()->getLocale(),
            'session_locale' => Session::get('locale'),
            'user_current_preference' => Auth::user()?->language_preference,
            'url' => $request->url(),
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'accept' => $request->header('Accept'),
            'user_agent' => $request->header('User-Agent'),
            'is_inertia' => $request->header('X-Inertia'),
        ]);

        try {
            \Log::info('Starting validation...');
            
            $validated = $request->validate([
                'language' => 'required|string|in:en,mk',
                'first_time' => 'boolean'
            ]);

            \Log::info('Validation passed', ['validated' => $validated]);

            $user = Auth::user();
            
            if (!$user) {
                \Log::error('User not authenticated when trying to set language preference');
                abort(401, 'Unauthorized');
            }

            \Log::info('Updating user language preference', [
                'user_id' => $user->id,
                'old_preference' => $user->language_preference,
                'new_preference' => $request->language,
            ]);

            // Update user's language preference
            $user->update([
                'language_preference' => $request->language,
                'language_selected' => true
            ]);

            // Also store in session for immediate effect
            Session::put('locale', $request->language);
            Session::save(); // Force session save

            \Log::info('Language preference updated successfully', [
                'user_id' => $user->id,
                'new_preference' => $user->fresh()->language_preference,
                'session_locale' => Session::get('locale'),
            ]);

            // Return Inertia response to preserve scroll position
            return back()->with('success', 'Language preference updated successfully');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
                'user_id' => Auth::id(),
                'request_data' => $request->all(),
            ]);
            
            throw $e; // Let Laravel handle validation errors properly
            
        } catch (\Exception $e) {
            \Log::error('Error updating language preference', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'request_data' => $request->all(),
            ]);
            
            return back()->withErrors(['language' => 'Failed to update language preference. Please try again.'])->withInput();
        }
    }
}