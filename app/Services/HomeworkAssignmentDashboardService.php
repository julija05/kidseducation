<?php

namespace App\Services;

use App\Models\HomeworkAssignment;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class HomeworkAssignmentDashboardService
{
    public function forStudent(User $student): Collection
    {
        if (! Schema::hasTable('homework_assignments') || ! Schema::hasTable('learning_group_student')) {
            return collect();
        }

        return HomeworkAssignment::with([
            'learningGroup:id,name,program_id,mentor_id',
            'learningGroup.program:id,name,slug',
            'lesson:id,title,program_id,level',
            'liveSession:id,title,scheduled_at,meeting_link,status',
        ])
            ->visible()
            ->whereHas('learningGroup.students', fn ($query) => $query->where('users.id', $student->id))
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date')
            ->latest('id')
            ->get()
            ->map(fn (HomeworkAssignment $assignment) => $this->format($assignment))
            ->values();
    }

    public function latestForStudent(User $student): ?array
    {
        return $this->forStudent($student)->first();
    }

    public function format(HomeworkAssignment $assignment): array
    {
        return [
            'id' => $assignment->id,
            'title' => $assignment->title,
            'instructions' => $assignment->instructions,
            'status' => $assignment->status,
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

    private function formatPracticeTime(?int $minutes): ?string
    {
        if (! $minutes) {
            return null;
        }

        return $minutes.' min';
    }
}
