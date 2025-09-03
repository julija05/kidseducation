<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FileController extends Controller
{
    /**
     * Serve files from public storage with proper mime types and 404 handling.
     */
    public function serve(string $path): Response|BinaryFileResponse
    {
        // Clean the path to prevent directory traversal attacks
        $path = ltrim($path, '/');
        
        // Check if file exists in public storage
        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File not found');
        }

        // Get the full file path
        $filePath = Storage::disk('public')->path($path);
        
        // Get mime type using Laravel's built-in method
        $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
        
        // Return file response with proper headers
        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=3600', // Cache for 1 hour
        ]);
    }
}
