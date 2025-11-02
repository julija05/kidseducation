<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Clear any intended URL that might point to admin routes if user is not admin
        $intendedUrl = $request->session()->get('url.intended');

        if ($user->hasRole('admin')) {
            // Admin users can be redirected to their intended URL or admin dashboard
            return redirect()->intended(route('admin.dashboard'));
        } elseif ($user->hasRole('mentor')) {
            // Mentor users go to mentor dashboard
            if ($intendedUrl && (str_contains($intendedUrl, '/admin/') || str_contains($intendedUrl, '/dashboard'))) {
                $request->session()->forget('url.intended');
            }
            return redirect()->route('mentor.dashboard');
        } else {
            // For non-admin/non-mentor users, clear any intended URL that points to admin routes
            if ($intendedUrl && str_contains($intendedUrl, '/admin/')) {
                $request->session()->forget('url.intended');
            }

            // Students go to student dashboard
            return redirect()->route('dashboard');
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
