<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->where('id', '!=', auth()->id()) // Exclude current admin
            ->with('roles');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->appends($request->query());

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for editing a user
     */
    public function show(User $user)
    {
        $user->load(['roles', 'enrollments.program']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Block a user
     */
    public function block(User $user)
    {
        // Prevent blocking admin users
        if ($user->hasRole('admin')) {
            return back()->with('error', __('Cannot block admin users.'));
        }

        // Prevent blocking self
        if ($user->id === auth()->id()) {
            return back()->with('error', __('Cannot block yourself.'));
        }

        $user->block();

        return back()->with('success', __('User has been blocked successfully.'));
    }

    /**
     * Suspend a user
     */
    public function suspend(User $user)
    {
        // Prevent suspending admin users
        if ($user->hasRole('admin')) {
            return back()->with('error', __('Cannot suspend admin users.'));
        }

        // Prevent suspending self
        if ($user->id === auth()->id()) {
            return back()->with('error', __('Cannot suspend yourself.'));
        }

        $user->suspend();

        return back()->with('success', __('User has been suspended successfully.'));
    }

    /**
     * Activate a user
     */
    public function activate(User $user)
    {
        $user->activate();

        return back()->with('success', __('User has been activated successfully.'));
    }

    /**
     * Get user statistics for dashboard
     */
    public function statistics()
    {
        $stats = [
            'total' => User::count(),
            'active' => User::active()->count(),
            'blocked' => User::blocked()->count(),
            'suspended' => User::suspended()->count(),
            'students' => User::role('student')->count(),
            'admins' => User::role('admin')->count(),
        ];

        return response()->json($stats);
    }
}
