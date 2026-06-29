<?php

namespace App\Http\Controllers\Mentor;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Http\Controllers\Controller;
use App\Models\ClassSchedule;
use App\Models\Enrollment;
use App\Models\HomeworkAssignment;
use App\Models\HomeworkPracticeTask;
use App\Models\LearningGroup;
use App\Models\Lesson;
use App\Models\Program;
use App\Models\User;
use App\Services\LearningGroupDashboardService;
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
                'available_students' => $this->approvedStudentsForProgram($group->program_id, $mentor->id)
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

    public function show(LearningGroup $learningGroup, LearningGroupDashboardService $dashboardService)
    {
        $this->authorizeMentorGroup($learningGroup);

        return $this->createView('Mentor/LearningGroups/Show', [
            'group' => $dashboardService->dashboardFor($learningGroup),
            'homeworkOptions' => [
                'lessons' => $this->lessonOptionsForGroup($learningGroup),
                'liveSessions' => $this->liveSessionOptionsForGroup($learningGroup),
                'statuses' => HomeworkAssignment::STATUSES,
            ],
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

        if (! $this->mentorCanTeachProgram((int) $validated['program_id'], Auth::id())) {
            return back()
                ->withErrors(['program_id' => 'Select an approved program assigned to your mentor account.'])
                ->withInput();
        }

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

        if (! $this->isApprovedStudentForGroup($learningGroup, $studentId, Auth::id())) {
            return back()->withErrors(['student_id' => 'Select an approved student assigned to your mentorship for this group program.']);
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

    public function storeHomework(Request $request, LearningGroup $learningGroup): RedirectResponse
    {
        $this->authorizeMentorGroup($learningGroup);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:191'],
            'instructions' => ['required', 'string', 'max:10000'],
            'lesson_id' => ['required', 'exists:lessons,id'],
            'live_session_id' => ['nullable', 'exists:class_schedules,id'],
            'due_date' => ['nullable', 'date'],
            'estimated_practice_minutes' => ['required', 'integer', 'min:1', 'max:600'],
            'status' => ['required', Rule::in(HomeworkAssignment::STATUSES)],
            'practice_tasks' => ['nullable', 'array', 'max:20'],
            'practice_tasks.*' => ['nullable', 'string', 'max:191'],
        ]);

        if (! $this->lessonBelongsToGroupProgram((int) $validated['lesson_id'], $learningGroup)) {
            return back()
                ->withErrors(['lesson_id' => 'Select a lesson from this group program.'])
                ->withInput();
        }

        if (! empty($validated['live_session_id']) && ! $this->liveSessionBelongsToGroup((int) $validated['live_session_id'], $learningGroup)) {
            return back()
                ->withErrors(['live_session_id' => 'Select a live session for this group.'])
                ->withInput();
        }

        $practiceTasks = collect($validated['practice_tasks'] ?? [])
            ->map(fn ($task) => trim((string) $task))
            ->filter()
            ->values();
        unset($validated['practice_tasks']);

        $homeworkAssignment = HomeworkAssignment::create([
            ...$validated,
            'learning_group_id' => $learningGroup->id,
            'created_by' => Auth::id(),
        ]);

        $practiceTasks->each(function (string $task, int $index) use ($homeworkAssignment) {
            HomeworkPracticeTask::create([
                'homework_assignment_id' => $homeworkAssignment->id,
                'prompt' => $task,
                'order' => $index + 1,
            ]);
        });

        return back()->with('success', 'Homework assignment created successfully.');
    }

    private function mentorPrograms()
    {
        $programIds = Enrollment::where('user_id', Auth::id())
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->where('status', EnrollmentStatus::ACTIVE)
            ->pluck('program_id');

        return Program::whereIn('id', $programIds)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function approvedStudentsForProgram(int $programId, int $mentorId)
    {
        return User::role('student')
            ->whereHas('enrollments', function ($query) use ($programId, $mentorId) {
                $query->where('program_id', $programId)
                    ->where('enrollment_type', EnrollmentType::STUDENT)
                    ->where('approval_status', ApprovalStatus::APPROVED)
                    ->where('status', EnrollmentStatus::ACTIVE)
                    ->where(function ($assignmentQuery) use ($mentorId) {
                        $assignmentQuery->where('assigned_mentor_id', $mentorId)
                            ->orWhere(function ($referralQuery) use ($mentorId) {
                                $referralQuery->whereNull('assigned_mentor_id')
                                    ->where('referred_by_mentor_id', $mentorId);
                            });
                    });
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
    }

    private function isApprovedStudentForGroup(LearningGroup $learningGroup, int $studentId, int $mentorId): bool
    {
        return Enrollment::where('user_id', $studentId)
            ->where('program_id', $learningGroup->program_id)
            ->where('enrollment_type', EnrollmentType::STUDENT)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->where('status', EnrollmentStatus::ACTIVE)
            ->where(function ($assignmentQuery) use ($mentorId) {
                $assignmentQuery->where('assigned_mentor_id', $mentorId)
                    ->orWhere(function ($referralQuery) use ($mentorId) {
                        $referralQuery->whereNull('assigned_mentor_id')
                            ->where('referred_by_mentor_id', $mentorId);
                    });
            })
            ->exists();
    }

    private function mentorCanTeachProgram(int $programId, int $mentorId): bool
    {
        return Enrollment::where('user_id', $mentorId)
            ->where('program_id', $programId)
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->where('status', EnrollmentStatus::ACTIVE)
            ->exists();
    }

    private function lessonOptionsForGroup(LearningGroup $learningGroup)
    {
        return Lesson::where('program_id', $learningGroup->program_id)
            ->where('is_active', true)
            ->orderBy('level')
            ->orderBy('order_in_level')
            ->get(['id', 'title', 'level'])
            ->map(fn (Lesson $lesson) => [
                'id' => $lesson->id,
                'title' => $lesson->translated_title ?? $lesson->title,
                'level' => $lesson->level,
            ])
            ->values();
    }

    private function liveSessionOptionsForGroup(LearningGroup $learningGroup)
    {
        $studentIds = $learningGroup->students()->pluck('users.id');

        return ClassSchedule::with('lesson:id,title,program_id,level')
            ->where('program_id', $learningGroup->program_id)
            ->where(function ($query) use ($learningGroup, $studentIds) {
                $query->where(function ($titleQuery) use ($learningGroup) {
                    $titleQuery->where('is_group_class', true)
                        ->where('title', $learningGroup->name);
                });

                if ($studentIds->isNotEmpty()) {
                    $query->orWhereIn('student_id', $studentIds)
                        ->orWhereHas('students', fn ($studentQuery) => $studentQuery->whereIn('users.id', $studentIds));
                }
            })
            ->orderByDesc('scheduled_at')
            ->limit(30)
            ->get(['id', 'title', 'lesson_id', 'program_id', 'scheduled_at', 'status'])
            ->map(fn (ClassSchedule $schedule) => [
                'id' => $schedule->id,
                'title' => $schedule->title,
                'lesson_title' => $schedule->lesson?->translated_title ?? $schedule->lesson?->title,
                'scheduled_at' => $schedule->scheduled_at?->toISOString(),
                'date' => $schedule->scheduled_at?->format('M d, Y'),
                'time' => $schedule->scheduled_at?->format('g:i A'),
                'status' => $schedule->status,
            ])
            ->values();
    }

    private function lessonBelongsToGroupProgram(int $lessonId, LearningGroup $learningGroup): bool
    {
        return Lesson::whereKey($lessonId)
            ->where('program_id', $learningGroup->program_id)
            ->exists();
    }

    private function liveSessionBelongsToGroup(int $liveSessionId, LearningGroup $learningGroup): bool
    {
        $studentIds = $learningGroup->students()->pluck('users.id');

        return ClassSchedule::whereKey($liveSessionId)
            ->where('program_id', $learningGroup->program_id)
            ->where(function ($query) use ($learningGroup, $studentIds) {
                $query->where(function ($titleQuery) use ($learningGroup) {
                    $titleQuery->where('is_group_class', true)
                        ->where('title', $learningGroup->name);
                });

                if ($studentIds->isNotEmpty()) {
                    $query->orWhereIn('student_id', $studentIds)
                        ->orWhereHas('students', fn ($studentQuery) => $studentQuery->whereIn('users.id', $studentIds));
                }
            })
            ->exists();
    }

    private function authorizeMentorGroup(LearningGroup $learningGroup): void
    {
        if ($learningGroup->mentor_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this group.');
        }
    }
}
