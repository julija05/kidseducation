<?php

namespace App\Services;

use App\Models\News;
use App\Repositories\Interfaces\NewsRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class NewsService
{
    public function __construct(
        protected NewsRepositoryInterface $newsRepository
    ) {}

    /**
     * Get paginated news for admin
     */
    public function getPaginatedNews(int $perPage = 5): LengthAwarePaginator
    {
        return $this->newsRepository->getPaginated($perPage);
    }

    /**
     * Create a new news post
     */
    public function createNews(Request $request): News
    {
        $data = $request->validated();

        // Handle image upload
        if ($imagePath = $this->newsRepository->handleImageUpload($request)) {
            $data['image'] = $imagePath;
        }

        return $this->newsRepository->create($data);
    }

    /**
     * Update a news post
     */
    public function updateNews(Request $request, News $news): bool
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($news->image) {
                $this->newsRepository->deleteImage($news->image);
            }

            // Upload new image
            $data['image'] = $this->newsRepository->handleImageUpload($request);
        } else {
            // Remove image from update data to keep existing image
            unset($data['image']);
        }

        return $this->newsRepository->update($news, $data);
    }

    /**
     * Delete a news post
     */
    public function deleteNews(News $news): bool
    {
        // Delete associated image
        if ($news->image) {
            $this->newsRepository->deleteImage($news->image);
        }

        return $this->newsRepository->delete($news);
    }

    /**
     * Find news by ID
     */
    public function findNewsById(int $id): ?News
    {
        return $this->newsRepository->findById($id);
    }

    /**
     * Search news
     */
    public function searchNews(string $query, int $perPage = 5): LengthAwarePaginator
    {
        return $this->newsRepository->search($query, $perPage);
    }
}
