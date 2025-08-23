<?php

namespace App\Http\Controllers;

use App\Http\Requests\DemoRegistrationRequest;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use App\Services\EnrollmentService;
use App\Services\LessonService;
use App\Services\ResourceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class DemoController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService,
        private LessonService $lessonService,
        private ResourceService $resourceService
    ) {}

    /**
     * Show demo access form for a specific program
     */
    public function showDemoForm($programSlug)
    {
        $program = Program::where('slug', $programSlug)->firstOrFail();

        // If user is already logged in, handle demo logic
        if (Auth::check()) {
            $user = Auth::user();

            // Check if user already has demo access for this program
            if ($user->hasDemoAccess() && $user->demo_program_slug === $programSlug) {
                return redirect()->route('demo.dashboard', $programSlug);
            }

            // Check if user has demo access for a different program
            if ($user->hasDemoAccess() && $user->demo_program_slug !== $programSlug) {
                return redirect()->route('dashboard')
                    ->with('error', 'You can only have one demo active at a time. Please complete or expire your current demo before starting a new one.');
            }

            // Start demo for logged-in user
            $user->startDemo($programSlug);

            return redirect()->route('demo.dashboard', $programSlug);
        }

        return Inertia::render('Demo/Access', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'translated_name' => $program->translated_name,
                'slug' => $program->slug,
                'description' => $program->description,
                'translated_description' => $program->translated_description,
                'icon' => $program->icon,
                'color' => $program->color,
                'lightColor' => $program->light_color,
                'borderColor' => $program->border_color,
                'textColor' => $program->text_color,
            ],
        ]);
    }

    /**
     * Create regular account and start demo access
     */
    public function createDemoAccount(DemoRegistrationRequest $request, $programSlug)
    {
        // Log the request for debugging
        \Log::info('Demo account creation attempt', [
            'program_slug' => $programSlug,
            'user_agent' => $request->header('User-Agent'),
            'ip' => $request->ip(),
            'has_csrf' => $request->hasHeader('X-CSRF-TOKEN') || $request->has('_token'),
            'content_type' => $request->header('Content-Type'),
        ]);

        // Get validated data from the form request
        $validated = $request->validated();

        $program = Program::where('slug', $programSlug)->firstOrFail();

        try {
            // Create new user account with demo access
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'name' => $validated['first_name'].' '.$validated['last_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'language_preference' => app()->getLocale(),
                'language_selected' => true,
                'email_verified_at' => now(), // Auto-verify demo accounts
            ]);

            // Assign student role
            $user->assignRole('student');

            // Start demo access
            $user->startDemo($programSlug);

            // Login the user
            Auth::login($user);

            \Log::info('Demo account created successfully', [
                'user_id' => $user->id,
                'program_slug' => $programSlug,
                'email' => $user->email,
            ]);

            return redirect()->route('demo.dashboard', $programSlug)
                ->with('success', 'Welcome! Your demo account has been created.');

        } catch (\Exception $e) {
            \Log::error('Failed to create demo user', [
                'program_slug' => $programSlug,
                'email' => $validated['email'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['email' => 'Failed to create demo account. Please try again or contact support.'])
                ->withInput($request->except(['password', 'password_confirmation']));
        }
    }

    /**
     * Show demo dashboard
     */
    public function dashboard($programSlug)
    {
        $user = Auth::user();

        // Check if user has regular demo access
        $hasRegularDemoAccess = $user->hasDemoAccess() && $user->demo_program_slug === $programSlug;

        // Check if user has pending enrollment with demo access
        $hasPendingEnrollmentDemoAccess = $user->enrollments()->where('approval_status', 'pending')->exists()
                                        && $user->demo_program_slug === $programSlug;

        // Log debug information
        \Log::info('Demo dashboard access attempt', [
            'user_id' => $user->id,
            'program_slug' => $programSlug,
            'user_demo_program_slug' => $user->demo_program_slug,
            'has_regular_demo_access' => $hasRegularDemoAccess,
            'has_pending_enrollment_demo_access' => $hasPendingEnrollmentDemoAccess,
            'pending_enrollments_count' => $user->enrollments()->where('approval_status', 'pending')->count(),
            'demo_expires_at' => $user->demo_expires_at,
            'is_demo_expired' => $user->isDemoExpired(),
        ]);

        // Verify user has some form of demo access for the correct program
        if (! $hasRegularDemoAccess && ! $hasPendingEnrollmentDemoAccess) {
            \Log::info('Demo dashboard access denied - no valid access', [
                'user_id' => $user->id,
                'program_slug' => $programSlug,
            ]);

            // If demo expired and no pending enrollment, show expired page
            if ($user->isDemoExpired() && $user->demo_program_slug === $programSlug) {
                return redirect()->route('demo.expired');
            }

            return redirect()->route('programs.index');
        }

        \Log::info('Demo dashboard access granted', [
            'user_id' => $user->id,
            'program_slug' => $programSlug,
            'access_type' => $hasRegularDemoAccess ? 'regular_demo' : 'pending_enrollment_demo',
        ]);

        $program = $user->getDemoProgram();
        if (! $program) {
            return redirect()->route('programs.index');
        }

        // Calculate days remaining
        if ($hasPendingEnrollmentDemoAccess && ! $hasRegularDemoAccess) {
            // Users with pending enrollments get unlimited demo access
            $daysRemaining = 999;
        } else {
            $daysRemaining = $user->getDemoRemainingDays();
        }

        // Get the first lesson of the program
        $firstLesson = $program->lessons()
            ->where('level', 1)
            ->where('order_in_level', 1)
            ->where('is_active', true)
            ->first();

        $formattedLesson = null;
        if ($firstLesson) {
            // Get resources for this lesson in user's language
            $currentLocale = app()->getLocale();
            $resources = $firstLesson->resources()
                ->where('language', $currentLocale)
                ->orderBy('order')
                ->get()
                ->map(fn ($resource) => $this->resourceService->formatResourceForFrontend($resource));

            $formattedLesson = [
                'id' => $firstLesson->id,
                'title' => $firstLesson->translated_title,
                'description' => $firstLesson->translated_description,
                'level' => $firstLesson->level,
                'order_in_level' => $firstLesson->order_in_level,
                'content_type' => $firstLesson->content_type,
                'content_url' => $firstLesson->content_url,
                'content_body' => $firstLesson->content_body,
                'duration_minutes' => $firstLesson->duration_minutes,
                'is_locked' => false, // First lesson is always unlocked in demo
                'resources' => $resources->toArray(),
            ];
        }

        // Get other lessons to show as locked
        $otherLessons = $program->lessons()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->where('level', '>', 1)
                    ->orWhere(function ($subQuery) {
                        $subQuery->where('level', 1)
                            ->where('order_in_level', '>', 1);
                    });
            })
            ->orderBy('level')
            ->orderBy('order_in_level')
            ->get()
            ->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->translated_title,
                    'description' => $lesson->translated_description,
                    'level' => $lesson->level,
                    'order_in_level' => $lesson->order_in_level,
                    'duration_minutes' => $lesson->duration_minutes,
                    'is_locked' => true,
                ];
            });

        return Inertia::render('Demo/Dashboard', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'translated_name' => $program->translated_name,
                'slug' => $program->slug,
                'description' => $program->description,
                'translated_description' => $program->translated_description,
                'icon' => $program->icon,
                'color' => $program->color,
                'lightColor' => $program->light_color,
                'borderColor' => $program->border_color,
                'textColor' => $program->text_color,
            ],
            'firstLesson' => $formattedLesson,
            'lockedLessons' => $otherLessons,
            'demoExpiresAt' => $hasPendingEnrollmentDemoAccess && ! $hasRegularDemoAccess ? null : $user->demo_expires_at,
            'daysRemaining' => $daysRemaining,
        ]);
    }

    /**
     * Show demo expired page
     */
    public function expired()
    {
        return Inertia::render('Demo/Expired');
    }

    /**
     * Convert demo to regular enrollment
     */
    public function convertToEnrollment(Request $request, $programSlug)
    {
        $user = Auth::user();

        // Check if user has regular demo access
        $hasRegularDemoAccess = $user->hasDemoAccess() && $user->demo_program_slug === $programSlug;

        // Check if user has pending enrollment with demo access
        $hasPendingEnrollmentDemoAccess = $user->enrollments()->where('approval_status', 'pending')->exists()
                                        && $user->demo_program_slug === $programSlug;

        // Verify user has some form of demo access for the correct program
        if (! $hasRegularDemoAccess && ! $hasPendingEnrollmentDemoAccess) {
            return redirect()->route('programs.index');
        }

        // If user already has a pending enrollment, redirect to dashboard
        if ($hasPendingEnrollmentDemoAccess) {
            return redirect()->route('dashboard')
                ->with('error', 'You already have a pending enrollment for this program.');
        }

        $program = $user->getDemoProgram();
        if (! $program) {
            return redirect()->route('programs.index');
        }

        // Clear demo access (user keeps their account but loses demo access)
        $user->update([
            'demo_expires_at' => now(), // Expire demo immediately
        ]);

        // Create enrollment directly
        try {
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'program_id' => $program->id,
                'enrolled_at' => now(),
                'status' => 'paused', // Will become active after approval
                'approval_status' => 'pending',
                'progress' => 0,
            ]);

            \Log::info('Demo user converted to enrollment', [
                'enrollment_id' => $enrollment->id,
                'user_id' => $user->id,
                'program_id' => $program->id,
                'converted_from_demo' => true,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to create enrollment from demo', [
                'user_id' => $user->id,
                'program_id' => $program->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to create enrollment. Please try again.');
        }

        return redirect()->route('dashboard')
            ->with('success', 'Welcome! Your enrollment has been submitted for approval.');
    }

    /**
     * Logout from demo account
     */
    public function logout()
    {
        Auth::logout();

        return redirect()->route('programs.index');
    }
}
