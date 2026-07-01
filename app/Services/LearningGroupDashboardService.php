<?php

namespace App\Services;

use App\Models\ClassSchedule;
use App\Models\HomeworkAssignment;
use App\Models\HomeworkAssignmentStatus;
use App\Models\LearningGroup;
use App\Models\Lesson;
use App\Models\LiveSessionAttendance;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class LearningGroupDashboardService
{
    public function __construct(
        private MeetingAttendanceService $meetingAttendanceService,
    ) {}

    public function activeGroupCardsForMentor(User $mentor): Collection
    {
        return LearningGroup::with(['program:id,name,slug', 'students:id,name,email'])
            ->withCount('students')
            ->where('mentor_id', $mentor->id)
            ->active()
            ->orderBy('name')
            ->get()
            ->map(function (LearningGroup $learningGroup) {
                $studentIds = $learningGroup->students->pluck('id')->values();
                $nextClass = $this->schedulesForGroup($learningGroup, $studentIds)
                    ->with(['lesson:id,title,program_id,level', 'students:id,name,email'])
                    ->where('scheduled_at', '>', now())
                    ->whereIn('status', ['scheduled', 'confirmed'])
                    ->orderBy('scheduled_at')
                    ->first();

                return [
                    'id' => $learningGroup->id,
                    'name' => $learningGroup->name,
                    'program' => $learningGroup->program ? [
                        'id' => $learningGroup->program->id,
                        'name' => $learningGroup->program->name,
                        'slug' => $learningGroup->program->slug,
                    ] : null,
                    'students_count' => $learningGroup->students_count,
                    'max_students' => $learningGroup->max_students,
                    'next_live_class' => $this->formatSchedule($nextClass),
                ];
            })
            ->values();
    }

    public function dashboardFor(LearningGroup $learningGroup): array
    {
        $relations = [
            'program:id,name,slug',
            'mentor:id,name,email',
            'students:id,name,email',
            'students.enrollments:id,user_id,program_id,status,approval_status,progress',
            'homeworkAssignments.lesson:id,title,program_id,level',
            'homeworkAssignments.liveSession:id,title,scheduled_at,status',
        ];

        if (Schema::hasTable('homework_assignment_statuses')) {
            $relations[] = 'homeworkAssignments.studentStatuses.student:id,name,email';
        }

        $learningGroup->loadMissing($relations);

        $studentIds = $learningGroup->students->pluck('id')->values();
        $upcomingClass = $this->schedulesForGroup($learningGroup, $studentIds)
            ->with(['program:id,name,slug', 'lesson:id,title,program_id,level', 'students:id,name,email'])
            ->where('scheduled_at', '>', now())
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('scheduled_at')
            ->first();

        $completedClasses = $this->schedulesForGroup($learningGroup, $studentIds)
            ->with(['program:id,name,slug', 'lesson:id,title,program_id,level', 'students:id,name,email'])
            ->where('status', 'completed')
            ->orderByDesc('completed_at')
            ->orderByDesc('scheduled_at')
            ->get();

        $attendanceClasses = $this->schedulesForGroup($learningGroup, $studentIds)
            ->with([
                'student:id,name,email',
                'students:id,name,email',
                'attendanceRecords.student:id,name,email',
                'attendanceRecords.markedBy:id,name',
            ])
            ->where(function (Builder $query) {
                $query->where('status', 'completed')
                    ->orWhereHas('attendanceRecords');
            })
            ->orderByDesc('scheduled_at')
            ->get();

        $currentLesson = $this->currentLessonFor($learningGroup, $upcomingClass, $completedClasses);
        $meetingAttendance = $this->meetingAttendanceService->forGroup($learningGroup);

        return [
            'id' => $learningGroup->id,
            'name' => $learningGroup->name,
            'description' => $learningGroup->description,
            'status' => $learningGroup->status,
            'start_date' => $learningGroup->start_date?->toDateString(),
            'end_date' => $learningGroup->end_date?->toDateString(),
            'max_students' => $learningGroup->max_students,
            'program' => $learningGroup->program ? [
                'id' => $learningGroup->program->id,
                'name' => $learningGroup->program->name,
                'slug' => $learningGroup->program->slug,
            ] : null,
            'mentor' => $learningGroup->mentor ? [
                'id' => $learningGroup->mentor->id,
                'name' => $learningGroup->mentor->name,
                'email' => $learningGroup->mentor->email,
            ] : null,
            'students' => $learningGroup->students
                ->map(fn (User $student) => $this->formatStudent($student, $learningGroup->program_id))
                ->values(),
            'next_live_class' => $this->formatSchedule($upcomingClass),
            'current_lesson' => $currentLesson,
            'homework_summary' => $this->homeworkSummary($completedClasses, $learningGroup->homeworkAssignments, $learningGroup->students),
            'attendance_summary' => $this->attendanceSummary(
                $attendanceClasses,
                $learningGroup->students,
                $meetingAttendance
            ),
            'help_requests' => $this->helpRequests($completedClasses, $learningGroup->students, $learningGroup->homeworkAssignments),
        ];
    }

    private function schedulesForGroup(LearningGroup $learningGroup, Collection $studentIds): Builder
    {
        $query = ClassSchedule::query()
            ->where('program_id', $learningGroup->program_id)
            ->where(function (Builder $scheduleQuery) use ($learningGroup, $studentIds) {
                if ($studentIds->isNotEmpty()) {
                    $scheduleQuery->whereIn('student_id', $studentIds);

                    if (Schema::hasTable('class_schedule_students')) {
                        $scheduleQuery->orWhereHas('students', fn (Builder $studentQuery) => $studentQuery->whereIn('users.id', $studentIds));
                    }
                }

                $scheduleQuery->orWhere(function (Builder $titleQuery) use ($learningGroup) {
                    $titleQuery->where('is_group_class', true)
                        ->where('title', $learningGroup->name);
                });
            });

        return $query;
    }

    private function formatStudent(User $student, int $programId): array
    {
        $enrollment = $student->enrollments->firstWhere('program_id', $programId);

        return [
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'progress' => $enrollment?->progress,
            'enrollment_status' => $enrollment?->status,
            'approval_status' => $enrollment?->approval_status,
        ];
    }

    private function currentLessonFor(LearningGroup $learningGroup, ?ClassSchedule $upcomingClass, Collection $completedClasses): ?array
    {
        $lesson = $upcomingClass?->lesson ?? $completedClasses->first(fn (ClassSchedule $schedule) => $schedule->lesson !== null)?->lesson;

        if ($lesson) {
            return $this->formatLesson($lesson);
        }

        if ($upcomingClass) {
            return [
                'id' => null,
                'title' => $upcomingClass->description ?: $upcomingClass->title,
                'level' => null,
                'source' => 'next_class',
            ];
        }

        $firstLesson = Lesson::where('program_id', $learningGroup->program_id)
            ->where('is_active', true)
            ->orderBy('level')
            ->orderBy('order_in_level')
            ->first(['id', 'title', 'program_id', 'level']);

        return $firstLesson ? $this->formatLesson($firstLesson) : null;
    }

    private function formatLesson(Lesson $lesson): array
    {
        return [
            'id' => $lesson->id,
            'title' => $lesson->translated_title ?? $lesson->title,
            'level' => $lesson->level,
            'source' => 'lesson',
        ];
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
            'scheduled_at' => $schedule->scheduled_at?->toISOString(),
            'date' => $schedule->scheduled_at?->format('M d, Y'),
            'time' => $schedule->scheduled_at?->format('g:i A'),
            'formatted_time' => $schedule->scheduled_at ? $schedule->getFormattedScheduledTime() : null,
            'duration' => $schedule->getFormattedDuration(),
            'meeting_link' => $schedule->meeting_link,
            'status' => $schedule->status,
            'student_count' => $schedule->is_group_class ? $schedule->students->count() : ($schedule->student_id ? 1 : 0),
            'lesson' => $schedule->lesson ? $this->formatLesson($schedule->lesson) : null,
        ];
    }

    private function homeworkSummary(Collection $completedClasses, Collection $homeworkAssignments, Collection $groupStudents): array
    {
        $homeworkItems = $completedClasses
            ->map(fn (ClassSchedule $schedule) => [
                'schedule' => $schedule,
                'homework' => $this->homeworkFrom($schedule->session_data ?? []),
            ])
            ->filter(fn (array $item) => $item['homework'] !== null)
            ->values();

        $assignmentItems = $homeworkAssignments
            ->sortByDesc('created_at')
            ->map(fn (HomeworkAssignment $assignment) => $this->homeworkAssignmentSummary($assignment, $groupStudents))
            ->values();

        $completed = $homeworkItems->filter(fn (array $item) => $item['homework']['is_completed'] === true)->count();
        $notCompleted = $homeworkItems->filter(fn (array $item) => $item['homework']['is_completed'] === false)->count();
        $needsHelp = $homeworkItems->filter(fn (array $item) => $item['homework']['needs_help'] === true)->count();
        $assignmentCompleted = $assignmentItems->sum('completed_count');
        $assignmentNotCompleted = $assignmentItems->sum('not_completed_count');
        $assignmentNeedsHelp = $assignmentItems->sum('needs_help_count');
        $assignmentStudentCount = $assignmentItems->sum('student_count');
        $latest = $assignmentItems->first();
        $legacyLatest = $homeworkItems->first();

        return [
            'assigned_count' => $homeworkItems->count() + $assignmentStudentCount,
            'completed_count' => $completed + $assignmentCompleted,
            'not_completed_count' => $notCompleted + $assignmentNotCompleted,
            'needs_help_count' => $needsHelp + $assignmentNeedsHelp,
            'assignments' => $assignmentItems,
            'latest' => $latest ?: ($legacyLatest ? [
                ...$legacyLatest['homework'],
                'class_title' => $legacyLatest['schedule']->title,
                'class_date' => ($legacyLatest['schedule']->completed_at ?? $legacyLatest['schedule']->scheduled_at)?->format('M d, Y'),
            ] : null),
        ];
    }

    private function homeworkAssignmentSummary(HomeworkAssignment $assignment, Collection $groupStudents): array
    {
        $studentStatuses = $groupStudents
            ->map(fn (User $student) => $this->studentHomeworkStatus($assignment, $student))
            ->values();

        return [
            'id' => $assignment->id,
            'current' => $assignment->title,
            'instructions' => $assignment->instructions,
            'estimated_practice_time' => $this->formatPracticeTime($assignment->estimated_practice_minutes),
            'due_date' => $assignment->due_date?->toDateString(),
            'status' => ucfirst(str_replace('_', ' ', $assignment->status)),
            'is_completed' => $studentStatuses->isNotEmpty() && $studentStatuses->every(fn (array $status) => $status['status'] === HomeworkAssignmentStatus::STATUS_COMPLETED),
            'needs_help' => $studentStatuses->contains(fn (array $status) => $status['status'] === HomeworkAssignmentStatus::STATUS_NEEDS_HELP),
            'class_title' => $assignment->liveSession?->title ?? 'Assigned homework',
            'class_date' => $assignment->liveSession?->scheduled_at?->format('M d, Y') ?? $assignment->created_at?->format('M d, Y'),
            'lesson_title' => $assignment->lesson?->translated_title ?? $assignment->lesson?->title,
            'student_count' => $studentStatuses->count(),
            'completed_count' => $studentStatuses->where('status', HomeworkAssignmentStatus::STATUS_COMPLETED)->count(),
            'not_completed_count' => $studentStatuses
                ->whereIn('status', [HomeworkAssignmentStatus::STATUS_NOT_STARTED, HomeworkAssignmentStatus::STATUS_NEEDS_HELP])
                ->count(),
            'needs_help_count' => $studentStatuses->where('status', HomeworkAssignmentStatus::STATUS_NEEDS_HELP)->count(),
            'student_statuses' => $studentStatuses,
        ];
    }

    private function studentHomeworkStatus(HomeworkAssignment $assignment, User $student): array
    {
        $status = Schema::hasTable('homework_assignment_statuses') && $assignment->relationLoaded('studentStatuses')
            ? $assignment->studentStatuses->firstWhere('student_id', $student->id)
            : null;
        $statusValue = $status?->status ?? HomeworkAssignmentStatus::STATUS_NOT_STARTED;

        return [
            'student_id' => $student->id,
            'student_name' => $student->name,
            'student_email' => $student->email,
            'status' => $statusValue,
            'status_label' => ucfirst(str_replace('_', ' ', $statusValue)),
            'is_completed' => $statusValue === HomeworkAssignmentStatus::STATUS_COMPLETED,
            'needs_help' => $statusValue === HomeworkAssignmentStatus::STATUS_NEEDS_HELP,
            'completed_at' => $status?->completed_at?->toISOString(),
            'help_requested_at' => $status?->help_requested_at?->toISOString(),
        ];
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

        $status = data_get($sessionData, 'homework_status')
            ?? data_get($homework, 'status')
            ?? (isset($sessionData['homework_assigned']) ? ($sessionData['homework_assigned'] ? 'Assigned' : 'Not assigned') : null);

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

    private function attendanceSummary(
        Collection $attendanceClasses,
        Collection $groupStudents,
        array $meetingAttendance
    ): array {
        $liveSessionRecords = $attendanceClasses
            ->flatMap(fn (ClassSchedule $schedule) => $this->attendanceRecordsFor($schedule, $groupStudents))
            ->values();
        $meetingRecords = collect($meetingAttendance['student_summaries'] ?? [])
            ->flatMap(fn (array $studentSummary) => $studentSummary['records'] ?? [])
            ->map(fn (array $record) => [
                'student_id' => $record['student_id'],
                'student_name' => $record['student_name'],
                'student_email' => $record['student_email'],
                'status' => $record['status'] === 'attended'
                    ? LiveSessionAttendance::STATUS_PRESENT
                    : LiveSessionAttendance::STATUS_ABSENT,
                'status_label' => $record['status_label'],
                'class_id' => "meeting-{$record['meeting_id']}",
                'class_title' => $record['meeting_title'],
                'class_date' => $record['date'],
                'scheduled_at' => $record['scheduled_at'],
                'marked_at' => $record['attendance_marked_at'],
                'marked_by' => $record['attendance_marked_by'],
                'source_type' => 'meeting',
                'source_id' => $record['meeting_id'],
            ])
            ->values();
        $records = $liveSessionRecords->concat($meetingRecords)->values();

        $attendedStatuses = [
            LiveSessionAttendance::STATUS_PRESENT,
            LiveSessionAttendance::STATUS_LATE,
            LiveSessionAttendance::STATUS_CAUGHT_UP_LATER,
        ];
        $attendedCount = $records->whereIn('status', $attendedStatuses)->count();
        $missedCount = $records->where('status', LiveSessionAttendance::STATUS_ABSENT)->count();
        $excusedCount = $records->where('status', LiveSessionAttendance::STATUS_EXCUSED)->count();
        $ratedRecords = $records->count() - $excusedCount;

        return [
            'classes_completed' => $attendanceClasses->where('status', 'completed')->count()
                + $meetingRecords->pluck('source_id')->unique()->count(),
            'attendance_records' => $records->count(),
            'attended_count' => $attendedCount,
            'missed_count' => $missedCount,
            'excused_count' => $excusedCount,
            'status_counts' => collect(LiveSessionAttendance::STATUSES)
                ->mapWithKeys(fn (string $status) => [$status => $records->where('status', $status)->count()]),
            'attendance_rate' => $ratedRecords > 0 ? (float) round(($attendedCount / $ratedRecords) * 100, 1) : null,
            'student_history' => $groupStudents->map(function (User $student) use ($records) {
                return [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'student_email' => $student->email,
                    'records' => $records
                        ->where('student_id', $student->id)
                        ->sortByDesc('scheduled_at')
                        ->values(),
                ];
            })->values(),
            'recent_classes' => $attendanceClasses
                ->map(function (ClassSchedule $schedule) use ($groupStudents) {
                    $records = collect($this->attendanceRecordsFor($schedule, $groupStudents));

                    return [
                        'id' => $schedule->id,
                        'title' => $schedule->title,
                        'date' => $schedule->scheduled_at?->format('M d, Y'),
                        'attended_count' => $records->whereIn('status', [
                            LiveSessionAttendance::STATUS_PRESENT,
                            LiveSessionAttendance::STATUS_LATE,
                            LiveSessionAttendance::STATUS_CAUGHT_UP_LATER,
                        ])->count(),
                        'missed_count' => $records->where('status', LiveSessionAttendance::STATUS_ABSENT)->count(),
                        'excused_count' => $records->where('status', LiveSessionAttendance::STATUS_EXCUSED)->count(),
                        'records_count' => $records->count(),
                    ];
                })
                ->filter(fn (array $class) => $class['records_count'] > 0)
                ->take(5)
                ->values(),
        ];
    }

    private function attendanceRecordsFor(ClassSchedule $schedule, Collection $groupStudents): array
    {
        $studentMap = $groupStudents->keyBy('id');

        if ($schedule->relationLoaded('attendanceRecords') && $schedule->attendanceRecords->isNotEmpty()) {
            return $schedule->attendanceRecords
                ->whereIn('student_id', $studentMap->keys())
                ->map(fn (LiveSessionAttendance $attendance) => [
                    'student_id' => $attendance->student_id,
                    'student_name' => $studentMap->get($attendance->student_id)?->name ?? $attendance->student?->name,
                    'student_email' => $studentMap->get($attendance->student_id)?->email ?? $attendance->student?->email,
                    'status' => $attendance->status,
                    'status_label' => ucfirst(str_replace('_', ' ', $attendance->status)),
                    'class_id' => $schedule->id,
                    'class_title' => $schedule->title,
                    'class_date' => $schedule->scheduled_at?->format('M d, Y'),
                    'scheduled_at' => $schedule->scheduled_at?->toISOString(),
                    'marked_at' => $attendance->marked_at?->toISOString(),
                    'marked_by' => $attendance->markedBy?->name,
                ])
                ->values()
                ->all();
        }

        $sessionData = $schedule->session_data ?? [];
        $explicitAttendance = collect([
            data_get($sessionData, 'attendance'),
            data_get($sessionData, 'attendance_records'),
            data_get($sessionData, 'attendanceRecords'),
            data_get($sessionData, 'students_attendance'),
            data_get($sessionData, 'studentAttendance'),
        ])
            ->flatMap(fn ($value) => $this->normalizeAttendanceRecords($value, $studentMap, $schedule))
            ->values();

        return $explicitAttendance->all();
    }

    private function normalizeAttendanceRecords($value, Collection $studentMap, ClassSchedule $schedule): array
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

        $records = array_is_list($value)
            ? $value
            : collect($value)->map(fn ($status, $studentId) => [
                'student_id' => is_numeric($studentId) ? (int) $studentId : null,
                'student_name' => is_string($studentId) && ! is_numeric($studentId) ? $studentId : null,
                'status' => $status,
            ])->values()->all();

        return collect($records)
            ->filter(fn ($record) => is_array($record))
            ->map(function (array $record) use ($studentMap, $schedule) {
                $studentId = $record['student_id'] ?? $record['user_id'] ?? $record['id'] ?? null;
                $studentId = is_numeric($studentId) ? (int) $studentId : null;

                if ($studentId && ! $studentMap->has($studentId)) {
                    return null;
                }

                $status = $this->attendanceStatusFrom(
                    $record['status']
                        ?? $record['attendance_status']
                        ?? $record['present']
                        ?? $record['attended']
                        ?? $record['is_present']
                        ?? $record['was_present']
                        ?? null
                );

                if (! $status) {
                    return null;
                }

                return [
                    'student_id' => $studentId,
                    'student_name' => $studentMap->get($studentId)?->name
                        ?? $record['student_name']
                        ?? $record['name']
                        ?? null,
                    'student_email' => $studentMap->get($studentId)?->email,
                    'status' => $status,
                    'status_label' => ucfirst(str_replace('_', ' ', $status)),
                    'class_id' => $schedule->id,
                    'class_title' => $schedule->title,
                    'class_date' => $schedule->scheduled_at?->format('M d, Y'),
                    'scheduled_at' => $schedule->scheduled_at?->toISOString(),
                    'marked_at' => null,
                    'marked_by' => null,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function attendanceStatusFrom($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_bool($value)) {
            return $value ? LiveSessionAttendance::STATUS_PRESENT : LiveSessionAttendance::STATUS_ABSENT;
        }

        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            '1', 'true', 'yes', 'present', 'attended', 'complete', 'completed' => LiveSessionAttendance::STATUS_PRESENT,
            '0', 'false', 'no', 'absent', 'missed', 'not attended', 'not_attended' => LiveSessionAttendance::STATUS_ABSENT,
            'late' => LiveSessionAttendance::STATUS_LATE,
            'excused' => LiveSessionAttendance::STATUS_EXCUSED,
            'caught up later', 'caught_up_later', 'caught-up-later' => LiveSessionAttendance::STATUS_CAUGHT_UP_LATER,
            default => null,
        };
    }

    private function helpRequests(Collection $completedClasses, Collection $groupStudents, Collection $homeworkAssignments): array
    {
        $studentMap = $groupStudents->keyBy('id');

        $legacyRequests = $completedClasses
            ->flatMap(function (ClassSchedule $schedule) use ($studentMap) {
                $sessionData = $schedule->session_data ?? [];
                $homework = $this->homeworkFrom($sessionData);
                $requests = collect([
                    data_get($sessionData, 'help_requests'),
                    data_get($sessionData, 'helpRequests'),
                    data_get($sessionData, 'student_help_requests'),
                    data_get($sessionData, 'studentHelpRequests'),
                ])
                    ->flatMap(fn ($value) => $this->normalizeHelpRequests($value, $studentMap, $schedule))
                    ->values();

                if ($requests->isNotEmpty()) {
                    return $requests;
                }

                if ($homework && $homework['needs_help']) {
                    return [[
                        'student_id' => null,
                        'student_name' => null,
                        'class_title' => $schedule->title,
                        'class_date' => ($schedule->completed_at ?? $schedule->scheduled_at)?->format('M d, Y'),
                        'message' => $homework['current'] ?: 'Help requested for homework.',
                        'status' => 'open',
                    ]];
                }

                return [];
            })
            ->values();

        $assignmentRequests = Schema::hasTable('homework_assignment_statuses') ? $homeworkAssignments
            ->flatMap(function (HomeworkAssignment $assignment) use ($studentMap) {
                if (! $assignment->relationLoaded('studentStatuses')) {
                    return collect();
                }

                return $assignment->studentStatuses
                    ->where('status', HomeworkAssignmentStatus::STATUS_NEEDS_HELP)
                    ->map(function (HomeworkAssignmentStatus $status) use ($assignment, $studentMap) {
                        return [
                            'student_id' => $status->student_id,
                            'student_name' => $studentMap->get($status->student_id)?->name ?? $status->student?->name,
                            'class_title' => $assignment->liveSession?->title ?? 'Assigned homework',
                            'class_date' => $assignment->liveSession?->scheduled_at?->format('M d, Y') ?? $assignment->created_at?->format('M d, Y'),
                            'message' => $assignment->title,
                            'status' => 'open',
                        ];
                    });
            })
            ->values() : collect();

        return $assignmentRequests
            ->concat($legacyRequests)
            ->take(10)
            ->values()
            ->all();
    }

    private function normalizeHelpRequests($value, Collection $studentMap, ClassSchedule $schedule): array
    {
        if (! $value) {
            return [];
        }

        if (is_string($value)) {
            $value = [['message' => $value]];
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
            ->map(function (array $item) use ($studentMap, $schedule) {
                $studentId = $item['student_id'] ?? $item['user_id'] ?? null;
                $studentId = is_numeric($studentId) ? (int) $studentId : null;

                if ($studentId && ! $studentMap->has($studentId)) {
                    return null;
                }

                return [
                    'student_id' => $studentId,
                    'student_name' => $studentMap->get($studentId)?->name
                        ?? $item['student_name']
                        ?? $item['name']
                        ?? null,
                    'class_title' => $schedule->title,
                    'class_date' => ($schedule->completed_at ?? $schedule->scheduled_at)?->format('M d, Y'),
                    'message' => $item['message']
                        ?? $item['note']
                        ?? $item['text']
                        ?? $item['homework']
                        ?? 'Help requested.',
                    'status' => $item['status'] ?? 'open',
                ];
            })
            ->filter()
            ->values()
            ->all();
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
}
