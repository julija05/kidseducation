<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class LessonResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'type',
        'resource_url',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'order',
        'is_downloadable',
        'is_required',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_downloadable' => 'boolean',
        'is_required' => 'boolean',
        'order' => 'integer',
    ];

    // Relationships
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    // Scopes
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Basic accessors
    public function getFormattedFileSizeAttribute(): string
    {
        if (!$this->file_size) return '';

        $bytes = (int) $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getTypeDisplayAttribute(): string
    {
        return match ($this->type) {
            'video' => 'Video',
            'document' => 'Document',
            'link' => 'External Link',
            'download' => 'Download',
            'interactive' => 'Interactive Content',
            'quiz' => 'Quiz',
            default => 'Resource'
        };
    }

    public function getIconAttribute(): string
    {
        return match ($this->type) {
            'video' => 'Play',
            'document' => 'FileText',
            'link' => 'ExternalLink',
            'download' => 'Download',
            'interactive' => 'MousePointer',
            'quiz' => 'Trophy',
            default => 'File'
        };
    }

    // YouTube specific methods
    public function isYouTubeVideo(): bool
    {
        return $this->type === 'video' &&
            $this->resource_url &&
            (str_contains($this->resource_url, 'youtube.com') || str_contains($this->resource_url, 'youtu.be'));
    }

    public function getYouTubeVideoId(): ?string
    {
        if (!$this->isYouTubeVideo()) return null;

        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $this->resource_url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    public function getYouTubeEmbedUrl(): ?string
    {
        $videoId = $this->getYouTubeVideoId();
        return $videoId ? "https://www.youtube.com/embed/{$videoId}?enablejsapi=1&origin=" . config('app.url') : null;
    }

    // Download methods
    public function canDownload(): bool
    {
        return $this->is_downloadable && ($this->file_path || $this->resource_url);
    }

    public function getDownloadUrl(): ?string
    {
        if (!$this->canDownload()) return null;

        return $this->file_path
            ? route('lesson-resources.download', $this->id)
            : $this->resource_url;
    }

    // Additional helper methods for the dashboard

    /**
     * Check if resource can be streamed (for video/audio files)
     */
    public function canStream(): bool
    {
        return $this->file_path &&
            $this->mime_type &&
            (str_starts_with($this->mime_type, 'video/') ||
                str_starts_with($this->mime_type, 'audio/'));
    }

    /**
     * Get stream URL for media files
     */
    public function getStreamUrl(): ?string
    {
        return $this->canStream() ? route('lesson-resources.stream', $this->id) : null;
    }

    /**
     * Check if file exists in storage
     */
    public function fileExists(): bool
    {
        return $this->file_path && Storage::exists($this->file_path);
    }

    /**
     * Get the full URL for external resources or file access
     */
    public function getFullUrlAttribute(): ?string
    {
        if ($this->resource_url) {
            return $this->resource_url;
        }

        if ($this->file_path && $this->fileExists()) {
            return Storage::url($this->file_path);
        }

        return null;
    }

    /**
     * Get YouTube thumbnail URL
     */
    public function getYouTubeThumbnail(): ?string
    {
        $videoId = $this->getYouTubeVideoId();
        return $videoId ? "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg" : null;
    }

    /**
     * Check if this resource has been viewed by a specific user
     * (checks lesson progress session data)
     */
    public function hasBeenViewedBy(User $user): bool
    {
        $progress = $this->lesson->userProgress($user);

        if (!$progress || !isset($progress->session_data['viewed_resources'])) {
            return false;
        }

        return in_array($this->id, $progress->session_data['viewed_resources']);
    }

    /**
     * Get viewing statistics for this resource
     */
    public function getViewingStats(): array
    {
        $totalEnrolled = $this->lesson->program->enrollments()
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->count();

        $viewedCount = 0;

        // Count users who have viewed this resource
        $progresses = \App\Models\LessonProgress::where('lesson_id', $this->lesson_id)
            ->whereNotNull('session_data')
            ->get();

        foreach ($progresses as $progress) {
            if (
                isset($progress->session_data['viewed_resources']) &&
                in_array($this->id, $progress->session_data['viewed_resources'])
            ) {
                $viewedCount++;
            }
        }

        return [
            'total_enrolled' => $totalEnrolled,
            'viewed_count' => $viewedCount,
            'view_percentage' => $totalEnrolled > 0 ? round(($viewedCount / $totalEnrolled) * 100, 1) : 0,
        ];
    }
}
