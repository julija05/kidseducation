<?php

namespace App\Http\Controllers;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Models\ClassSchedule;
use App\Models\User;
use App\Models\WeeklyLearningReport;
use Illuminate\Support\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ParentDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $parent = $request->user();

        return Inertia::render('Parent/Dashboard', [
            'childCards' => $this->childCardsFor($parent),
            'children' => $this->childrenFor($parent),
            'childProfiles' => $this->childProfilesFor($parent),
        ]);
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
        $activeEnrollment = $this->activeEnrollmentFrom($child->enrollments);
        $hasActiveProgram = $this->hasActiveApprovedProgram($this->formatEnrollmentForAccessGate($activeEnrollment));

        return [
            'id' => $child->id,
            'name' => $child->name,
            'first_name' => $child->first_name,
            'last_name' => $child->last_name,
            'email' => $hasActiveProgram ? $child->email : null,
            'username' => $hasActiveProgram ? $child->username : null,
            'status' => $child->status,
            'has_active_program' => $hasActiveProgram,
            'parent_visible_mentor_notes' => $hasActiveProgram ? $this->parentVisibleMentorNotesFor($child->id) : collect(),
            'weekly_reports' => $hasActiveProgram
                ? $this->weeklyReportsFor($child)->map(fn (WeeklyLearningReport $report) => $this->formatWeeklyReport($report, $child->id))->values()
                : collect(),
            'enrollments' => $child->enrollments->map(function ($enrollment) {
                $hasLearningAccess = $this->hasActiveApprovedProgram($this->formatEnrollmentForAccessGate($enrollment));

                return [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'approval_status' => $enrollment->approval_status,
                    'access_blocked' => $enrollment->access_blocked,
                    'has_learning_access' => $hasLearningAccess,
                    'progress' => $hasLearningAccess ? $enrollment->progress : 0,
                    'quiz_points' => $hasLearningAccess ? $enrollment->quiz_points : 0,
                    'highest_unlocked_level' => $hasLearningAccess ? $enrollment->highest_unlocked_level : 1,
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
            ->with(['child:id,username', 'program:id,name,slug', 'enrollment:id,approval_status,status,access_blocked,rejection_reason'])
            ->latest()
            ->get()
            ->map(fn ($profile) => $this->formatChildProfile($profile))
            ->values();
    }

    private function formatChildProfile($profile): array
    {
        $hasActiveProgram = $this->hasActiveApprovedProgram($profile->enrollment ? [
            'approval_status' => $profile->enrollment->approval_status,
            'status' => $profile->enrollment->status,
            'access_blocked' => $profile->enrollment->access_blocked,
            'program' => $profile->program ? [
                'id' => $profile->program->id,
            ] : null,
        ] : null);

        return [
            'id' => $profile->id,
            'child_user_id' => $profile->child_user_id,
            'child_name' => $profile->child_name,
            'child_username' => $hasActiveProgram ? ($profile->child_username ?: $profile->child?->username) : null,
            'child_generated_password' => $hasActiveProgram ? $profile->child_generated_password : null,
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
                'access_blocked' => $profile->enrollment->access_blocked,
                'rejection_reason' => $profile->enrollment->rejection_reason,
            ] : null,
        ];
    }

    private function childCardsFor(User $parent)
    {
        $profiles = $this->childProfilesFor($parent);
        $children = $this->childrenFor($parent)->keyBy('id');

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
        $hasActiveProgram = $this->hasActiveApprovedProgram($this->formatEnrollmentForAccessGate($activeEnrollment));
        $nextClass = $hasActiveProgram && $childId ? $this->nextLiveClassFor($childId) : null;
        $latestCompletedClass = $hasActiveProgram && $childId ? $this->latestCompletedClassFor($childId) : null;
        $sessionData = $latestCompletedClass?->session_data ?? [];
        $homework = $hasActiveProgram ? $this->homeworkFrom($sessionData) : null;
        $latestParentVisibleNote = $hasActiveProgram && $childId ? $this->parentVisibleMentorNotesFor($childId)->first() : null;
        $latestWeeklyLearningReport = $hasActiveProgram && $childId ? $this->latestWeeklyReportFor($childId) : null;

        return [
            'id' => $profile['id'] ?? $childId,
            'child_id' => $childId,
            'name' => $child['name'] ?? $profile['child_name'] ?? 'Child',
            'username' => $hasActiveProgram ? ($child['username'] ?? $profile['child_username'] ?? null) : null,
            'generated_password' => $hasActiveProgram ? ($profile['child_generated_password'] ?? null) : null,
            'application_status' => $applicationStatus,
            'has_active_program' => $hasActiveProgram,
            'current_program' => $program,
            'group_name' => $hasActiveProgram ? $this->groupNameFor($nextClass) : null,
            'next_live_class' => $hasActiveProgram ? $this->formatSchedule($nextClass) : null,
            'homework_status' => $hasActiveProgram ? ($homework['status'] ?? $this->homeworkStatusFrom($sessionData)) : null,
            'homework' => $homework,
            'progress' => $hasActiveProgram ? ($activeEnrollment['progress'] ?? 0) : 0,
            'latest_mentor_note' => $latestParentVisibleNote['note'] ?? null,
            'latest_weekly_learning_report' => $latestWeeklyLearningReport
                ? $this->formatWeeklyReport($latestWeeklyLearningReport, $childId)
                : null,
            'latest_weekly_report' => $hasActiveProgram ? $this->weeklyReportFrom($sessionData) : null,
            'rejection_note' => $applicationStatus === 'rejected'
                ? ($profile['enrollment']['rejection_reason'] ?? null)
                : null,
            'detail_url_child_id' => $child['id'] ?? null,
            'learning_dashboard_child_id' => $hasActiveProgram ? ($child['id'] ?? null) : null,
            'reregister_profile_id' => $applicationStatus === 'rejected' ? ($profile['id'] ?? null) : null,
        ];
    }

    private function hasActiveApprovedProgram(?array $enrollment): bool
    {
        if (! $enrollment) {
            return false;
        }

        return ($enrollment['approval_status'] ?? null) === ApprovalStatus::APPROVED
            && ($enrollment['status'] ?? null) === EnrollmentStatus::ACTIVE
            && ! ($enrollment['access_blocked'] ?? false)
            && ! empty($enrollment['program']);
    }

    private function formatEnrollmentForAccessGate($enrollment): ?array
    {
        if (! $enrollment) {
            return null;
        }

        if (is_array($enrollment)) {
            return $enrollment;
        }

        return [
            'approval_status' => $enrollment->approval_status,
            'status' => $enrollment->status,
            'access_blocked' => $enrollment->access_blocked,
            'program' => $enrollment->program ? [
                'id' => $enrollment->program->id,
            ] : null,
        ];
    }

    private function activeEnrollmentFrom($enrollments): ?array
    {
        $collection = $enrollments instanceof Collection ? $enrollments : collect($enrollments);

        $enrollment = $collection
            ->sortByDesc(function ($enrollment) {
                $score = 0;

                if (data_get($enrollment, 'approval_status') === ApprovalStatus::APPROVED) {
                    $score += 2;
                }

                if (data_get($enrollment, 'status') === EnrollmentStatus::ACTIVE) {
                    $score += 1;
                }

                return $score;
            })
            ->first();

        return $this->formatEnrollmentForCard($enrollment);
    }

    private function formatEnrollmentForCard($enrollment): ?array
    {
        if (! $enrollment) {
            return null;
        }

        if (is_array($enrollment)) {
            return $enrollment;
        }

        return [
            'id' => $enrollment->id,
            'status' => $enrollment->status,
            'approval_status' => $enrollment->approval_status,
            'access_blocked' => $enrollment->access_blocked,
            'progress' => $enrollment->progress,
            'quiz_points' => $enrollment->quiz_points,
            'highest_unlocked_level' => $enrollment->highest_unlocked_level,
            'program' => $enrollment->program ? [
                'id' => $enrollment->program->id,
                'name' => $enrollment->program->name,
                'slug' => $enrollment->program->slug,
            ] : null,
        ];
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
        return $this->completedClassesFor($childId)
            ->flatMap(fn (ClassSchedule $schedule) => $this->parentVisibleMentorNotesFromSchedule($schedule))
            ->values();
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

        return WeeklyLearningReport::with(['program:id,name,slug', 'classSchedule:id,title,program_id,scheduled_at,is_group_class,student_id', 'classSchedule.program:id,name,slug'])
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where(function ($query) use ($childId) {
                $query->where('child_user_id', $childId);

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
            'group_name' => $report->group_name ?: ($report->classSchedule?->is_group_class ? $report->classSchedule?->title : null),
            'what_we_learned' => $report->what_we_learned,
            'what_to_practice' => $report->what_to_practice,
            'next_focus' => $report->next_focus,
            'individual_child_note' => $isChildSpecific ? $report->individual_child_note : null,
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
