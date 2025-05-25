<?php

namespace App\Services;

use App\Models\Program;

use App\Repositories\Contracts\ProgramRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class ProgramService
{
    public function __construct(
        private ProgramRepositoryInterface $programRepository,
        private ImageService $imageService
    ) {}

    /**
     * Get all programs
     */
    public function getAllPrograms(): Collection
    {
        return $this->programRepository->getAll();
    }

    /**
     * Find a program by ID
     */
    public function findProgram(int $id): ?Program
    {
        return $this->programRepository->findById($id);
    }

    /**
     * Create a new program
     */
    public function createProgram(array $data, ?UploadedFile $image = null): Program
    {
        if ($image) {
            $data['image'] = $this->imageService->store($image);
        }

        return $this->programRepository->create($data);
    }

    /**
     * Update an existing program
     */
    public function updateProgram(Program $program, array $data, ?UploadedFile $image = null): bool
    {
        if ($image) {
            $data['image'] = $this->imageService->replace($program->image, $image);
        }

        return $this->programRepository->update($program, $data);
    }

    /**
     * Delete a program
     */
    public function deleteProgram(Program $program): bool
    {
        // Delete associated image first
        if ($program->image) {
            $this->imageService->delete($program->image);
        }

        return $this->programRepository->delete($program);
    }

    /**
     * Get program with image URL
     */
    public function getProgramWithImageUrl(Program $program): array
    {
        $programArray = $program->toArray();

        if ($program->image) {
            $programArray['image_url'] = $this->imageService->getUrl($program->image);
        }

        return $programArray;
    }
}
