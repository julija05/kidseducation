<?php

namespace App\Http\Controllers\Mentor;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningGroup;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class LearningGroupController extends Controller
{
    public function index()
    {
        $mentor = Auth::user();

        $groups = LearningGroup::with(['program:id,name', 'students:id,name,email'])
            ->withCount('students')
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

    public function addStudent(Request $request, LearningGroup $learningGroup): RedirectResponse
    {
        $this->authorizeMentorGroup($learningGroup);

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
        $this->authorizeMentorGroup($learningGroup);

        $learningGroup->students()->detach($student->id);

        return back()->with('success', 'Student removed from group.');
    }

    private function mentorPrograms()
    {
        return Program::orderBy('name')
            ->get(['id', 'name']);
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

    private function authorizeMentorGroup(LearningGroup $learningGroup): void
    {
        if ($learningGroup->mentor_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this group.');
        }
    }
}
