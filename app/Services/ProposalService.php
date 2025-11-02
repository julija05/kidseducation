<?php

namespace App\Services;

use App\Constants\ProposalStatus;
use App\Constants\ProposalType;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\Program;
use App\Models\ResourceProposal;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * ProposalService
 * Handles business logic for mentor proposals and admin reviews
 * Follows Single Responsibility Principle
 */
class ProposalService
{
    /**
     * Create a resource proposal
     *
     * @param User $mentor
     * @param array $data
     * @return ResourceProposal
     */
    public function createResourceProposal(User $mentor, array $data): ResourceProposal
    {
        return ResourceProposal::create([
            'lesson_id' => $data['lesson_id'],
            'program_id' => $data['program_id'] ?? null,
            'lesson_resource_id' => $data['lesson_resource_id'] ?? null,
            'proposed_by' => $mentor->id,
            'proposal_type' => $data['proposal_type'],
            'proposed_title' => $data['proposed_title'] ?? null,
            'proposed_description' => $data['proposed_description'] ?? null,
            'proposed_resource_type' => $data['proposed_resource_type'] ?? null,
            'proposed_youtube_url' => $data['proposed_youtube_url'] ?? null,
            'proposed_file_path' => $data['proposed_file_path'] ?? null,
            'proposed_order' => $data['proposed_order'] ?? null,
            'mentor_notes' => $data['mentor_notes'] ?? null,
            'status' => ProposalStatus::PENDING,
            'original_data' => $data['original_data'] ?? null,
        ]);
    }

    /**
     * Create a lesson proposal
     *
     * @param User $mentor
     * @param array $data
     * @return ResourceProposal
     */
    public function createLessonProposal(User $mentor, array $data): ResourceProposal
    {
        return ResourceProposal::create([
            'program_id' => $data['program_id'],
            'lesson_id' => $data['lesson_id'] ?? null,
            'proposed_by' => $mentor->id,
            'proposal_type' => $data['proposal_type'],
            'proposed_lesson_title' => $data['proposed_lesson_title'] ?? null,
            'proposed_lesson_description' => $data['proposed_lesson_description'] ?? null,
            'proposed_lesson_level' => $data['proposed_lesson_level'] ?? null,
            'proposed_lesson_order' => $data['proposed_lesson_order'] ?? null,
            'mentor_notes' => $data['mentor_notes'] ?? null,
            'status' => ProposalStatus::PENDING,
            'original_data' => $data['original_data'] ?? null,
        ]);
    }

    /**
     * Create a level proposal
     *
     * @param User $mentor
     * @param array $data
     * @return ResourceProposal
     */
    public function createLevelProposal(User $mentor, array $data): ResourceProposal
    {
        return ResourceProposal::create([
            'program_id' => $data['program_id'],
            'proposed_by' => $mentor->id,
            'proposal_type' => $data['proposal_type'],
            'proposed_level_number' => $data['proposed_level_number'] ?? null,
            'proposed_level_description' => $data['proposed_level_description'] ?? null,
            'mentor_notes' => $data['mentor_notes'] ?? null,
            'status' => ProposalStatus::PENDING,
        ]);
    }

    /**
     * Get pending proposals for admin review
     *
     * @return Collection
     */
    public function getPendingProposals(): Collection
    {
        return ResourceProposal::with(['proposedBy', 'program', 'lesson', 'lessonResource'])
            ->where('status', ProposalStatus::PENDING)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get proposals for a specific program
     *
     * @param int $programId
     * @param string|null $status
     * @return Collection
     */
    public function getProposalsByProgram(int $programId, ?string $status = null): Collection
    {
        $query = ResourceProposal::with(['proposedBy', 'program', 'lesson', 'lessonResource'])
            ->where('program_id', $programId);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get proposals created by a specific mentor
     *
     * @param User $mentor
     * @return Collection
     */
    public function getMentorProposals(User $mentor): Collection
    {
        return ResourceProposal::with(['program', 'lesson', 'lessonResource', 'reviewedBy'])
            ->where('proposed_by', $mentor->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Approve a proposal
     *
     * @param ResourceProposal $proposal
     * @param User $admin
     * @param string|null $notes
     * @return bool
     */
    public function approveProposal(ResourceProposal $proposal, User $admin, ?string $notes = null): bool
    {
        if (!$proposal->isPending()) {
            \Log::warning('Attempted to approve non-pending proposal', [
                'proposal_id' => $proposal->id,
                'status' => $proposal->status,
            ]);
            return false;
        }

        return $proposal->approve($admin, $notes);
    }

    /**
     * Reject a proposal
     *
     * @param ResourceProposal $proposal
     * @param User $admin
     * @param string|null $notes
     * @return bool
     */
    public function rejectProposal(ResourceProposal $proposal, User $admin, ?string $notes = null): bool
    {
        if (!$proposal->isPending()) {
            \Log::warning('Attempted to reject non-pending proposal', [
                'proposal_id' => $proposal->id,
                'status' => $proposal->status,
            ]);
            return false;
        }

        return $proposal->reject($admin, $notes);
    }

    /**
     * Format proposal for frontend display
     *
     * @param ResourceProposal $proposal
     * @return array
     */
    public function formatProposalForFrontend(ResourceProposal $proposal): array
    {
        return [
            'id' => $proposal->id,
            'type' => $proposal->proposal_type,
            'type_label' => ProposalType::getLabel($proposal->proposal_type),
            'status' => $proposal->status,
            'status_label' => ProposalStatus::getLabel($proposal->status),
            'status_color' => ProposalStatus::getColorClass($proposal->status),
            'proposed_by' => [
                'id' => $proposal->proposedBy->id,
                'name' => $proposal->proposedBy->name,
                'email' => $proposal->proposedBy->email,
            ],
            'program' => $proposal->program ? [
                'id' => $proposal->program->id,
                'name' => $proposal->program->name,
                'slug' => $proposal->program->slug,
            ] : null,
            'lesson' => $proposal->lesson ? [
                'id' => $proposal->lesson->id,
                'title' => $proposal->lesson->title,
                'level' => $proposal->lesson->level,
            ] : null,
            'resource' => $proposal->lessonResource ? [
                'id' => $proposal->lessonResource->id,
                'title' => $proposal->lessonResource->title,
                'type' => $proposal->lessonResource->resource_type,
            ] : null,
            'proposed_data' => $this->getProposedDataForDisplay($proposal),
            'mentor_notes' => $proposal->mentor_notes,
            'admin_notes' => $proposal->admin_notes,
            'reviewed_by' => $proposal->reviewedBy ? [
                'id' => $proposal->reviewedBy->id,
                'name' => $proposal->reviewedBy->name,
            ] : null,
            'reviewed_at' => $proposal->reviewed_at?->format('M d, Y h:i A'),
            'created_at' => $proposal->created_at->format('M d, Y h:i A'),
        ];
    }

    /**
     * Get proposed data formatted for display
     *
     * @param ResourceProposal $proposal
     * @return array
     */
    protected function getProposedDataForDisplay(ResourceProposal $proposal): array
    {
        if ($proposal->isResourceProposal()) {
            return [
                'title' => $proposal->proposed_title,
                'description' => $proposal->proposed_description,
                'resource_type' => $proposal->proposed_resource_type,
                'youtube_url' => $proposal->proposed_youtube_url,
                'order' => $proposal->proposed_order,
            ];
        }

        if ($proposal->isLessonProposal()) {
            return [
                'title' => $proposal->proposed_lesson_title,
                'description' => $proposal->proposed_lesson_description,
                'level' => $proposal->proposed_lesson_level,
                'order' => $proposal->proposed_lesson_order,
            ];
        }

        if ($proposal->isLevelProposal()) {
            return [
                'level_number' => $proposal->proposed_level_number,
                'description' => $proposal->proposed_level_description,
            ];
        }

        return [];
    }
}
