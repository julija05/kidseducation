<?php

namespace App\Http\Controllers;

use App\Models\ChildProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParentChildProfileController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Parent/ChildProfiles/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'child_name' => ['required', 'string', 'max:191'],
            'age' => ['nullable', 'integer', 'min:0', 'max:25'],
            'grade_class' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $request->user()->childProfiles()->create([
            'child_name' => $validated['child_name'],
            'age' => $validated['age'] ?? null,
            'grade_class' => $validated['grade_class'] ?? null,
            'status' => ChildProfile::STATUS_PENDING,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('parent.dashboard')
            ->with('success', 'Child profile created successfully.');
    }
}
