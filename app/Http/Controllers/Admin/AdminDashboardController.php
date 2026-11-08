<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;

class AdminDashboardController extends Controller
{
    /**
     * Number of most recent enrollments to show in the dashboard activity list.
     */
    private const RECENT_ENROLLMENTS_LIMIT = 5;

    /**
     * Render the admin dashboard with high-level platform stats, the pending
     * enrollments alert, and a short list of the most recent enrollments.
     */
    public function index()
    {
        // Enrollments awaiting admin approval — drives the alert banner at the top.
        $pendingEnrollmentsCount = Enrollment::where('approval_status', 'pending')->count();

        // High-level platform stats shown in the summary cards.
        $stats = [
            'totalStudents' => User::role('student')->count(),
            'activePrograms' => Program::where('is_active', true)->count(),
            'activeEnrollments' => Enrollment::where('approval_status', 'approved')
                ->where('status', 'active')
                ->count(),
        ];

        // Most recent enrollments for the activity list (read-only, eager-loaded to avoid N+1).
        $recentEnrollments = Enrollment::with(['user:id,name', 'program:id,name'])
            ->latest()
            ->take(self::RECENT_ENROLLMENTS_LIMIT)
            ->get()
            ->map(fn (Enrollment $enrollment) => [
                'id' => $enrollment->id,
                'student_name' => $enrollment->user?->name ?? 'Unknown student',
                'program_name' => $enrollment->program?->name ?? '—',
                'status' => $enrollment->approval_status,
            ]);

        return $this->createView('Admin/AdminDashboard/AdminDashboard', [
            'pendingEnrollmentsCount' => $pendingEnrollmentsCount,
            'stats' => $stats,
            'recentEnrollments' => $recentEnrollments,
        ]);
    }
}
