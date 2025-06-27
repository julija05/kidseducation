<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Program;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        $user->assignRole('student');


        event(new Registered($user));

        Auth::login($user);

        if (session('enrollment_program_id')) {
            return redirect()->route('dashboard');
        }


        return redirect(route('dashboard', absolute: false));
    }
}
