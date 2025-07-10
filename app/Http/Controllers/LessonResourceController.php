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

    /**
     * Serve file for preview (inline display)
     */
    public function preview(LessonResource $lessonResource)
    {
        $user = Auth::user();

        // Check if user can access this resource
        if (!$this->resourceService->canUserAccessResource($lessonResource, $user)) {
            abort(403, 'You do not have access to this resource.');
        }

        // Check if file exists
        if (!$lessonResource->file_path || !Storage::exists($lessonResource->file_path)) {
            abort(404, 'File not found.');
        }

        // Get file info
        $filePath = $lessonResource->file_path;
        $fileName = $lessonResource->file_name ?: basename($filePath);
        $mimeType = $lessonResource->mime_type ?: Storage::mimeType($filePath);

        // Get file content
        $fileContent = Storage::get($filePath);

        // Set headers for inline display (preview)
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => strlen($fileContent),
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
            'Cache-Control' => 'private, max-age=3600',
            'X-Frame-Options' => 'SAMEORIGIN', // Allow embedding in iframes
        ];

        return response($fileContent, 200, $headers);
    }

    /**
     * Serve file directly (for both download and preview based on disposition)
     */
    public function serve(LessonResource $lessonResource, Request $request)
    {
        $user = Auth::user();

        // Check if user can access this resource
        if (!$this->resourceService->canUserAccessResource($lessonResource, $user)) {
            abort(403, 'You do not have access to this resource.');
        }

        // Check if file exists
        if (!$lessonResource->file_path || !Storage::exists($lessonResource->file_path)) {
            abort(404, 'File not found.');
        }

        // Get file info
        $filePath = $lessonResource->file_path;
        $fileName = $lessonResource->file_name ?: basename($filePath);
        $mimeType = $lessonResource->mime_type ?: Storage::mimeType($filePath);

        // Determine if this should be inline or attachment
        $disposition = $request->get('disposition', 'inline');

        // For certain file types, force inline for preview
        if (in_array($mimeType, [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'text/plain',
            'text/html'
        ])) {
            $disposition = $request->get('disposition', 'inline');
        }

        // Get file content
        $fileContent = Storage::get($filePath);

        // Set appropriate headers
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => strlen($fileContent),
            'Content-Disposition' => $disposition . '; filename="' . $fileName . '"',
            'Cache-Control' => 'private, max-age=3600',
        ];

        // Add frame options for preview
        if ($disposition === 'inline') {
            $headers['X-Frame-Options'] = 'SAMEORIGIN';
        }

        return response($fileContent, 200, $headers);
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
            'X-Frame-Options' => 'SAMEORIGIN', // Allow embedding for video
        ]);
    }

    public function markAsViewed(Request $request, LessonResource $lessonResource)
    {
        $user = Auth::user();

        // Check if user can access this resource
        if (!$this->resourceService->canUserAccessResource($lessonResource, $user)) {
            // For AJAX requests, return JSON error
            if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json(['error' => 'Not enrolled in this program'], 403);
            }

            // For Inertia requests, redirect back with error
            return back()->with('error', 'You do not have access to this resource.');
        }

        // Mark resource as viewed
        $result = $this->resourceService->markResourceAsViewed($lessonResource, $user);

        // For AJAX requests, return JSON
        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json($result);
        }

        // For Inertia requests, redirect back with success message
        return back()->with('success', 'Resource marked as viewed');
    }
}
