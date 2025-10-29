<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourceProposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_resource_id',
        'lesson_id',
        'proposed_by',
        'proposal_type',
        'proposed_data',
        'proposed_title',
        'proposed_description',
        'proposed_resource_type',
        'proposed_youtube_url',
        'proposed_file_path',
        'proposed_order',
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
        return $this->status === 'pending';
    }

    /**
     * Check if proposal is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if proposal is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Approve the proposal and apply changes
     */
    public function approve(User $admin, ?string $notes = null): bool
    {
        $this->status = 'approved';
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
        $this->status = 'rejected';
        $this->reviewed_by = $admin->id;
        $this->reviewed_at = now();
        $this->admin_notes = $notes;
        return $this->save();
    }

    /**
     * Apply the proposed changes to the actual resource
     */
    protected function applyChanges(): bool
    {
        try {
            switch ($this->proposal_type) {
                case 'create':
                    return $this->createResource();
                case 'update':
                    return $this->updateResource();
                case 'delete':
                    return $this->deleteResource();
                default:
                    return false;
            }
        } catch (\Exception $e) {
            \Log::error('Failed to apply resource proposal changes', [
                'proposal_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Create a new resource
     */
    protected function createResource(): bool
    {
        $resource = LessonResource::create([
            'lesson_id' => $this->lesson_id,
            'title' => $this->proposed_title,
            'description' => $this->proposed_description,
            'resource_type' => $this->proposed_resource_type,
            'youtube_url' => $this->proposed_youtube_url,
            'file_path' => $this->proposed_file_path,
            'order' => $this->proposed_order ?? 0,
        ]);

        $this->lesson_resource_id = $resource->id;
        $this->save();

        return true;
    }

    /**
     * Update an existing resource
     */
    protected function updateResource(): bool
    {
        if (!$this->lessonResource) {
            return false;
        }

        $this->lessonResource->update([
            'title' => $this->proposed_title ?? $this->lessonResource->title,
            'description' => $this->proposed_description ?? $this->lessonResource->description,
            'resource_type' => $this->proposed_resource_type ?? $this->lessonResource->resource_type,
            'youtube_url' => $this->proposed_youtube_url ?? $this->lessonResource->youtube_url,
            'file_path' => $this->proposed_file_path ?? $this->lessonResource->file_path,
            'order' => $this->proposed_order ?? $this->lessonResource->order,
        ]);

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
}
