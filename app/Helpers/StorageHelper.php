<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class StorageHelper
{
    /**
     * Generate a URL for a file in public storage with the /files prefix.
     *
     * @param string $path The file path relative to the public storage disk
     * @return string The full URL with /files prefix
     */
    public static function url(string $path): string
    {
        // Remove leading slash if present to normalize the path
        $path = ltrim($path, '/');
        
        // Generate the URL using the public disk configuration
        return Storage::disk('public')->url($path);
    }

    /**
     * Check if a file exists in public storage.
     *
     * @param string $path The file path to check
     * @return bool True if file exists, false otherwise
     */
    public static function exists(string $path): bool
    {
        $path = ltrim($path, '/');
        return Storage::disk('public')->exists($path);
    }

    /**
     * Generate a file path for storing in the database.
     * This returns a path without the /files prefix for database storage.
     *
     * @param string $path The file path relative to public storage
     * @return string The normalized path for database storage
     */
    public static function path(string $path): string
    {
        return ltrim($path, '/');
    }
}