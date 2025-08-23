<?php

namespace App\Http\Controllers;

use App\Models\LessonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class StorageFileController extends Controller
{
    /**
     * Serve lesson resource files securely
     */
    public function serveFile(LessonResource $resource)
    {
        $user = Auth::user();

        // Check if user can access this resource
        // Allow access for both active and completed enrollments
        $enrollment = $user->enrollments()
            ->where('program_id', $resource->lesson->program_id)
            ->whereIn('status', ['active', 'completed'])
            ->where('approval_status', 'approved')
            ->first();

        if (! $enrollment) {
            abort(403, 'Access denied');
        }

        // Check if file exists
        if (! $resource->file_path || ! Storage::exists($resource->file_path)) {
            abort(404, 'File not found');
        }

        // Get file content
        $fileContent = Storage::get($resource->file_path);
        $mimeType = $resource->mime_type ?: Storage::mimeType($resource->file_path);
        $fileName = $resource->file_name ?: basename($resource->file_path);

        // Set appropriate headers for different file types
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => strlen($fileContent),
        ];

        // For PDFs and images, display inline. For others, force download
        if (in_array($mimeType, ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'])) {
            $headers['Content-Disposition'] = 'inline; filename="'.$fileName.'"';
        } else {
            $headers['Content-Disposition'] = 'attachment; filename="'.$fileName.'"';
        }

        // Add cache headers for better performance
        $headers['Cache-Control'] = 'private, max-age=3600';
        $headers['Expires'] = gmdate('D, d M Y H:i:s', time() + 3600).' GMT';

        return response($fileContent, 200, $headers);
    }

    /**
     * Serve file for preview (always inline)
     */
    public function previewFile(LessonResource $resource)
    {
        $user = Auth::user();

        // Check if user can access this resource
        // Allow access for both active and completed enrollments
        $enrollment = $user->enrollments()
            ->where('program_id', $resource->lesson->program_id)
            ->whereIn('status', ['active', 'completed'])
            ->where('approval_status', 'approved')
            ->first();

        if (! $enrollment) {
            abort(403, 'Access denied');
        }

        // Check if file exists
        if (! $resource->file_path || ! Storage::exists($resource->file_path)) {
            abort(404, 'File not found');
        }

        // Get file content
        $fileContent = Storage::get($resource->file_path);
        $mimeType = $resource->mime_type ?: Storage::mimeType($resource->file_path);
        $fileName = $resource->file_name ?: basename($resource->file_path);

        // Always serve inline for preview
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => strlen($fileContent),
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
            'Cache-Control' => 'private, max-age=3600',
            'X-Frame-Options' => 'SAMEORIGIN', // Allow embedding in iframes from same origin
        ];

        return response($fileContent, 200, $headers);
    }
}
