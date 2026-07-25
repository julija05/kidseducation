<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\AchievementService;
use App\Services\EnrollmentService;
use Illuminate\Support\Facades\Auth;

class AchievementController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService,
        private AchievementService $achievementService
    ) {}

    /**
     * Display the student's Achievements page: badges earned across skill
     * mastery, practice and homework, plus a preview of upcoming categories.
     */
    public function index()
    {
        $user = Auth::user();

        // Suspended accounts should not reach program content.
        if ($user->isSuspended()) {
            return redirect()->route('dashboard')
                ->with('error', 'Your account is suspended. Please contact admin@abacoding.com to resolve this issue.');
        }

        // Resolve the active/completed approved enrollment (mirrors the other
        // student pages so every view stays in sync).
        $enrollment = $user->enrollments()
            ->with('program')
            ->whereIn('status', ['active', 'completed'])
            ->where('approval_status', 'approved')
            ->where('access_blocked', false)
            ->orderByRaw("CASE status WHEN 'active' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END")
            ->first();

        // Without an approved enrollment there are no achievements to show yet.
        if (! $enrollment || ! $enrollment->program) {
            return redirect()->route('dashboard')
                ->with('error', 'Enroll in a program to start earning achievements.');
        }

        $enrolledProgram = $this->enrollmentService->formatEnrollmentForDashboard($enrollment);
        $achievements = $this->achievementService->buildForStudent($user, $enrollment);

        return $this->createView('Dashboard/Achievements/Index', [
            'enrolledProgram' => $enrolledProgram,
            'summary' => $achievements['summary'],
            'categories' => $achievements['categories'],
        ]);
    }
}
