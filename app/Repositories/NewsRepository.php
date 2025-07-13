<?php

namespace App\Repositories;

use App\Models\News;
use App\Repositories\Interfaces\NewsRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class NewsRepository implements NewsRepositoryInterface
{
    public function __construct(
        protected News $model
    ) {}

    /**
     * Get paginated news
     */
    public function getPaginated(int $perPage = 5): LengthAwarePaginator
    {
        return $this->model->latest()->paginate($perPage);
    }

    /**
     * Find news by ID
     */
    public function findById(int $id): ?News
    {
        return $this->model->findOrFail($id);
    }

    /**
     * Create a new news post
     */
    public function create(array $data): News
    {
        return $this->model->create($data);
    }

    /**
     * Update a news post
     */
    public function update(News $news, array $data): bool
    {
        return $news->update($data);
    }

    /**
     * Delete a news post
     */
    public function delete(News $news): bool
    {
        return $news->delete();
    }

    /**
     * Handle image upload
     */
    public function handleImageUpload(Request $request, string $field = 'image'): ?string
    {
        if (!$request->hasFile($field)) {
            return null;
        }

        $imagePath = $request->file($field)->store('news', 'public');
        return "/storage/{$imagePath}";
    }

    /**
     * Delete image from storage
     */
    public function deleteImage(string $imagePath): bool
    {
        if (!$imagePath) {
            return false;
        }

        // Extract the path from the full URL (/storage/news/abc.jpg -> news/abc.jpg)
        $relativePath = str_replace('/storage/', '', $imagePath);

        return Storage::disk('public')->delete($relativePath);
    }

    /**
     * Get all news (for public-facing pages)
     */
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->model->latest()->get();
    }

    /**
     * Get published news with pagination
     */
    public function getPublished(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->where('is_published', true)
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Search news by title or content
     */
    public function search(string $query, int $perPage = 5): LengthAwarePaginator
    {
        return $this->model->where('title', 'like', "%{$query}%")
            ->orWhere('content', 'like', "%{$query}%")
            ->latest()
            ->paginate($perPage);
    }
}
