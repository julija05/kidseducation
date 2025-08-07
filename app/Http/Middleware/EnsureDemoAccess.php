<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureDemoAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $next($request);
        }

        // If user has active demo access
        if ($user->hasDemoAccess()) {
            // Allow access to demo routes
            if ($request->routeIs('demo.*')) {
                return $next($request);
            }

            // Allow access to lesson routes only for their demo lesson
            if ($request->routeIs('lessons.*')) {
                $lesson = $request->route('lesson');
                if ($lesson && $user->canAccessLessonInDemo($lesson)) {
                    return $next($request);
                }
                
                // Redirect to demo dashboard if trying to access other lessons
                return redirect()->route('demo.dashboard', $user->demo_program_slug)
                    ->with('error', 'Demo access is limited to the first lesson only.');
            }

            // Allow access to lesson-resources routes for their demo lesson resources
            if ($request->routeIs('lesson-resources.*')) {
                $lessonResource = $request->route('lessonResource');
                if ($lessonResource && $user->canAccessLessonInDemo($lessonResource->lesson)) {
                    return $next($request);
                }
                
                // Block access to other lesson resources
                return redirect()->route('demo.dashboard', $user->demo_program_slug)
                    ->with('error', 'Demo access is limited to the first lesson resources only.');
            }

            // Block access to specific program dashboards (student.programs.*)
            if ($request->routeIs('student.programs.*')) {
                return redirect()->route('programs.index')
                    ->with('error', 'Please enroll in a program to access the program dashboard.');
            }

            // Allow enrollment in other programs while having demo access
            if ($request->routeIs('programs.enroll')) {
                return $next($request);
            }

            // Block access to enrollment-specific routes (but not the enrollment action itself)
            if ($request->routeIs(['enrollments.*', 'quiz.*', 'lesson-resources.*'])) {
                return redirect()->route('programs.index')
                    ->with('error', 'Please enroll in a program to access this feature.');
            }

            // Allow access to general routes (dashboard, programs.index, programs.show, profile, etc.)
            // Demo users can see the main dashboard, browse programs, view program details, and manage their profile
        }

        // If user has any enrollments, they shouldn't access demo routes
        if ($request->routeIs('demo.*') && $user->enrollments()->exists()) {
            return redirect()->route('dashboard');
        }

        // If user has expired demo access and trying to access demo routes
        if ($user->isDemoExpired() && $request->routeIs('demo.*')) {
            return redirect()->route('demo.expired');
        }

        // If user doesn't have demo access but trying to access demo routes
        if (!$user->hasDemoAccess() && !$user->isDemoExpired() && $request->routeIs('demo.*')) {
            // Allow access to demo access route (to start demo)
            if ($request->routeIs('demo.access')) {
                return $next($request);
            }
            
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}