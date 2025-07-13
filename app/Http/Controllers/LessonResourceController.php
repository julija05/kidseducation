<?php

namespace App\Http\Controllers;

use App\Models\LessonResource;
use App\Services\ResourceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LessonResourceController extends Controller
{
    public function __construct(
        private ResourceService $resourceService
    ) {}

    public function download(LessonResource $lessonResource)
    {
        $user = Auth::user();

        // Check if user can access this resource
        if (!$this->resourceService->canUserAccessResource($lessonResource, $user)) {
            abort(403, 'You do not have access to this resource.');
        }

        // Check if resource is downloadable
        if (!$lessonResource->canDownload()) {
            abort(404, 'Resource is not available for download.');
        }

        // If it's a file path, serve from storage
        if ($lessonResource->file_path) {
            if (!Storage::exists($lessonResource->file_path)) {
                abort(404, 'File not found.');
            }

            return Storage::download(
                $lessonResource->file_path,
                $lessonResource->file_name ?: basename($lessonResource->file_path)
            );
        }

        // If it's an external URL, redirect
        if ($lessonResource->resource_url) {
            return redirect($lessonResource->resource_url);
        }

        abort(404, 'Resource not found.');
    }

    public function stream(LessonResource $lessonResource)
    {
        $user = Auth::user();

        // Check if user can access this resource
        if (!$this->resourceService->canUserAccessResource($lessonResource, $user)) {
            abort(403, 'You do not have access to this resource.');
        }

        // Only stream video/audio files
        if (
            !str_starts_with($lessonResource->mime_type, 'video/') &&
            !str_starts_with($lessonResource->mime_type, 'audio/')
        ) {
            abort(400, 'Resource is not streamable.');
        }

        if (!$lessonResource->file_path || !Storage::exists($lessonResource->file_path)) {
            abort(404, 'File not found.');
        }

        $path = Storage::path($lessonResource->file_path);
        $size = filesize($path);
        $mime = $lessonResource->mime_type;

        return new StreamedResponse(function () use ($path) {
            $stream = fopen($path, 'rb');
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => $mime,
            'Content-Length' => $size,
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }

    public function markAsViewed(Request $request, LessonResource $lessonResource)
    {
        $user = Auth::user();

        // Check if user can access this resource
        if (!$this->resourceService->canUserAccessResource($lessonResource, $user)) {
            return response()->json(['error' => 'Not enrolled in this program'], 403);
        }

        // Mark resource as viewed
        $result = $this->resourceService->markResourceAsViewed($lessonResource, $user);

        return response()->json($result);
    }
}
