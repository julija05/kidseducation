<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class MentorRegisteredUserController extends Controller
{
    /**
     * Display the mentor registration view.
     */
    public function create(Request $request): Response
    {
        // Get all available programs for mentor enrollment
        $programs = Program::where('is_active', true)
            ->select('id', 'name', 'slug', 'description', 'icon', 'color')
            ->get();

        return Inertia::render('Auth/MentorRegister', [
            'programs' => $programs,
        ]);
    }

    /**
     * Handle an incoming mentor registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            'bio' => 'nullable|string|max:1000',
            'expertise' => 'nullable|string|max:500',
        ], [
            'email.unique' => 'This email address is already registered.',
            'password.confirmed' => 'The password confirmation does not match.',
        ]);

        $user = User::create([
            'name' => trim($request->first_name.' '.$request->last_name),
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'language_preference' => app()->getLocale(),
            'language_selected' => true,
        ]);

        // Assign mentor role
        $user->assignRole('mentor');

        event(new Registered($user));

        Auth::login($user);

        // Redirect to mentor dashboard
        return redirect()->route('mentor.dashboard')->with('welcome', true);
    }
}
