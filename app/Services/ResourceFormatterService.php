<?php

namespace App\Services;

use App\Models\LessonResource;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class ResourceFormatterService
{
    public function formatResource(LessonResource $resource): array
    {
        $resourceData = [
            'id' => $resource->id,
            'title' => $resource->title,
            'description' => $resource->description,
            'type' => $resource->type,
            'file_name' => $resource->file_name,
            'mime_type' => $resource->mime_type,
            'is_downloadable' => $resource->is_downloadable,
            'is_required' => $resource->is_required,
            'metadata' => $resource->metadata,
        ];

        // Handle resource URL
        $resourceData['resource_url'] = $this->getResourceUrl($resource);

        // Handle download URL
        $resourceData['download_url'] = $resource->canDownload()
            ? route('lesson-resources.download', $resource->id)
            : null;

        // Handle stream URL
        $resourceData['stream_url'] = $resource->canStream()
            ? route('lesson-resources.stream', $resource->id)
            : null;

        // Add debug information (remove in production)
        $resourceData['debug_info'] = [
            'has_resource_url' => !empty($resource->resource_url),
            'has_file_path' => !empty($resource->file_path),
            'file_exists' => $resource->file_path ? Storage::exists($resource->file_path) : false,
            'can_download' => $resource->canDownload(),
            'can_stream' => $resource->canStream(),
        ];

        return $resourceData;
    }

    public function formatResources(Collection $resources): array
    {
        return $resources->map(fn($resource) => $this->formatResource($resource))->toArray();
    }

    private function getResourceUrl(LessonResource $resource): ?string
    {
        if ($resource->resource_url) {
            return $resource->resource_url;
        }

        if ($resource->file_path && Storage::exists($resource->file_path)) {
            return route('lesson-resources.preview', $resource->id);
        }

        return null;
    }
}
