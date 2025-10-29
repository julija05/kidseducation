<?php

namespace App\Services;

use App\Contracts\ResourceFormatterInterface;
use App\Models\LessonResource;

class ResourceFormatter implements ResourceFormatterInterface
{
    public function format(LessonResource $resource): array
    {
        return [
            'id' => $resource->id,
            'title' => $resource->title,
            'description' => $resource->description,
            'type' => $resource->type,
            'type_display' => $resource->type_display,
            'icon' => $resource->icon,
            'resource_url' => $resource->resource_url,
            'is_downloadable' => $resource->is_downloadable,
            'is_required' => $resource->is_required,
            'file_name' => $resource->file_name,
            'file_size' => $resource->formatted_file_size,
            'download_url' => $resource->getDownloadUrl(),
            'youtube_embed_url' => $resource->getYouTubeEmbedUrl(),
            'is_youtube_video' => $resource->isYouTubeVideo(),
            'order' => $resource->order,
        ];
    }

    public function formatMany(iterable $resources): array
    {
        $formatted = [];
        foreach ($resources as $resource) {
            $formatted[] = $this->format($resource);
        }
        return $formatted;
    }
}
