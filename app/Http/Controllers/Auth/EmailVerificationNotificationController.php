<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            Log::info("User {$user->email} tried to resend verification but is already verified");

            return back()->with('status', 'already-verified')->with('message', 'Your email is already verified!');
        }

        try {
            Log::info("Sending verification email to {$user->email}");
            $user->sendEmailVerificationNotification();
            Log::info("Verification email sent successfully to {$user->email}");
        } catch (\Exception $e) {
            Log::error("Failed to send verification email to {$user->email}: ".$e->getMessage());

            return back()->withErrors(['email' => 'Failed to send verification email. Please try again.']);
        }

        return back()->with('status', 'verification-link-sent');
    }
}
