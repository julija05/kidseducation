<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\EnrollmentService;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService
    ) {}

    /**
     * Display the student's "My Progress" page: overall progress, the progress
     * of every level in their active program, and their earned points.
     */
    public function index()
    {
        $user = Auth::user();

        // Suspended accounts should not reach progress/program content.
        if ($user->isSuspended()) {
            return redirect()->route('dashboard')
                ->with('error', 'Your account is suspended. Please contact admin@abacoding.com to resolve this issue.');
        }

        // Find the student's active/completed approved enrollment. This mirrors
        // the dashboard query so both views stay in sync.
        $enrollment = $user->enrollments()
            ->with('program')
            ->whereIn('status', ['active', 'completed'])
            ->where('approval_status', 'approved')
            ->where('access_blocked', false)
            ->orderByRaw("CASE status WHEN 'active' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END")
            ->first();

        // Without an approved enrollment there is no progress to show.
        if (! $enrollment || ! $enrollment->program) {
            return redirect()->route('dashboard')
                ->with('error', 'Enroll in a program to track your progress.');
        }

        // Reuse the dashboard formatter so overall progress, per-level progress
        // and points all match what the dashboard already shows.
        $enrolledProgram = $this->enrollmentService->formatEnrollmentForDashboard($enrollment);

        return $this->createView('Dashboard/Progress/Index', [
            'enrolledProgram' => $enrolledProgram,
        ]);
    }
}
