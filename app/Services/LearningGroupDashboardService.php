<?php

namespace App\Services;

use App\Models\ClassSchedule;
use App\Models\LearningGroup;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class LearningGroupDashboardService
{
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
        $learningGroup->loadMissing([
            'program:id,name,slug',
            'mentor:id,name,email',
            'students:id,name,email',
            'students.enrollments:id,user_id,program_id,status,approval_status,progress',
        ]);

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
            ->limit(12)
            ->get();

        $currentLesson = $this->currentLessonFor($learningGroup, $upcomingClass, $completedClasses);

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
            'homework_summary' => $this->homeworkSummary($completedClasses),
            'attendance_summary' => $this->attendanceSummary($completedClasses, $learningGroup->students),
            'help_requests' => $this->helpRequests($completedClasses, $learningGroup->students),
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

    private function homeworkSummary(Collection $completedClasses): array
    {
        $homeworkItems = $completedClasses
            ->map(fn (ClassSchedule $schedule) => [
                'schedule' => $schedule,
                'homework' => $this->homeworkFrom($schedule->session_data ?? []),
            ])
            ->filter(fn (array $item) => $item['homework'] !== null)
            ->values();

        $completed = $homeworkItems->filter(fn (array $item) => $item['homework']['is_completed'] === true)->count();
        $notCompleted = $homeworkItems->filter(fn (array $item) => $item['homework']['is_completed'] === false)->count();
        $needsHelp = $homeworkItems->filter(fn (array $item) => $item['homework']['needs_help'] === true)->count();
        $latest = $homeworkItems->first();

        return [
            'assigned_count' => $homeworkItems->count(),
            'completed_count' => $completed,
            'not_completed_count' => $notCompleted,
            'needs_help_count' => $needsHelp,
            'latest' => $latest ? [
                ...$latest['homework'],
                'class_title' => $latest['schedule']->title,
                'class_date' => ($latest['schedule']->completed_at ?? $latest['schedule']->scheduled_at)?->format('M d, Y'),
            ] : null,
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

    private function attendanceSummary(Collection $completedClasses, Collection $groupStudents): array
    {
        $records = $completedClasses
            ->flatMap(fn (ClassSchedule $schedule) => $this->attendanceRecordsFor($schedule, $groupStudents))
            ->values();

        $attendedCount = $records->where('status', 'attended')->count();
        $missedCount = $records->where('status', 'missed')->count();
        $totalRecords = $records->count();

        return [
            'classes_completed' => $completedClasses->count(),
            'attendance_records' => $totalRecords,
            'attended_count' => $attendedCount,
            'missed_count' => $missedCount,
            'attendance_rate' => $totalRecords > 0 ? (float) round(($attendedCount / $totalRecords) * 100, 1) : null,
            'recent_classes' => $completedClasses
                ->take(5)
                ->map(function (ClassSchedule $schedule) use ($groupStudents) {
                    $records = collect($this->attendanceRecordsFor($schedule, $groupStudents));

                    return [
                        'id' => $schedule->id,
                        'title' => $schedule->title,
                        'date' => ($schedule->completed_at ?? $schedule->scheduled_at)?->format('M d, Y'),
                        'attended_count' => $records->where('status', 'attended')->count(),
                        'missed_count' => $records->where('status', 'missed')->count(),
                    ];
                })
                ->values(),
        ];
    }

    private function attendanceRecordsFor(ClassSchedule $schedule, Collection $groupStudents): array
    {
        $sessionData = $schedule->session_data ?? [];
        $studentMap = $groupStudents->keyBy('id');
        $explicitAttendance = collect([
            data_get($sessionData, 'attendance'),
            data_get($sessionData, 'attendance_records'),
            data_get($sessionData, 'attendanceRecords'),
            data_get($sessionData, 'students_attendance'),
            data_get($sessionData, 'studentAttendance'),
        ])
            ->flatMap(fn ($value) => $this->normalizeAttendanceRecords($value, $studentMap, $schedule))
            ->values();

        if ($explicitAttendance->isNotEmpty()) {
            return $explicitAttendance->all();
        }

        $scheduledStudents = $schedule->is_group_class
            ? $schedule->students->whereIn('id', $studentMap->keys())
            : $groupStudents->where('id', $schedule->student_id);

        return $scheduledStudents
            ->map(fn (User $student) => [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'status' => 'attended',
                'class_id' => $schedule->id,
            ])
            ->values()
            ->all();
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
                    'status' => $status,
                    'class_id' => $schedule->id,
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
            return $value ? 'attended' : 'missed';
        }

        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            '1', 'true', 'yes', 'present', 'attended', 'complete', 'completed' => 'attended',
            '0', 'false', 'no', 'absent', 'missed', 'not attended', 'not_attended' => 'missed',
            'late' => 'attended',
            default => null,
        };
    }

    private function helpRequests(Collection $completedClasses, Collection $groupStudents): array
    {
        $studentMap = $groupStudents->keyBy('id');

        return $completedClasses
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
