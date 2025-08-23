<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerifyEmailController extends Controller
{
    /**
     * Mark the user's email address as verified.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $user = User::findOrFail($request->route('id'));

        // Validate the signature and hash
        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return redirect()->route('login')->with('error', 'Invalid verification link.');
        }

        // Check if signature is valid
        if (! $request->hasValidSignature()) {
            return redirect()->route('login')->with('error', 'Verification link has expired.');
        }

        // If user is already verified
        if ($user->hasVerifiedEmail()) {
            // Log them in if they're not already authenticated
            if (! Auth::check()) {
                Auth::login($user);
            }

            // Check if this is a demo account
            if ($user->isDemoAccount()) {
                return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
            }

            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        }

        // Mark as verified
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // Log the user in automatically after verification
        if (! Auth::check()) {
            Auth::login($user);
        }

        // Check if this is a demo account
        if ($user->isDemoAccount()) {
            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        }

        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }
}
