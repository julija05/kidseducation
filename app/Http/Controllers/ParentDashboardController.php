<?php

namespace App\Http\Controllers;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Models\ClassSchedule;
use App\Models\MentorNote;
use App\Models\Program;
use App\Models\Review;
use App\Models\User;
use App\Models\WeeklyLearningReport;
use App\Services\HomeworkAssignmentDashboardService;
use App\Services\MeetingAttendanceService;
use App\Services\StudentAttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ParentDashboardController extends Controller
{
    public function __construct(
        private HomeworkAssignmentDashboardService $homeworkAssignmentDashboardService,
        private MeetingAttendanceService $meetingAttendanceService,
        private StudentAttendanceService $studentAttendanceService,
    ) {}

    public function index(Request $request): Response
    {
        $parent = $request->user();
        $children = $this->childrenFor($parent);
        $childProfiles = $this->childProfilesFor($parent);

        return Inertia::render('Parent/Dashboard', [
            'childCards' => $this->childCardsFor($parent, $children, $childProfiles),
            'children' => $children,
            'childProfiles' => $childProfiles,
            'programReviews' => $this->programReviewsForParentDashboard(),
        ]);
    }

    private function programReviewsForParentDashboard(): Collection
    {
        if (! Schema::hasTable('reviews')) {
            return collect();
        }

        return Review::approved()
            ->where('reviewable_type', Program::class)
            ->with(['user:id,name', 'reviewable:id,name,slug'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Review $review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at,
                'user_name' => $review->user?->name,
                'program' => $review->reviewable ? [
                    'id' => $review->reviewable->id,
                    'name' => $review->reviewable->name,
                    'slug' => $review->reviewable->slug,
                ] : null,
            ])
            ->values();
    }

    public function showChild(Request $request, User $child): Response
    {
        $parent = $request->user();
        $child = $this->authorizedChildFor($parent, $child)
            ->load(['enrollments.program']);

        return Inertia::render('Parent/Child', [
            'child' => $this->formatChild($child),
        ]);
    }

    public function showChildLearningDashboard(Request $request, User $child, DashboardController $dashboard)
    {
        $parent = $request->user();
        $child = $this->authorizedChildFor($parent, $child);

        return $dashboard->renderParentChildDashboard($child, $parent);
    }

    private function authorizedChildFor(User $parent, User $child): User
    {
        if (! Schema::hasTable('parent_child')) {
            abort(404);
        }

        return $parent->children()
            ->whereKey($child->id)
            ->whereHas('roles', fn ($query) => $query->where('name', 'student'))
            ->firstOrFail();
    }

    private function childrenFor(User $parent)
    {
        if (! Schema::hasTable('parent_child')) {
            return collect();
        }

        return $parent->children()
            ->whereHas('roles', fn ($query) => $query->where('name', 'student'))
            ->with(['enrollments.program'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $child) => $this->formatChild($child))
            ->values();
    }

    private function formatChild(User $child): array
    {
        $meetingAttendance = $this->meetingAttendanceService->forStudent($child);

        return [
            'id' => $child->id,
            'name' => $child->name,
            'first_name' => $child->first_name,
            'last_name' => $child->last_name,
            'email' => $child->email,
            'username' => $child->username,
            'status' => $child->status,
            'parent_visible_mentor_notes' => $this->parentVisibleMentorNotesFor($child->id),
            'homework_assignments' => $this->homeworkAssignmentDashboardService->forStudent($child),
            'meeting_attendance' => $meetingAttendance,
            'attendance' => $this->studentAttendanceService->forStudent($child, $meetingAttendance),
            'weekly_reports' => $this->weeklyReportsFor($child)->map(fn (WeeklyLearningReport $report) => $this->formatWeeklyReport($report, $child->id))->values(),
            'enrollments' => $child->enrollments->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'approval_status' => $enrollment->approval_status,
                    'progress' => $enrollment->progress,
                    'quiz_points' => $enrollment->quiz_points,
                    'highest_unlocked_level' => $enrollment->highest_unlocked_level,
                    'program' => $enrollment->program ? [
                        'id' => $enrollment->program->id,
                        'name' => $enrollment->program->name,
                        'slug' => $enrollment->program->slug,
                    ] : null,
                ];
            })->values(),
        ];
    }

    private function childProfilesFor(User $parent)
    {
        if (! Schema::hasTable('child_profiles')) {
            return collect();
        }

        return $parent->childProfiles()
            ->with(['child:id,username', 'program:id,name,slug', 'enrollment:id,approval_status,status,rejection_reason'])
            ->latest()
            ->get()
            ->map(fn ($profile) => $this->formatChildProfile($profile))
            ->values();
    }

    private function formatChildProfile($profile): array
    {
        return [
            'id' => $profile->id,
            'child_user_id' => $profile->child_user_id,
            'child_name' => $profile->child_name,
            'child_username' => $profile->child_username ?: $profile->child?->username,
            'child_generated_password' => $profile->child_generated_password,
            'age' => $profile->age,
            'grade_class' => $profile->grade_class,
            'status' => $profile->status,
            'notes' => $profile->notes,
            'created_at' => $profile->created_at,
            'program' => $profile->program ? [
                'id' => $profile->program->id,
                'name' => $profile->program->name,
                'slug' => $profile->program->slug,
            ] : null,
            'enrollment' => $profile->enrollment ? [
                'id' => $profile->enrollment->id,
                'status' => $profile->enrollment->status,
                'approval_status' => $profile->enrollment->approval_status,
                'rejection_reason' => $profile->enrollment->rejection_reason,
            ] : null,
        ];
    }

    private function childCardsFor(
        User $parent,
        ?Collection $children = null,
        ?Collection $profiles = null
    ) {
        $profiles ??= $this->childProfilesFor($parent);
        $children = ($children ?? $this->childrenFor($parent))->keyBy('id');

        $cards = $profiles->map(function (array $profile) use ($children) {
            $child = $profile['child_user_id'] ?? null
                ? $children->get($profile['child_user_id'])
                : null;

            return $this->formatChildCard($profile, $child);
        });

        $profileChildIds = $profiles->pluck('child_user_id')->filter()->all();
        $childrenWithoutProfiles = $children
            ->reject(fn ($child) => in_array($child['id'], $profileChildIds, true))
            ->map(fn ($child) => $this->formatChildCard(null, $child));

        return $cards->concat($childrenWithoutProfiles)->values();
    }

    private function formatChildCard(?array $profile, ?array $child): array
    {
        $childId = $child['id'] ?? $profile['child_user_id'] ?? null;
        $activeEnrollment = $this->activeEnrollmentFrom($child['enrollments'] ?? collect());
        $applicationStatus = $profile['enrollment']['approval_status'] ?? $activeEnrollment['approval_status'] ?? $profile['status'] ?? 'pending';
        $program = $activeEnrollment['program'] ?? $profile['program'] ?? null;
        $nextClass = $childId ? $this->nextLiveClassFor($childId) : null;
        $latestCompletedClass = $childId ? $this->latestCompletedClassFor($childId) : null;
        $sessionData = $latestCompletedClass?->session_data ?? [];
        $assignedHomework = $childId ? $this->homeworkAssignmentForChild($childId) : null;
        $homework = $assignedHomework ? $this->homeworkFromAssignment($assignedHomework) : $this->homeworkFrom($sessionData);
        $latestParentVisibleNote = $childId ? $this->parentVisibleMentorNotesFor($childId)->first() : null;
        $latestWeeklyLearningReport = $childId ? $this->latestWeeklyReportFor($childId) : null;
        $previousWeeklyLearningReports = $childId ? $this->previousWeeklyReportsFor($childId) : collect();

        return [
            'id' => $profile['id'] ?? $childId,
            'child_id' => $childId,
            'name' => $child['name'] ?? $profile['child_name'] ?? 'Child',
            'username' => $child['username'] ?? $profile['child_username'] ?? null,
            'generated_password' => $profile['child_generated_password'] ?? null,
            'application_status' => $applicationStatus,
            'current_program' => $program,
            'group_name' => $this->groupNameFor($nextClass),
            'next_live_class' => $this->formatSchedule($nextClass),
            'homework_status' => $homework['status'] ?? $this->homeworkStatusFrom($sessionData),
            'homework' => $homework,
            'homework_assignments' => $assignedHomework ? [$assignedHomework] : [],
            'meeting_attendance' => $child['meeting_attendance'] ?? [
                'attended_count' => 0,
                'missed_count' => 0,
                'total_records' => 0,
                'attendance_rate' => null,
                'recent_records' => [],
            ],
            'attendance' => $child['attendance'] ?? [
                'attended_count' => 0,
                'missed_count' => 0,
                'late_count' => 0,
                'caught_up_later_count' => 0,
                'excused_count' => 0,
                'total_records' => 0,
                'attendance_rate' => null,
                'recent_records' => [],
            ],
            'progress' => $activeEnrollment['progress'] ?? 0,
            'latest_mentor_note' => $latestParentVisibleNote['note'] ?? null,
            'latest_weekly_learning_report' => $latestWeeklyLearningReport
                ? $this->formatWeeklyReport($latestWeeklyLearningReport, $childId)
                : null,
            'previous_weekly_learning_reports' => $previousWeeklyLearningReports
                ->map(fn (WeeklyLearningReport $report) => $this->formatWeeklyReport($report, $childId))
                ->values(),
            'latest_weekly_report' => $this->weeklyReportFrom($sessionData),
            'rejection_note' => $applicationStatus === 'rejected'
                ? ($profile['enrollment']['rejection_reason'] ?? null)
                : null,
            'detail_url_child_id' => $child['id'] ?? null,
            'learning_dashboard_child_id' => $child['id'] ?? null,
            'reregister_profile_id' => $applicationStatus === 'rejected' ? ($profile['id'] ?? null) : null,
        ];
    }

    private function activeEnrollmentFrom($enrollments): ?array
    {
        $collection = $enrollments instanceof Collection ? $enrollments : collect($enrollments);

        return $collection
            ->sortByDesc(function ($enrollment) {
                $score = 0;

                if ($enrollment['approval_status'] === ApprovalStatus::APPROVED) {
                    $score += 2;
                }

                if ($enrollment['status'] === EnrollmentStatus::ACTIVE) {
                    $score += 1;
                }

                return $score;
            })
            ->first();
    }

    private function nextLiveClassFor(int $childId): ?ClassSchedule
    {
        if (! Schema::hasTable('class_schedules')) {
            return null;
        }

        return ClassSchedule::with(['program:id,name,slug', 'lesson:id,title,title_translations,program_id,level'])
            ->where(function ($query) use ($childId) {
                $query->where('student_id', $childId);

                if (Schema::hasTable('class_schedule_students')) {
                    $query->orWhereHas('students', fn ($studentQuery) => $studentQuery->where('users.id', $childId));
                }
            })
            ->where('scheduled_at', '>', now())
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('scheduled_at')
            ->first();
    }

    private function latestCompletedClassFor(int $childId): ?ClassSchedule
    {
        if (! Schema::hasTable('class_schedules')) {
            return null;
        }

        return ClassSchedule::query()
            ->where(function ($query) use ($childId) {
                $query->where('student_id', $childId);

                if (Schema::hasTable('class_schedule_students')) {
                    $query->orWhereHas('students', fn ($studentQuery) => $studentQuery->where('users.id', $childId));
                }
            })
            ->where('status', 'completed')
            ->orderByDesc('completed_at')
            ->orderByDesc('scheduled_at')
            ->first();
    }

    private function completedClassesFor(int $childId): Collection
    {
        if (! Schema::hasTable('class_schedules')) {
            return collect();
        }

        return ClassSchedule::with(['program:id,name,slug'])
            ->where(function ($query) use ($childId) {
                $query->where('student_id', $childId);

                if (Schema::hasTable('class_schedule_students')) {
                    $query->orWhereHas('students', fn ($studentQuery) => $studentQuery->where('users.id', $childId));
                }
            })
            ->where('status', 'completed')
            ->orderByDesc('completed_at')
            ->orderByDesc('scheduled_at')
            ->get();
    }

    private function parentVisibleMentorNotesFor(int $childId): Collection
    {
        $storedNotes = Schema::hasTable('mentor_notes')
            ? MentorNote::with(['learningGroup:id,name', 'lesson:id,title', 'liveSession:id,title,scheduled_at'])
                ->where('student_id', $childId)
                ->where('visible_to_parent', true)
                ->latest()
                ->get()
                ->map(fn (MentorNote $note) => [
                    'note' => $note->note,
                    'class_title' => $note->liveSession?->title ?? $note->lesson?->title ?? $note->learningGroup?->name,
                    'class_date' => $note->liveSession?->scheduled_at?->format('M d, Y') ?? $note->created_at->format('M d, Y'),
                ])
            : collect();

        $legacyNotes = $this->completedClassesFor($childId)
            ->flatMap(fn (ClassSchedule $schedule) => $this->parentVisibleMentorNotesFromSchedule($schedule))
            ->values();

        return $storedNotes->concat($legacyNotes)->values();
    }

    private function formatSchedule(?ClassSchedule $schedule): ?array
    {
        if (! $schedule) {
            return null;
        }

        return [
            'id' => $schedule->id,
            'title' => $schedule->title,
            'topic' => $schedule->lesson?->translated_title
                ?? $schedule->lesson?->title
                ?? $schedule->description
                ?? $schedule->title,
            'description' => $schedule->description,
            'scheduled_at' => $schedule->scheduled_at,
            'date' => $schedule->scheduled_at->format('M d, Y'),
            'time' => $schedule->scheduled_at->format('g:i A'),
            'formatted_time' => $schedule->getFormattedScheduledTime(),
            'duration' => $schedule->getFormattedDuration(),
            'is_group_class' => $schedule->is_group_class,
            'group' => $this->groupNameFor($schedule),
            'meeting_link' => $schedule->meeting_link,
            'preparation_checklist' => $this->preparationChecklistFrom($schedule),
        ];
    }

    private function groupNameFor(?ClassSchedule $schedule): ?string
    {
        if (! $schedule || ! $schedule->is_group_class) {
            return null;
        }

        return $schedule->title ?: 'Group class';
    }

    private function homeworkStatusFrom(array $sessionData): ?string
    {
        return $sessionData['homework_status']
            ?? $sessionData['homework']['status']
            ?? (isset($sessionData['homework_assigned']) ? ($sessionData['homework_assigned'] ? 'Assigned' : 'Not assigned') : null);
    }

    private function homeworkFrom(array $sessionData): ?array
    {
        $homework = data_get($sessionData, 'homework', []);
        $current = data_get($homework, 'current')
            ?? data_get($homework, 'title')
            ?? data_get($homework, 'assignment')
            ?? data_get($homework, 'description')
            ?? data_get($sessionData, 'current_homework')
            ?? data_get($sessionData, 'homework_title')
            ?? data_get($sessionData, 'homework_description')
            ?? data_get($sessionData, 'homework_assignment');

        $estimatedPracticeTime = data_get($homework, 'estimated_practice_time')
            ?? data_get($homework, 'estimatedPracticeTime')
            ?? data_get($homework, 'practice_time')
            ?? data_get($homework, 'practiceTime')
            ?? data_get($sessionData, 'estimated_practice_time')
            ?? data_get($sessionData, 'practice_time')
            ?? data_get($sessionData, 'homework_estimated_practice_time');

        $dueDate = data_get($homework, 'due_date')
            ?? data_get($homework, 'dueDate')
            ?? data_get($sessionData, 'homework_due_date')
            ?? data_get($sessionData, 'due_date');

        $completed = $this->nullableBoolean(
            data_get($homework, 'completed')
                ?? data_get($homework, 'is_completed')
                ?? data_get($homework, 'isCompleted')
                ?? data_get($sessionData, 'homework_completed')
                ?? data_get($sessionData, 'homework_is_completed')
        );

        $status = $this->homeworkStatusFrom($sessionData);
        if (! $status && $completed !== null) {
            $status = $completed ? 'Completed' : 'Not completed';
        }

        $needsHelp = $this->nullableBoolean(
            data_get($homework, 'needs_help')
                ?? data_get($homework, 'needsHelp')
                ?? data_get($homework, 'help_requested')
                ?? data_get($homework, 'helpRequested')
                ?? data_get($sessionData, 'homework_needs_help')
                ?? data_get($sessionData, 'needs_help')
                ?? data_get($sessionData, 'help_requested')
        );

        if (! $current && ! $estimatedPracticeTime && ! $dueDate && ! $status && $needsHelp === null) {
            return null;
        }

        return [
            'current' => $current,
            'estimated_practice_time' => $this->formatPracticeTime($estimatedPracticeTime),
            'due_date' => $dueDate,
            'status' => $status,
            'is_completed' => $completed,
            'needs_help' => $needsHelp ?? false,
        ];
    }

    private function homeworkFromAssignment(array $assignment): array
    {
        $studentStatus = $assignment['student_status'] ?? null;

        return [
            'id' => $assignment['id'],
            'current' => $assignment['title'],
            'instructions' => $assignment['instructions'],
            'estimated_practice_time' => $assignment['estimated_practice_time'],
            'due_date' => $assignment['due_date'],
            'status' => $assignment['student_status_label'] ?? $this->homeworkStatusLabel($assignment['status']),
            'student_status' => $studentStatus,
            'is_completed' => $assignment['is_completed'] ?? false,
            'needs_help' => $assignment['needs_help'] ?? false,
            'group' => $assignment['group'] ?? null,
            'lesson' => $assignment['lesson'] ?? null,
            'live_session' => $assignment['live_session'] ?? null,
        ];
    }

    private function homeworkAssignmentForChild(int $childId): ?array
    {
        $child = User::find($childId);

        if (! $child) {
            return null;
        }

        return $this->homeworkAssignmentDashboardService->latestForStudent($child);
    }

    private function homeworkStatusLabel(?string $status): ?string
    {
        if (! $status) {
            return null;
        }

        return ucfirst(str_replace('_', ' ', $status));
    }

    private function nullableBoolean($value): ?bool
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (bool) $value;
        }

        if (is_string($value)) {
            return match (strtolower(trim($value))) {
                '1', 'true', 'yes', 'y', 'completed', 'complete', 'done', 'needs_help', 'requested' => true,
                '0', 'false', 'no', 'n', 'not_completed', 'not completed', 'incomplete', 'pending' => false,
                default => null,
            };
        }

        return null;
    }

    private function formatPracticeTime($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            return ((int) $value).' min';
        }

        return (string) $value;
    }

    private function weeklyReportFrom(array $sessionData): ?string
    {
        return $sessionData['weekly_report']
            ?? $sessionData['report']
            ?? $sessionData['weeklyReport']
            ?? null;
    }

    private function latestWeeklyReportFor(int $childId): ?WeeklyLearningReport
    {
        return $this->weeklyReportsQueryFor($childId)?->first();
    }

    private function previousWeeklyReportsFor(int $childId): Collection
    {
        return $this->weeklyReportsQueryFor($childId)?->skip(1)->take(3)->get() ?? collect();
    }

    private function weeklyReportsFor(User $child): Collection
    {
        $query = $this->weeklyReportsQueryFor($child->id);

        if (! $query) {
            return collect();
        }

        return $query->get();
    }

    private function weeklyReportsQueryFor(int $childId)
    {
        if (! Schema::hasTable('weekly_learning_reports')) {
            return null;
        }

        return WeeklyLearningReport::with([
            'program:id,name,slug',
            'classSchedule:id,title,program_id,scheduled_at,is_group_class,student_id',
            'classSchedule.program:id,name,slug',
            'learningGroup:id,name',
            'childNotes' => fn ($query) => $query->where('child_user_id', $childId),
        ])
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where(function ($query) use ($childId) {
                $query->where('child_user_id', $childId);

                if (Schema::hasColumn('weekly_learning_reports', 'learning_group_id')) {
                    $query->orWhere(function ($groupQuery) use ($childId) {
                        $groupQuery->whereNull('child_user_id')
                            ->whereHas('learningGroup.students', fn ($studentQuery) => $studentQuery->where('users.id', $childId));
                    });
                }

                if (Schema::hasTable('class_schedules')) {
                    $query->orWhere(function ($groupQuery) use ($childId) {
                        $groupQuery
                            ->whereNull('child_user_id')
                            ->whereHas('classSchedule', function ($scheduleQuery) use ($childId) {
                                $scheduleQuery->where('student_id', $childId);

                                if (Schema::hasTable('class_schedule_students')) {
                                    $scheduleQuery->orWhereHas('students', fn ($studentQuery) => $studentQuery->where('users.id', $childId));
                                }
                            });
                    });
                }
            })
            ->orderByDesc('published_at')
            ->orderByDesc('week_start_date')
            ->orderByDesc('id');
    }

    private function formatWeeklyReport(WeeklyLearningReport $report, int $childId): array
    {
        $program = $report->program ?? $report->classSchedule?->program;
        $isChildSpecific = $report->child_user_id !== null && (int) $report->child_user_id === $childId;

        return [
            'id' => $report->id,
            'week_number' => $report->week_number,
            'week_start_date' => $report->week_start_date?->toDateString(),
            'week_end_date' => $report->week_end_date?->toDateString(),
            'week_range' => $this->formatWeekRange($report),
            'group_name' => $report->group_name ?: $report->learningGroup?->name ?: ($report->classSchedule?->is_group_class ? $report->classSchedule?->title : null),
            'what_we_learned' => $report->what_we_learned,
            'what_to_practice' => $report->what_to_practice,
            'next_focus' => $report->next_focus,
            'individual_child_note' => $isChildSpecific
                ? $report->individual_child_note
                : $report->childNotes->first()?->note,
            'published_at' => $report->published_at?->format('M d, Y'),
            'program' => $program ? [
                'id' => $program->id,
                'name' => $program->name,
                'slug' => $program->slug,
            ] : null,
            'class_title' => $report->classSchedule?->title,
        ];
    }

    private function formatWeekRange(WeeklyLearningReport $report): ?string
    {
        if (! $report->week_start_date && ! $report->week_end_date) {
            return null;
        }

        if (! $report->week_start_date) {
            return $report->week_end_date->format('M d, Y');
        }

        if (! $report->week_end_date) {
            return $report->week_start_date->format('M d, Y');
        }

        return $report->week_start_date->format('M d').' - '.$report->week_end_date->format('M d, Y');
    }

    private function parentVisibleMentorNoteFrom(array $sessionData): ?string
    {
        return data_get($sessionData, 'parent_note')
            ?? data_get($sessionData, 'mentor_note_for_parent')
            ?? data_get($sessionData, 'public_mentor_note')
            ?? data_get($sessionData, 'parent_visible_mentor_note')
            ?? data_get($sessionData, 'parent_visible_note')
            ?? null;
    }

    private function parentVisibleMentorNotesFromSchedule(ClassSchedule $schedule): array
    {
        $sessionData = $schedule->session_data ?? [];
        $notes = collect([
            $this->parentVisibleMentorNoteFrom($sessionData),
        ]);

        $structuredNotes = collect([
            data_get($sessionData, 'mentor_notes'),
            data_get($sessionData, 'mentorNotes'),
            data_get($sessionData, 'notes'),
        ])
            ->flatMap(fn ($value) => $this->normalizeStructuredParentVisibleNotes($value));

        return $notes
            ->merge($structuredNotes)
            ->filter(fn ($note) => is_string($note) && trim($note) !== '')
            ->map(fn ($note) => [
                'id' => $schedule->id.'-'.md5($note),
                'note' => trim($note),
                'class_title' => $schedule->title,
                'program_name' => $schedule->program?->name,
                'date' => ($schedule->completed_at ?? $schedule->scheduled_at)?->format('M d, Y'),
                'completed_at' => $schedule->completed_at,
            ])
            ->values()
            ->all();
    }

    private function normalizeStructuredParentVisibleNotes($value): array
    {
        if (! $value) {
            return [];
        }

        if ($value instanceof Collection) {
            $value = $value->all();
        }

        if (! is_array($value)) {
            return [];
        }

        $items = array_is_list($value) ? $value : [$value];

        return collect($items)
            ->filter(fn ($item) => is_array($item))
            ->filter(fn ($item) => $this->nullableBoolean(
                $item['parent_visible']
                    ?? $item['visible_to_parent']
                    ?? $item['is_parent_visible']
                    ?? $item['show_to_parent']
                    ?? false
            ) === true)
            ->map(fn ($item) => $item['note']
                ?? $item['text']
                ?? $item['content']
                ?? $item['message']
                ?? null)
            ->filter(fn ($note) => is_string($note) && trim($note) !== '')
            ->map(fn ($note) => trim($note))
            ->values()
            ->all();
    }

    private function preparationChecklistFrom(ClassSchedule $schedule): array
    {
        $sessionData = $schedule->session_data ?? [];
        $candidates = [
            data_get($sessionData, 'preparation_checklist'),
            data_get($sessionData, 'preparationChecklist'),
            data_get($sessionData, 'preparation_items'),
            data_get($sessionData, 'preparationItems'),
            data_get($sessionData, 'preparation.checklist'),
            data_get($sessionData, 'preparation.items'),
            data_get($sessionData, 'materials_to_prepare'),
            data_get($sessionData, 'materials'),
        ];

        foreach ($candidates as $candidate) {
            $items = $this->normalizeChecklistItems($candidate);

            if ($items !== []) {
                return $items;
            }
        }

        return [];
    }

    private function normalizeChecklistItems($value): array
    {
        if (! $value) {
            return [];
        }

        if (is_string($value)) {
            $value = preg_split('/\r\n|\r|\n|,/', $value);
        }

        if ($value instanceof Collection) {
            $value = $value->all();
        }

        if (! is_array($value)) {
            return [];
        }

        return collect($value)
            ->map(function ($item) {
                if (is_string($item)) {
                    return $item;
                }

                if (is_array($item)) {
                    return $item['label']
                        ?? $item['text']
                        ?? $item['title']
                        ?? $item['name']
                        ?? null;
                }

                return null;
            })
            ->filter(fn ($item) => is_string($item) && trim($item) !== '')
            ->map(fn ($item) => trim($item))
            ->values()
            ->all();
    }
}
