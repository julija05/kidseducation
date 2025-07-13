<?php

namespace App\Services;

use App\Models\LessonResource;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResourceAccessService
{
    public function __construct(
        private ResourceService $resourceService
    ) {}

    public function validateAccess(LessonResource $resource, User $user): void
    {
        if (!$this->resourceService->canUserAccessResource($resource, $user)) {
            abort(403, 'You do not have access to this resource.');
        }
    }

    public function serveFile(LessonResource $resource, string $disposition = 'inline'): Response
    {
        if (!$resource->file_path || !Storage::exists($resource->file_path)) {
            abort(404, 'File not found.');
        }

        $filePath = $resource->file_path;
        $fileName = $resource->file_name ?: basename($filePath);
        $mimeType = $resource->mime_type ?: Storage::mimeType($filePath);
        $fileContent = Storage::get($filePath);

        $headers = $this->buildHeaders($fileName, $mimeType, strlen($fileContent), $disposition);

        return response($fileContent, 200, $headers);
    }

    public function streamFile(LessonResource $resource): StreamedResponse
    {
        if (!$this->isStreamable($resource)) {
            abort(400, 'Resource is not streamable.');
        }

        if (!$resource->file_path || !Storage::exists($resource->file_path)) {
            abort(404, 'File not found.');
        }

        $path = Storage::path($resource->file_path);
        $size = filesize($path);
        $mime = $resource->mime_type;

        return new StreamedResponse(function () use ($path) {
            $stream = fopen($path, 'rb');
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => $mime,
            'Content-Length' => $size,
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'X-Frame-Options' => 'SAMEORIGIN',
        ]);
    }

    private function buildHeaders(string $fileName, string $mimeType, int $contentLength, string $disposition): array
    {
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => $contentLength,
            'Content-Disposition' => $disposition . '; filename="' . $fileName . '"',
            'Cache-Control' => 'private, max-age=3600',
        ];

        if ($disposition === 'inline') {
            $headers['X-Frame-Options'] = 'SAMEORIGIN';
        }

        return $headers;
    }

    private function isStreamable(LessonResource $resource): bool
    {
        return str_starts_with($resource->mime_type, 'video/') ||
            str_starts_with($resource->mime_type, 'audio/');
    }
}
