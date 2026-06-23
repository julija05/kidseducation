<?php

namespace App\Http\Controllers\Admin;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningGroup;
use App\Models\Program;
use App\Models\User;
use App\Services\LearningGroupDashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminLearningGroupController extends Controller
{
    public function index(Request $request)
    {
        $query = LearningGroup::with(['program:id,name', 'mentor:id,name,email', 'students:id,name,email'])
            ->withCount('students')
            ->latest('start_date');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhereHas('program', function ($programQuery) use ($request) {
                        $programQuery->where('name', 'like', '%'.$request->search.'%');
                    })
                    ->orWhereHas('mentor', function ($mentorQuery) use ($request) {
                        $mentorQuery->where('name', 'like', '%'.$request->search.'%')
                            ->orWhere('email', 'like', '%'.$request->search.'%');
                    });
            });
        }

        $groups = $query->paginate(15)
            ->withQueryString()
            ->through(fn (LearningGroup $group) => [
                'id' => $group->id,
                'name' => $group->name,
                'program' => $group->program,
                'mentor' => $group->mentor,
                'start_date' => $group->start_date->toDateString(),
                'end_date' => $group->end_date->toDateString(),
                'status' => $group->status,
                'is_active' => $group->isActive(),
                'max_students' => $group->max_students,
                'description' => $group->description,
                'students_count' => $group->students_count,
                'students' => $group->students->map(fn (User $student) => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                ])->values(),
                'available_students' => $this->approvedStudentsForProgram($group->program_id)
                    ->whereNotIn('id', $group->students->pluck('id'))
                    ->values(),
            ]);

        return $this->createView('Admin/LearningGroups/Index', [
            'groups' => $groups,
            'statuses' => LearningGroup::STATUSES,
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    public function create()
    {
        return $this->createView('Admin/LearningGroups/Create', [
            'programs' => Program::orderBy('name')->get(['id', 'name']),
            'mentors' => User::role('mentor')->orderBy('name')->get(['id', 'name', 'email']),
            'statuses' => LearningGroup::STATUSES,
        ]);
    }

    public function show(LearningGroup $learningGroup, LearningGroupDashboardService $dashboardService)
    {
        return $this->createView('Admin/LearningGroups/Show', [
            'group' => $dashboardService->dashboardFor($learningGroup),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'program_id' => ['required', 'exists:programs,id'],
            'mentor_id' => ['required', 'exists:users,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['required', Rule::in(LearningGroup::STATUSES)],
            'max_students' => ['required', 'integer', 'min:1', 'max:100'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        if (! User::role('mentor')->whereKey($validated['mentor_id'])->exists()) {
            return back()
                ->withErrors(['mentor_id' => 'The selected user must be a mentor.'])
                ->withInput();
        }

        LearningGroup::create($validated);

        return redirect()
            ->route('admin.learning-groups.index')
            ->with('success', 'Learning group created successfully.');
    }

    public function addStudent(Request $request, LearningGroup $learningGroup): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
        ]);

        $studentId = (int) $validated['student_id'];

        if (! $this->isApprovedStudentForGroup($learningGroup, $studentId)) {
            return back()->withErrors(['student_id' => 'Select an approved student for this group program.']);
        }

        if ($learningGroup->students()->whereKey($studentId)->exists()) {
            return back()->withErrors(['student_id' => 'This student is already in the group.']);
        }

        if ($learningGroup->students()->count() >= $learningGroup->max_students) {
            return back()->withErrors(['student_id' => 'This group has reached its maximum student capacity.']);
        }

        $learningGroup->students()->attach($studentId);

        return back()->with('success', 'Student added to group.');
    }

    public function removeStudent(LearningGroup $learningGroup, User $student): RedirectResponse
    {
        $learningGroup->students()->detach($student->id);

        return back()->with('success', 'Student removed from group.');
    }

    private function approvedStudentsForProgram(int $programId)
    {
        return User::role('student')
            ->whereHas('enrollments', function ($query) use ($programId) {
                $query->where('program_id', $programId)
                    ->where('enrollment_type', EnrollmentType::STUDENT)
                    ->where('approval_status', ApprovalStatus::APPROVED)
                    ->where('status', EnrollmentStatus::ACTIVE);
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
    }

    private function isApprovedStudentForGroup(LearningGroup $learningGroup, int $studentId): bool
    {
        return Enrollment::where('user_id', $studentId)
            ->where('program_id', $learningGroup->program_id)
            ->where('enrollment_type', EnrollmentType::STUDENT)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->where('status', EnrollmentStatus::ACTIVE)
            ->exists();
    }
}
