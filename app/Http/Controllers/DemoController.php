<?php

namespace App\Http\Controllers;

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
            ]
        ]);
    }

    /**
     * Create regular account and start demo access
     */
    public function createDemoAccount(Request $request, $programSlug)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $program = Program::where('slug', $programSlug)->firstOrFail();

        // Create new user account with demo access
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'name' => $request->first_name . ' ' . $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
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

        return redirect()->route('demo.dashboard', $programSlug);
    }

    /**
     * Show demo dashboard
     */
    public function dashboard($programSlug)
    {
        $user = Auth::user();
        
        // Verify user has demo access for the correct program
        if (!$user->hasDemoAccess() || $user->demo_program_slug !== $programSlug) {
            // If demo expired, show expired page
            if ($user->isDemoExpired() && $user->demo_program_slug === $programSlug) {
                return redirect()->route('demo.expired');
            }
            return redirect()->route('programs.index');
        }

        $program = $user->getDemoProgram();
        if (!$program) {
            return redirect()->route('programs.index');
        }

        // Calculate days remaining
        $daysRemaining = $user->getDemoRemainingDays();

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
                ->map(fn($resource) => $this->resourceService->formatResourceForFrontend($resource));

            $formattedLesson = [
                'id' => $firstLesson->id,
                'title' => $firstLesson->title,
                'description' => $firstLesson->description,
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
            ->where(function($query) {
                $query->where('level', '>', 1)
                      ->orWhere(function($subQuery) {
                          $subQuery->where('level', 1)
                                   ->where('order_in_level', '>', 1);
                      });
            })
            ->orderBy('level')
            ->orderBy('order_in_level')
            ->get()
            ->map(function($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'description' => $lesson->description,
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
            'demoExpiresAt' => $user->demo_expires_at,
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
        
        // Verify user has demo access for the correct program
        if (!$user->hasDemoAccess() || $user->demo_program_slug !== $programSlug) {
            return redirect()->route('programs.index');
        }

        $program = $user->getDemoProgram();
        if (!$program) {
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
                'converted_from_demo' => true
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to create enrollment from demo', [
                'user_id' => $user->id,
                'program_id' => $program->id,
                'error' => $e->getMessage()
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