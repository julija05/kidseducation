<?php

namespace App\Services;

use App\Models\HomeworkAssignment;
use App\Models\HomeworkAssignmentStatus;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class HomeworkAssignmentDashboardService
{
    public function forStudent(User $student): Collection
    {
        if (! Schema::hasTable('homework_assignments') || ! Schema::hasTable('learning_group_student')) {
            return collect();
        }

        return $this->baseStudentQuery($student)
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date')
            ->latest('id')
            ->get()
            ->map(fn (HomeworkAssignment $assignment) => $this->format($assignment, $student))
            ->values();
    }

    public function forStudentLesson(User $student, Lesson $lesson): Collection
    {
        if (! Schema::hasTable('homework_assignments') || ! Schema::hasTable('learning_group_student')) {
            return collect();
        }

        return $this->baseStudentQuery($student)
            ->where('lesson_id', $lesson->id)
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date')
            ->latest('id')
            ->get()
            ->map(fn (HomeworkAssignment $assignment) => $this->format($assignment, $student))
            ->values();
    }

    public function latestForStudent(User $student): ?array
    {
        return $this->forStudent($student)->first();
    }

    public function format(HomeworkAssignment $assignment, ?User $student = null): array
    {
        $studentStatus = $this->statusForStudent($assignment, $student);

        return [
            'id' => $assignment->id,
            'title' => $assignment->title,
            'instructions' => $assignment->instructions,
            'status' => $assignment->status,
            'student_status' => $studentStatus['status'],
            'student_status_label' => $this->statusLabel($studentStatus['status']),
            'is_completed' => $studentStatus['status'] === HomeworkAssignmentStatus::STATUS_COMPLETED,
            'needs_help' => $studentStatus['status'] === HomeworkAssignmentStatus::STATUS_NEEDS_HELP,
            'completed_at' => $studentStatus['completed_at'],
            'help_requested_at' => $studentStatus['help_requested_at'],
            'practice_tasks' => $this->formatPracticeTasks($assignment),
            'due_date' => $assignment->due_date?->toDateString(),
            'estimated_practice_time' => $this->formatPracticeTime($assignment->estimated_practice_minutes),
            'estimated_practice_minutes' => $assignment->estimated_practice_minutes,
            'group' => $assignment->learningGroup ? [
                'id' => $assignment->learningGroup->id,
                'name' => $assignment->learningGroup->name,
            ] : null,
            'program' => $assignment->learningGroup?->program ? [
                'id' => $assignment->learningGroup->program->id,
                'name' => $assignment->learningGroup->program->name,
                'slug' => $assignment->learningGroup->program->slug,
            ] : null,
            'lesson' => $assignment->lesson ? [
                'id' => $assignment->lesson->id,
                'title' => $assignment->lesson->title,
                'level' => $assignment->lesson->level,
            ] : null,
            'live_session' => $assignment->liveSession ? [
                'id' => $assignment->liveSession->id,
                'title' => $assignment->liveSession->title,
                'scheduled_at' => $assignment->liveSession->scheduled_at?->toISOString(),
                'date' => $assignment->liveSession->scheduled_at?->format('M d, Y'),
                'time' => $assignment->liveSession->scheduled_at?->format('g:i A'),
                'meeting_link' => $assignment->liveSession->meeting_link,
                'status' => $assignment->liveSession->status,
            ] : null,
        ];
    }

    private function baseStudentQuery(User $student): Builder
    {
        $relations = [
            'learningGroup:id,name,program_id,mentor_id',
            'learningGroup.program:id,name,slug',
            'lesson:id,title,program_id,level',
            'liveSession:id,title,scheduled_at,meeting_link,status',
        ];

        if (Schema::hasTable('homework_practice_tasks')) {
            $relations[] = 'practiceTasks';
        }

        if (Schema::hasTable('homework_assignment_statuses')) {
            $relations['studentStatuses'] = fn ($query) => $query->where('student_id', $student->id);
        }

        if (Schema::hasTable('homework_practice_task_completions')) {
            $relations['practiceTasks.completions'] = fn ($query) => $query->where('student_id', $student->id);
        }

        return HomeworkAssignment::with($relations)
            ->visible()
            ->whereHas('learningGroup.students', fn ($query) => $query->where('users.id', $student->id));
    }

    private function formatPracticeTasks(HomeworkAssignment $assignment): array
    {
        if (! $assignment->relationLoaded('practiceTasks')) {
            return [];
        }

        return $assignment->practiceTasks
            ->map(function ($task) {
                $completion = $task->relationLoaded('completions') ? $task->completions->first() : null;

                return [
                    'id' => $task->id,
                    'prompt' => $task->prompt,
                    'is_done' => $completion !== null,
                    'completed_at' => $completion?->completed_at?->toISOString(),
                ];
            })
            ->values()
            ->all();
    }

    private function statusForStudent(HomeworkAssignment $assignment, ?User $student): array
    {
        if (! $student || ! Schema::hasTable('homework_assignment_statuses')) {
            return $this->defaultStudentStatus();
        }

        $status = $assignment->relationLoaded('studentStatuses')
            ? $assignment->studentStatuses->firstWhere('student_id', $student->id)
            : $assignment->studentStatuses()->where('student_id', $student->id)->first();

        if (! $status) {
            return $this->defaultStudentStatus();
        }

        return [
            'status' => $status->status,
            'completed_at' => $status->completed_at?->toISOString(),
            'help_requested_at' => $status->help_requested_at?->toISOString(),
        ];
    }

    private function defaultStudentStatus(): array
    {
        return [
            'status' => HomeworkAssignmentStatus::STATUS_NOT_STARTED,
            'completed_at' => null,
            'help_requested_at' => null,
        ];
    }

    private function statusLabel(?string $status): ?string
    {
        if (! $status) {
            return null;
        }

        return ucfirst(str_replace('_', ' ', $status));
    }

    private function formatPracticeTime(?int $minutes): ?string
    {
        if (! $minutes) {
            return null;
        }

        return $minutes.' min';
    }
}
