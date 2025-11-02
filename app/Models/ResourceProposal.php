<?php

namespace App\Models;

use App\Constants\ProposalStatus;
use App\Constants\ProposalType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ResourceProposal Model
 * Handles mentor proposals for resources, lessons, and levels
 * Implements approval workflow for program modifications
 */
class ResourceProposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_resource_id',
        'lesson_id',
        'program_id',
        'proposed_by',
        'proposal_type',
        'proposed_data',
        // Resource fields
        'proposed_title',
        'proposed_description',
        'proposed_resource_type',
        'proposed_youtube_url',
        'proposed_file_path',
        'proposed_order',
        // Lesson fields
        'proposed_lesson_title',
        'proposed_lesson_description',
        'proposed_lesson_level',
        'proposed_lesson_order',
        // Level fields
        'proposed_level_number',
        'proposed_level_description',
        // Workflow fields
        'original_data',
        'status',
        'mentor_notes',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'proposed_data' => 'array',
        'original_data' => 'array',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the lesson resource being proposed for modification
     */
    public function lessonResource(): BelongsTo
    {
        return $this->belongsTo(LessonResource::class);
    }

    /**
     * Get the lesson this proposal belongs to
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /**
     * Get the program this proposal belongs to
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the mentor who proposed the changes
     */
    public function proposedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proposed_by');
    }

    /**
     * Get the admin who reviewed the proposal
     */
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Check if proposal is pending
     */
    public function isPending(): bool
    {
        return $this->status === ProposalStatus::PENDING;
    }

    /**
     * Check if proposal is approved
     */
    public function isApproved(): bool
    {
        return $this->status === ProposalStatus::APPROVED;
    }

    /**
     * Check if proposal is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === ProposalStatus::REJECTED;
    }

    /**
     * Check if proposal has been applied
     */
    public function isApplied(): bool
    {
        return $this->status === ProposalStatus::APPLIED;
    }

    /**
     * Check if proposal is for a resource
     */
    public function isResourceProposal(): bool
    {
        return in_array($this->proposal_type, ProposalType::resourceTypes());
    }

    /**
     * Check if proposal is for a lesson
     */
    public function isLessonProposal(): bool
    {
        return in_array($this->proposal_type, ProposalType::lessonTypes());
    }

    /**
     * Check if proposal is for a level
     */
    public function isLevelProposal(): bool
    {
        return in_array($this->proposal_type, ProposalType::levelTypes());
    }

    /**
     * Approve the proposal and apply changes
     */
    public function approve(User $admin, ?string $notes = null): bool
    {
        $this->status = ProposalStatus::APPROVED;
        $this->reviewed_by = $admin->id;
        $this->reviewed_at = now();
        $this->admin_notes = $notes;
        $this->save();

        // Apply the changes based on proposal type
        return $this->applyChanges();
    }

    /**
     * Reject the proposal
     */
    public function reject(User $admin, ?string $notes = null): bool
    {
        $this->status = ProposalStatus::REJECTED;
        $this->reviewed_by = $admin->id;
        $this->reviewed_at = now();
        $this->admin_notes = $notes;
        return $this->save();
    }

    /**
     * Apply the proposed changes based on proposal type
     * Handles resources, lessons, and levels
     */
    protected function applyChanges(): bool
    {
        try {
            switch ($this->proposal_type) {
                // Resource proposals
                case ProposalType::RESOURCE_CREATE:
                    return $this->createResource();
                case ProposalType::RESOURCE_UPDATE:
                    return $this->updateResource();
                case ProposalType::RESOURCE_DELETE:
                    return $this->deleteResource();

                // Lesson proposals
                case ProposalType::LESSON_CREATE:
                    return $this->createLesson();
                case ProposalType::LESSON_UPDATE:
                    return $this->updateLesson();
                case ProposalType::LESSON_DELETE:
                    return $this->deleteLesson();

                // Level proposals
                case ProposalType::LEVEL_CREATE:
                    return $this->createLevel();
                case ProposalType::LEVEL_UPDATE:
                    return $this->updateLevel();

                default:
                    \Log::warning('Unknown proposal type', [
                        'proposal_id' => $this->id,
                        'type' => $this->proposal_type,
                    ]);
                    return false;
            }
        } catch (\Exception $e) {
            \Log::error('Failed to apply proposal changes', [
                'proposal_id' => $this->id,
                'proposal_type' => $this->proposal_type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Create a new resource
     */
    protected function createResource(): bool
    {
        // Map proposal resource type to LessonResource type
        $type = $this->mapResourceType($this->proposed_resource_type);

        // For YouTube videos, use resource_url instead of youtube_url
        $resourceUrl = null;
        if ($this->proposed_resource_type === 'youtube' && $this->proposed_youtube_url) {
            $resourceUrl = $this->proposed_youtube_url;
        }

        $resource = LessonResource::create([
            'lesson_id' => $this->lesson_id,
            'title' => $this->proposed_title,
            'description' => $this->proposed_description,
            'type' => $type,
            'resource_url' => $resourceUrl,
            'file_path' => $this->proposed_file_path,
            'order' => $this->proposed_order ?? 0,
            'is_downloadable' => true,
            'is_required' => false,
        ]);

        $this->lesson_resource_id = $resource->id;
        $this->status = ProposalStatus::APPLIED;
        $this->save();

        return true;
    }

    /**
     * Map proposal resource type to LessonResource type
     *
     * @param string|null $proposalType
     * @return string
     */
    protected function mapResourceType(?string $proposalType): string
    {
        return match ($proposalType) {
            'youtube' => 'video',
            'pdf', 'word' => 'document',
            'other' => 'download',
            default => 'document',
        };
    }

    /**
     * Update an existing resource
     */
    protected function updateResource(): bool
    {
        if (!$this->lessonResource) {
            return false;
        }

        $updateData = [];

        if ($this->proposed_title) {
            $updateData['title'] = $this->proposed_title;
        }

        if ($this->proposed_description !== null) {
            $updateData['description'] = $this->proposed_description;
        }

        if ($this->proposed_resource_type) {
            $updateData['type'] = $this->mapResourceType($this->proposed_resource_type);
        }

        if ($this->proposed_youtube_url) {
            $updateData['resource_url'] = $this->proposed_youtube_url;
        }

        if ($this->proposed_file_path) {
            $updateData['file_path'] = $this->proposed_file_path;
        }

        if ($this->proposed_order !== null) {
            $updateData['order'] = $this->proposed_order;
        }

        $this->lessonResource->update($updateData);
        $this->status = ProposalStatus::APPLIED;
        $this->save();

        return true;
    }

    /**
     * Delete a resource
     */
    protected function deleteResource(): bool
    {
        if (!$this->lessonResource) {
            return false;
        }

        return $this->lessonResource->delete();
    }

    /**
     * Create a new lesson based on proposal
     */
    protected function createLesson(): bool
    {
        if (!$this->program_id) {
            \Log::error('Cannot create lesson without program_id', ['proposal_id' => $this->id]);
            return false;
        }

        $lesson = Lesson::create([
            'program_id' => $this->program_id,
            'title' => $this->proposed_lesson_title,
            'description' => $this->proposed_lesson_description,
            'level' => $this->proposed_lesson_level ?? 1,
            'order' => $this->proposed_lesson_order ?? 0,
            'is_active' => true,
        ]);

        $this->lesson_id = $lesson->id;
        $this->status = ProposalStatus::APPLIED;
        $this->save();

        return true;
    }

    /**
     * Update an existing lesson based on proposal
     */
    protected function updateLesson(): bool
    {
        if (!$this->lesson) {
            \Log::error('Lesson not found for update proposal', ['proposal_id' => $this->id]);
            return false;
        }

        $updateData = [];

        if ($this->proposed_lesson_title) {
            $updateData['title'] = $this->proposed_lesson_title;
        }
        if ($this->proposed_lesson_description) {
            $updateData['description'] = $this->proposed_lesson_description;
        }
        if ($this->proposed_lesson_level) {
            $updateData['level'] = $this->proposed_lesson_level;
        }
        if ($this->proposed_lesson_order !== null) {
            $updateData['order'] = $this->proposed_lesson_order;
        }

        if (empty($updateData)) {
            \Log::warning('No update data provided in lesson update proposal', ['proposal_id' => $this->id]);
            return false;
        }

        $this->lesson->update($updateData);
        $this->status = ProposalStatus::APPLIED;
        $this->save();

        return true;
    }

    /**
     * Delete a lesson based on proposal
     */
    protected function deleteLesson(): bool
    {
        if (!$this->lesson) {
            \Log::error('Lesson not found for delete proposal', ['proposal_id' => $this->id]);
            return false;
        }

        $this->lesson->delete();
        $this->status = ProposalStatus::APPLIED;
        $this->save();

        return true;
    }

    /**
     * Create a new level in the program
     * Creates lessons structure for the new level
     */
    protected function createLevel(): bool
    {
        if (!$this->program_id || !$this->proposed_level_number) {
            \Log::error('Cannot create level without program_id and level number', ['proposal_id' => $this->id]);
            return false;
        }

        // Check if level already exists
        $existingLesson = Lesson::where('program_id', $this->program_id)
            ->where('level', $this->proposed_level_number)
            ->first();

        if ($existingLesson) {
            \Log::warning('Level already exists in program', [
                'proposal_id' => $this->id,
                'program_id' => $this->program_id,
                'level' => $this->proposed_level_number,
            ]);
            return false;
        }

        // Create a placeholder lesson for the new level
        $lesson = Lesson::create([
            'program_id' => $this->program_id,
            'title' => "Level {$this->proposed_level_number} Introduction",
            'description' => $this->proposed_level_description ?? "Introduction to Level {$this->proposed_level_number}",
            'level' => $this->proposed_level_number,
            'order' => 0,
            'is_active' => true,
        ]);

        $this->lesson_id = $lesson->id;
        $this->status = ProposalStatus::APPLIED;
        $this->save();

        return true;
    }

    /**
     * Update level information
     * Updates all lessons in the level
     */
    protected function updateLevel(): bool
    {
        if (!$this->program_id || !$this->proposed_level_number) {
            \Log::error('Cannot update level without program_id and level number', ['proposal_id' => $this->id]);
            return false;
        }

        // Note: Level updates typically would update metadata about the level
        // For now, we'll just mark as applied since level info is stored per-lesson
        // This could be expanded to update level-specific configuration in the future

        $this->status = ProposalStatus::APPLIED;
        $this->save();

        return true;
    }
}
