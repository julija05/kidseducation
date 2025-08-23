<?php

namespace App\Repositories\Interfaces;

use App\Models\Program;
use Illuminate\Database\Eloquent\Collection;

interface ProgramRepositoryInterface
{
    /**
     * Get all programs
     */
    public function getAll(): Collection;

    /**
     * Find a program by ID
     */
    public function findById(int $id): ?Program;

    /**
     * Create a new program
     */
    public function create(array $data): Program;

    /**
     * Update an existing program
     */
    public function update(Program $program, array $data): bool;

    /**
     * Delete a program
     */
    public function delete(Program $program): bool;

    /**
     * Clear cache for programs
     */
    public function clearCache(): void;
}
