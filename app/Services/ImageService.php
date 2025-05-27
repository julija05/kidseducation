<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ImageService
{
    private string $disk;
    private string $directory;
    private array $config;

    public function __construct(string $type = 'programs')
    {
        $this->config = config('image');
        $this->disk = $this->config['disk'];
        $this->directory = $this->config['directories'][$type] ?? $this->config['directories']['programs'];
    }

    /**
     * Store an uploaded image
     */
    public function store(UploadedFile $file): string
    {
        $this->validateFile($file);
        return $file->store($this->directory, $this->disk);
    }

    /**
     * Delete an image by path
     */
    public function delete(?string $imagePath): bool
    {
        if (!$imagePath || !Storage::disk($this->disk)->exists($imagePath)) {
            return false;
        }

        return Storage::disk($this->disk)->delete($imagePath);
    }

    /**
     * Replace an existing image with a new one
     */
    public function replace(?string $oldImagePath, UploadedFile $newFile): string
    {
        if ($oldImagePath) {
            $this->delete($oldImagePath);
        }

        return $this->store($newFile);
    }

    /**
     * Get the full URL for an image
     */
    public function getUrl(?string $imagePath): ?string
    {
        if (!$imagePath) {
            return null;
        }

        try {
            // Check if file exists
            if (!Storage::disk($this->disk)->exists($imagePath)) {
                return $this->getDefaultImageUrl();
            }

            // Generate URL based on disk type
            return $this->buildImageUrl($imagePath);
        } catch (\Exception $e) {
            Log::warning("Failed to generate URL for image: {$imagePath}", [
                'disk' => $this->disk,
                'error' => $e->getMessage()
            ]);
            return $this->getDefaultImageUrl();
        }
    }

    /**
     * Build image URL based on storage configuration
     */
    private function buildImageUrl(string $imagePath): string
    {
        // Use Laravel's Storage facade which handles all the complexity internally
        // This avoids IntelliSense issues while maintaining full functionality

        try {
            // For public disk, use the standard Storage::url()
            if ($this->disk === 'public') {
                return Storage::url($imagePath);
            }

            // For all other disks, use this approach which works with Laravel 11
            $fullUrl = config("filesystems.disks.{$this->disk}.url");

            if ($fullUrl) {
                // If disk has a configured URL, build it manually
                return rtrim($fullUrl, '/') . '/' . ltrim($imagePath, '/');
            }

            // Fallback: try the direct approach with error suppression
            return Storage::disk($this->disk)->url($imagePath)
                ?: $this->getFallbackUrl($imagePath);
        } catch (\Exception) {
            return $this->getFallbackUrl($imagePath);
        }
    }

    /**
     * Get fallback URL when standard URL generation is not supported
     */
    private function getFallbackUrl(string $imagePath): string
    {
        return match ($this->disk) {
            'public' => asset('storage/' . $imagePath),
            'local' => asset($imagePath),
            default => asset('storage/' . $imagePath),
        };
    }

    /**
     * Get fallback URL for cloud storage - simplified version
     */
    private function getCloudFallbackUrl(string $imagePath): string
    {
        // For cloud storage, if we can't generate a URL, fall back to a placeholder
        // or try to construct the URL from configuration

        $cloudUrl = config("filesystems.disks.{$this->disk}.url");

        if ($cloudUrl) {
            return rtrim($cloudUrl, '/') . '/' . ltrim($imagePath, '/');
        }

        // Final fallback
        return asset('storage/' . $imagePath);
    }

    /**
     * Get default image URL when original is not available
     */
    private function getDefaultImageUrl(): ?string
    {
        $defaultImagePath = $this->getDefaultImagePath();

        if (!$defaultImagePath) {
            return null;
        }

        try {
            if (Storage::disk('public')->exists($defaultImagePath)) {
                return Storage::url($defaultImagePath);
            }
        } catch (\Exception $e) {
            Log::warning("Failed to generate default image URL", ['error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Validate uploaded file
     */
    private function validateFile(UploadedFile $file): void
    {
        $maxSize = $this->config['validation']['max_size'] * 1024; // Convert to bytes
        $allowedTypes = $this->config['validation']['allowed_types'];

        if ($file->getSize() > $maxSize) {
            throw new \InvalidArgumentException("File size exceeds maximum allowed size.");
        }

        if (!in_array($file->getClientOriginalExtension(), $allowedTypes)) {
            throw new \InvalidArgumentException("File type not allowed.");
        }
    }

    /**
     * Get default image path for the service type
     */
    public function getDefaultImagePath(): ?string
    {
        $type = array_search($this->directory, $this->config['directories']);
        return $this->config['defaults'][$type] ?? null;
    }
}
