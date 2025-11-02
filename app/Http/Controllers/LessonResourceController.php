<?php

namespace App\Http\Controllers;

use App\Models\LessonResource;
use App\Services\ResourceAccessService;
use App\Services\ResourceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class LessonResourceController extends Controller
{
    public function __construct(
        private ResourceService $resourceService,
        private ResourceAccessService $fileService
    ) {}

    public function download(LessonResource $lessonResource)
    {
        $user = Auth::user();

        // Validate access
        $this->fileService->validateAccess($lessonResource, $user);

        if (! $lessonResource->canDownload()) {
            abort(404, 'Resource is not available for download.');
        }

        // Handle file storage
        if ($lessonResource->file_path) {
            if (! Storage::exists($lessonResource->file_path)) {
                abort(404, 'File not found.');
            }

            return Storage::download(
                $lessonResource->file_path,
                $lessonResource->file_name ?: basename($lessonResource->file_path)
            );
        }

        // Handle external URL
        if ($lessonResource->resource_url) {
            return redirect($lessonResource->resource_url);
        }

        abort(404, 'Resource not found.');
    }

    public function preview(LessonResource $lessonResource)
    {
        $user = Auth::user();

        // Validate access
        $this->fileService->validateAccess($lessonResource, $user);

        return $this->fileService->serveFile($lessonResource, 'inline');
    }

    public function serve(LessonResource $lessonResource, Request $request)
    {
        $user = Auth::user();

        // Validate access
        $this->fileService->validateAccess($lessonResource, $user);

        $disposition = $this->determineDisposition($lessonResource, $request);

        return $this->fileService->serveFile($lessonResource, $disposition);
    }

    public function stream(LessonResource $lessonResource)
    {
        $user = Auth::user();

        // Validate access
        $this->fileService->validateAccess($lessonResource, $user);

        return $this->fileService->streamFile($lessonResource);
    }

    public function markAsViewed(Request $request, LessonResource $lessonResource)
    {
        $user = Auth::user();

        $result = $this->resourceService->markResourceAsViewed($lessonResource, $user);

        if (! $result['success']) {
            if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json(['error' => $result['message']], 403);
            }

            return back()->with('error', $result['message']);
        }

        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json($result);
        }

        return back()->with('success', 'Resource marked as viewed');
    }

    private function determineDisposition(LessonResource $resource, Request $request): string
    {
        $requestedDisposition = $request->get('disposition', 'inline');

        $inlineTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'text/plain',
            'text/html',
        ];

        if (in_array($resource->mime_type, $inlineTypes)) {
            return $requestedDisposition;
        }

        return 'attachment';
    }
}
