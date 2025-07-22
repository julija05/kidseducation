<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Program;
use Illuminate\Http\Request;


class AdminDashboardController extends Controller
{
    public function index()
    {
        $pendingEnrollmentsCount = Enrollment::where('approval_status', 'pending')->count();

        $stats = [
            'totalStudents' => User::role('student')->count(),
            'activePrograms' => Program::where('is_active', true)->count(),
            'activeEnrollments' => Enrollment::where('approval_status', 'approved')
                ->where('status', 'active')
                ->count(),
        ];

        return $this->createView('Admin/AdminDashboard/AdminDashboard', [
            'pendingEnrollmentsCount' => $pendingEnrollmentsCount,
            'stats' => $stats
        ]);
    }
}
