<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChildProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminChildProfileController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ChildProfile::query()
            ->with('parent:id,name,email')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('child_name', 'like', "%{$search}%")
                    ->orWhere('grade_class', 'like', "%{$search}%")
                    ->orWhereHas('parent', function ($parentQuery) use ($search) {
                        $parentQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        return Inertia::render('Admin/ChildProfiles/Index', [
            'childProfiles' => $query->paginate(20)->appends($request->query()),
            'filters' => $request->only(['search', 'status']),
            'statuses' => ChildProfile::STATUSES,
        ]);
    }

    public function show(ChildProfile $childProfile): Response
    {
        $childProfile->load('parent:id,name,email,first_name,last_name');

        return Inertia::render('Admin/ChildProfiles/Show', [
            'childProfile' => $childProfile,
        ]);
    }
}
