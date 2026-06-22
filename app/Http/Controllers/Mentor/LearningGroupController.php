<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\LearningGroup;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class LearningGroupController extends Controller
{
    public function index()
    {
        $mentor = Auth::user();

        $groups = LearningGroup::with(['program:id,name'])
            ->where('mentor_id', $mentor->id)
            ->latest('start_date')
            ->get()
            ->map(fn (LearningGroup $group) => [
                'id' => $group->id,
                'name' => $group->name,
                'program' => $group->program,
                'start_date' => $group->start_date->toDateString(),
                'end_date' => $group->end_date->toDateString(),
                'status' => $group->status,
                'is_active' => $group->isActive(),
                'max_students' => $group->max_students,
                'description' => $group->description,
            ]);

        return $this->createView('Mentor/LearningGroups/Index', [
            'groups' => $groups,
        ]);
    }

    public function create()
    {
        return $this->createView('Mentor/LearningGroups/Create', [
            'programs' => $this->mentorPrograms(),
            'statuses' => LearningGroup::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'program_id' => ['required', 'exists:programs,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['required', Rule::in(LearningGroup::STATUSES)],
            'max_students' => ['required', 'integer', 'min:1', 'max:100'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        LearningGroup::create([
            ...$validated,
            'mentor_id' => Auth::id(),
        ]);

        return redirect()
            ->route('mentor.learning-groups.index')
            ->with('success', 'Learning group created successfully.');
    }

    private function mentorPrograms()
    {
        return Program::orderBy('name')
            ->get(['id', 'name']);
    }
}
