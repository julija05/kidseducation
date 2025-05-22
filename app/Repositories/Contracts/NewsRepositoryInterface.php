<?php

namespace App\Repositories\Contracts;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface NewsRepositoryInterface
{
    /**
     * Get paginated news
     */
    public function getPaginated(int $perPage = 5): LengthAwarePaginator;

    /**
     * Find news by ID
     */
    public function findById(int $id): ?News;

    /**
     * Create a new news post
     */
    public function create(array $data): News;

    /**
     * Update a news post
     */
    public function update(News $news, array $data): bool;

    /**
     * Delete a news post
     */
    public function delete(News $news): bool;

    /**
     * Handle image upload
     */
    public function handleImageUpload(Request $request, string $field = 'image'): ?string;

    /**
     * Delete image from storage
     */
    public function deleteImage(string $imagePath): bool;

    /**
     * Search news by title or content
     */
    public function search(string $query, int $perPage = 5): LengthAwarePaginator;
}
