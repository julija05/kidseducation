<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PracticeResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'learning_group_id',
        'created_by',
        'title',
        'message',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'file_size' => 'integer',
    ];

    /**
     * The learning group this practice resource was posted to.
     */
    public function learningGroup(): BelongsTo
    {
        return $this->belongsTo(LearningGroup::class);
    }

    /**
     * The mentor who created the practice resource.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Only active practice resources.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Whether this resource has an attached file.
     */
    public function hasFile(): bool
    {
        return ! empty($this->file_path);
    }

    /**
     * Whether the attached file is a PDF (used for inline preview vs download).
     */
    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }
}
