<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return $this->createView('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        
        // Debug: Log the validated data
        \Log::info('Profile update validated data:', $validated);
        
        // Generate full name from first and last name
        if (isset($validated['first_name']) && isset($validated['last_name'])) {
            $validated['name'] = trim($validated['first_name'] . ' ' . $validated['last_name']);
        }
        
        // Check if new fields exist in database before trying to save them
        $allowedFields = [];
        $userTable = $user->getTable();
        $columns = \Schema::getColumnListing($userTable);
        
        foreach ($validated as $key => $value) {
            if (in_array($key, $columns)) {
                $allowedFields[$key] = $value;
            }
        }
        
        $user->fill($allowedFields);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // If language preference is being updated, mark as selected
        if (isset($validated['language_preference']) && $validated['language_preference']) {
            $user->language_selected = true;
            
            // Update session locale for immediate effect
            Session::put('locale', $validated['language_preference']);
            
            // Debug: Log the language change
            \Log::info('Language preference updated:', [
                'user_id' => $user->id,
                'old_language' => $user->getOriginal('language_preference'),
                'new_language' => $validated['language_preference'],
                'session_locale' => Session::get('locale')
            ]);
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Update the user's theme preference.
     */
    public function updateTheme(Request $request)
    {
        $request->validate([
            'theme' => 'required|string|in:default,purple,green,orange,teal,dark'
        ]);

        $user = $request->user();
        
        // Check if theme_preference column exists before trying to save
        $userTable = $user->getTable();
        $columns = \Schema::getColumnListing($userTable);
        
        if (in_array('theme_preference', $columns)) {
            $user->theme_preference = $request->theme;
            $user->save();
            return response()->json(['success' => true, 'saved_to_db' => true]);
        } else {
            // If database field doesn't exist yet, just return success
            // The frontend will continue to use localStorage
            return response()->json(['success' => true, 'saved_to_db' => false, 'message' => 'Database field not available, using localStorage']);
        }
    }

    /**
     * Update the user's avatar preference.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|string|in:default,student,book,star,rocket,brain,lightbulb,trophy,puzzle'
        ]);

        $user = $request->user();
        
        // Check if avatar_preference column exists before trying to save
        $userTable = $user->getTable();
        $columns = \Schema::getColumnListing($userTable);
        
        if (in_array('avatar_preference', $columns)) {
            $user->avatar_preference = $request->avatar;
            $user->save();
            return response()->json(['success' => true, 'saved_to_db' => true]);
        } else {
            // If database field doesn't exist yet, just return success
            // The frontend will continue to use localStorage
            return response()->json(['success' => true, 'saved_to_db' => false, 'message' => 'Database field not available, using localStorage']);
        }
    }
}
