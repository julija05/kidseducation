<?php

namespace App\Http\Controllers\Mentor;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Mentor\StoreLiveSessionAttendanceRequest;
use App\Models\ClassSchedule;
use App\Models\Enrollment;
use App\Models\HomeworkAssignment;
use App\Models\HomeworkPracticeTask;
use App\Models\LearningGroup;
use App\Models\Lesson;
use App\Models\LiveSessionAttendance;
use App\Models\MentorNote;
use App\Models\Program;
use App\Models\User;
use App\Models\WeeklyLearningReport;
use App\Services\LearningGroupDashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class LearningGroupController extends Controller
{
    public function weeklyReports(Request $request)
    {
        $mentorId = (int) Auth::id();
        $filters = $request->validate([
            'group_id' => ['nullable', 'integer'],
            'student_id' => ['nullable', 'integer'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $groups = LearningGroup::query()
            ->where('mentor_id', $mentorId)
            ->with('students:id,name')
            ->orderBy('name')
            ->get(['id', 'name']);
        $students = $groups->flatMap->students->unique('id')->sortBy('name')->values();

        $reports = WeeklyLearningReport::query()
            ->with(['learningGroup:id,name', 'child:id,name', 'childNotes.child:id,name'])
            ->where(function ($query) use ($mentorId) {
                $query->where('mentor_id', $mentorId)
                    ->orWhereHas('learningGroup', fn ($groupQuery) => $groupQuery->where('mentor_id', $mentorId));
            })
            ->when(! empty($filters['group_id']), fn ($query) => $query->where('learning_group_id', $filters['group_id']))
            ->when(! empty($filters['student_id']), function ($query) use ($filters) {
                $studentId = (int) $filters['student_id'];
                $query->where(function ($studentQuery) use ($studentId) {
                    $studentQuery->where('child_user_id', $studentId)
                        ->orWhereHas('childNotes', fn ($noteQuery) => $noteQuery->where('child_user_id', $studentId))
                        ->orWhere(function ($groupReportQuery) use ($studentId) {
                            $groupReportQuery->whereNull('child_user_id')
                                ->whereHas('learningGroup.students', fn ($memberQuery) => $memberQuery->where('users.id', $studentId));
                        });
                });
            })
            ->when(! empty($filters['date_from']), fn ($query) => $query->whereDate('published_at', '>=', $filters['date_from']))
            ->when(! empty($filters['date_to']), fn ($query) => $query->whereDate('published_at', '<=', $filters['date_to']))
            ->latest('published_at')
            ->latest('id')
            ->get()
            ->map(function (WeeklyLearningReport $report) use ($filters) {
                $selectedStudentId = isset($filters['student_id']) ? (int) $filters['student_id'] : null;

                return [
                    'id' => $report->id,
                    'week_number' => $report->week_number,
                    'group' => $report->learningGroup ? ['id' => $report->learningGroup->id, 'name' => $report->learningGroup->name] : null,
                    'student' => $report->child ? ['id' => $report->child->id, 'name' => $report->child->name] : null,
                    'audience' => $report->child?->name ?? 'Whole group',
                    'what_we_learned' => $report->what_we_learned,
                    'what_to_practice' => $report->what_to_practice,
                    'next_focus' => $report->next_focus,
                    'individual_notes' => $report->child_user_id
                        ? collect([['child_id' => $report->child_user_id, 'child_name' => $report->child?->name, 'note' => $report->individual_child_note]])->filter(fn ($note) => $note['note'])->values()
                        : $report->childNotes
                            ->when($selectedStudentId, fn ($notes) => $notes->where('child_user_id', $selectedStudentId))
                            ->map(fn ($note) => ['child_id' => $note->child_user_id, 'child_name' => $note->child?->name, 'note' => $note->note])
                            ->values(),
                    'published_at' => $report->published_at?->format('M d, Y'),
                ];
            });

        return $this->createView('Mentor/WeeklyReports/Index', [
            'reports' => $reports,
            'groups' => $groups->map->only(['id', 'name'])->values(),
            'students' => $students->map->only(['id', 'name'])->values(),
            'filters' => [
                'group_id' => $filters['group_id'] ?? '',
                'student_id' => $filters['student_id'] ?? '',
                'date_from' => $filters['date_from'] ?? '',
                'date_to' => $filters['date_to'] ?? '',
            ],
        ]);
    }

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
            'attendanceOptions' => [
                'liveSessions' => $this->attendanceSessionOptionsForGroup($learningGroup),
                'statuses' => collect(LiveSessionAttendance::STATUSES)->map(fn (string $status) => [
                    'value' => $status,
                    'label' => ucfirst(str_replace('_', ' ', $status)),
                ])->values(),
            ],
            'weeklyReportOptions' => [
                'students' => $learningGroup->students()->orderBy('name')->get(['users.id', 'users.name']),
                'reports' => $learningGroup->weeklyLearningReports()
                    ->with('child:id,name')
                    ->latest('published_at')
                    ->get()
                    ->map(fn (WeeklyLearningReport $report) => [
                        'id' => $report->id,
                        'week_number' => $report->week_number,
                        'audience' => $report->child?->name ?? 'Whole group',
                        'published_at' => $report->published_at?->format('M d, Y'),
                    ]),
            ],
        ]);
    }

    public function showStudent(LearningGroup $learningGroup, User $student)
    {
        $this->authorizeMentorStudent($learningGroup, $student);

        $student->load(['enrollments' => fn ($query) => $query->where('program_id', $learningGroup->program_id)]);
        $notes = MentorNote::with(['mentor:id,name', 'lesson:id,title', 'liveSession:id,title,scheduled_at'])
            ->where('mentor_id', Auth::id())
            ->where('student_id', $student->id)
            ->where('learning_group_id', $learningGroup->id)
            ->latest()
            ->get()
            ->map(fn (MentorNote $note) => [
                'id' => $note->id,
                'note' => $note->note,
                'visible_to_parent' => $note->visible_to_parent,
                'author' => $note->mentor ? [
                    'id' => $note->mentor->id,
                    'name' => $note->mentor->name,
                ] : null,
                'lesson' => $note->lesson ? ['id' => $note->lesson->id, 'title' => $note->lesson->title] : null,
                'live_session' => $note->liveSession ? [
                    'id' => $note->liveSession->id,
                    'title' => $note->liveSession->title,
                    'scheduled_at' => $note->liveSession->scheduled_at?->format('M d, Y g:i A'),
                ] : null,
                'created_at' => $note->created_at->format('M d, Y g:i A'),
            ]);

        return $this->createView('Mentor/Students/Show', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'progress' => $student->enrollments->first()?->progress,
            ],
            'group' => ['id' => $learningGroup->id, 'name' => $learningGroup->name],
            'notes' => $notes,
            'noteOptions' => [
                'lessons' => $this->lessonOptionsForGroup($learningGroup),
                'liveSessions' => $this->liveSessionOptionsForGroup($learningGroup),
            ],
        ]);
    }

    public function storeNote(Request $request, LearningGroup $learningGroup, User $student): RedirectResponse
    {
        $this->authorizeMentorStudent($learningGroup, $student);

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:10000'],
            'lesson_id' => ['nullable', 'integer', 'exists:lessons,id'],
            'live_session_id' => ['nullable', 'integer', 'exists:class_schedules,id'],
            'visible_to_parent' => ['required', 'boolean'],
        ]);

        if (! empty($validated['lesson_id']) && ! $this->lessonBelongsToGroupProgram((int) $validated['lesson_id'], $learningGroup)) {
            return back()->withErrors(['lesson_id' => 'Select a lesson from this group program.'])->withInput();
        }
        if (! empty($validated['live_session_id']) && ! $this->liveSessionBelongsToGroup((int) $validated['live_session_id'], $learningGroup)) {
            return back()->withErrors(['live_session_id' => 'Select a live session from this group.'])->withInput();
        }

        MentorNote::create([
            ...$validated,
            'mentor_id' => Auth::id(),
            'student_id' => $student->id,
            'learning_group_id' => $learningGroup->id,
        ]);

        return back()->with('success', 'Mentor note added successfully.');
    }

    public function storeWeeklyReport(Request $request, LearningGroup $learningGroup): RedirectResponse
    {
        $this->authorizeMentorGroup($learningGroup);

        $validated = $request->validate([
            'week_number' => ['required', 'integer', 'min:1', 'max:53'],
            'child_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'what_we_learned' => ['required', 'string', 'max:10000'],
            'what_to_practice' => ['required', 'string', 'max:10000'],
            'next_focus' => ['required', 'string', 'max:10000'],
            'individual_notes' => ['nullable', 'array'],
            'individual_notes.*' => ['nullable', 'string', 'max:10000'],
        ]);

        $studentId = isset($validated['child_user_id']) ? (int) $validated['child_user_id'] : null;
        if ($studentId && ! $learningGroup->students()->whereKey($studentId)->exists()) {
            return back()->withErrors(['child_user_id' => 'Select a student from this group.'])->withInput();
        }

        $duplicate = WeeklyLearningReport::query()
            ->where('learning_group_id', $learningGroup->id)
            ->where('week_number', $validated['week_number'])
            ->when($studentId, fn ($query) => $query->where('child_user_id', $studentId), fn ($query) => $query->whereNull('child_user_id'))
            ->exists();
        if ($duplicate) {
            return back()->withErrors(['week_number' => 'A report for this week and audience already exists.'])->withInput();
        }

        DB::transaction(function () use ($validated, $learningGroup, $studentId) {
            $report = WeeklyLearningReport::create([
                'learning_group_id' => $learningGroup->id,
                'mentor_id' => Auth::id(),
                'child_user_id' => $studentId,
                'program_id' => $learningGroup->program_id,
                'week_number' => $validated['week_number'],
                'group_name' => $learningGroup->name,
                'what_we_learned' => $validated['what_we_learned'],
                'what_to_practice' => $validated['what_to_practice'],
                'next_focus' => $validated['next_focus'],
                'individual_child_note' => $studentId ? ($validated['individual_notes'][$studentId] ?? null) : null,
                'published_at' => now(),
            ]);

            if (! $studentId) {
                collect($validated['individual_notes'] ?? [])
                    ->filter(fn ($note, $childId) => trim((string) $note) !== '' && $learningGroup->students()->whereKey((int) $childId)->exists())
                    ->each(fn ($note, $childId) => $report->childNotes()->create([
                        'child_user_id' => (int) $childId,
                        'note' => trim($note),
                    ]));
            }
        });

        return back()->with('success', 'Weekly report published successfully.');
    }

    private function authorizeMentorStudent(LearningGroup $learningGroup, User $student): void
    {
        $this->authorizeMentorGroup($learningGroup);
        abort_unless($learningGroup->students()->whereKey($student->id)->exists(), 404);
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

    public function storeAttendance(
        StoreLiveSessionAttendanceRequest $request,
        LearningGroup $learningGroup,
        ClassSchedule $liveSession
    ): RedirectResponse {
        $this->authorizeMentorGroup($learningGroup);

        if (! $this->liveSessionBelongsToGroup($liveSession->id, $learningGroup)) {
            abort(404);
        }

        $participantIds = $this->attendanceParticipantsFor($liveSession, $learningGroup)->pluck('id');
        $submittedStudentIds = collect($request->validated('attendance'))->pluck('student_id')->map(fn ($id) => (int) $id);

        if ($submittedStudentIds->diff($participantIds)->isNotEmpty()) {
            return back()->withErrors([
                'attendance' => 'Attendance can only be marked for students assigned to this live session.',
            ]);
        }

        DB::transaction(function () use ($request, $liveSession) {
            foreach ($request->validated('attendance') as $attendance) {
                LiveSessionAttendance::updateOrCreate(
                    [
                        'live_session_id' => $liveSession->id,
                        'student_id' => $attendance['student_id'],
                    ],
                    [
                        'status' => $attendance['status'],
                        'marked_by' => Auth::id(),
                        'marked_at' => now(),
                    ]
                );
            }
        });

        return back()->with('success', 'Attendance saved successfully.');
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

    private function attendanceSessionOptionsForGroup(LearningGroup $learningGroup)
    {
        $studentIds = $learningGroup->students()->pluck('users.id');

        return ClassSchedule::with([
            'student:id,name,email',
            'students:id,name,email',
            'attendanceRecords:id,live_session_id,student_id,status,marked_at',
        ])
            ->where('program_id', $learningGroup->program_id)
            ->where('status', '!=', 'cancelled')
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
            ->get()
            ->map(function (ClassSchedule $session) use ($learningGroup) {
                $participants = $this->attendanceParticipantsFor($session, $learningGroup);
                $attendanceByStudent = $session->attendanceRecords->keyBy('student_id');

                return [
                    'id' => $session->id,
                    'title' => $session->title,
                    'date' => $session->scheduled_at?->format('M d, Y'),
                    'time' => $session->scheduled_at?->format('g:i A'),
                    'status' => $session->status,
                    'participants' => $participants->map(function (User $student) use ($attendanceByStudent) {
                        $attendance = $attendanceByStudent->get($student->id);

                        return [
                            'id' => $student->id,
                            'name' => $student->name,
                            'email' => $student->email,
                            'attendance_status' => $attendance?->status,
                            'marked_at' => $attendance?->marked_at?->toISOString(),
                        ];
                    })->values(),
                ];
            })
            ->filter(fn (array $session) => $session['participants']->isNotEmpty())
            ->values();
    }

    private function attendanceParticipantsFor(ClassSchedule $liveSession, LearningGroup $learningGroup)
    {
        if ($liveSession->is_group_class) {
            return $learningGroup->students()
                ->orderBy('name')
                ->get(['users.id', 'users.name', 'users.email']);
        }

        $liveSession->loadMissing(['student:id,name,email', 'students:id,name,email']);
        $groupStudentIds = $learningGroup->students()->pluck('users.id');

        return $liveSession->getAllStudents()->whereIn('id', $groupStudentIds)->values();
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
