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

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        // Check if there's a program enrollment intent
        $programId = $request->query('program');
        $program = null;

        if ($programId) {
            $program = Program::find($programId);
            if ($program) {
                // Store in session for after registration
                session(['pending_enrollment_program_id' => $program->id]);
            }
        }

        return Inertia::render('Auth/Register', [
            'enrollmentProgram' => $program ? [
                'id' => $program->id,
                'name' => $program->name,
                'description' => $program->description,
                'price' => $program->price,
            ] : null,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
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
        $user->assignRole('student');

        event(new Registered($user));

        Auth::login($user);

        // Redirect to dashboard where user can choose to try demos
        return redirect()->route('dashboard')->with('welcome', true);
    }
}
