<?php

namespace App\Repositories;

use App\Models\Program;
use App\Repositories\Interfaces\ProgramRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class ProgramRepository implements ProgramRepositoryInterface
{
    private const CACHE_KEY = 'controllerData.programs';

    /**
     * Get all programs (admin-created only, excludes mentor proposals)
     * Mentor-proposed programs should be managed in the Proposals section
     */
    public function getAll(): Collection
    {
        return Program::whereNull('proposed_by')->get();
    }

    /**
     * Get all programs including mentor-proposed ones
     */
    public function getAllIncludingProposed(): Collection
    {
        return Program::all();
    }

    public function findById(int $id): ?Program
    {
        return Program::findOrFail($id);
    }

    public function create(array $data): Program
    {
        $program = Program::create($data);
        $this->clearCache();

        return $program;
    }

    public function update(Program $program, array $data): bool
    {
        $updated = $program->update($data);
        if ($updated) {
            $this->clearCache();
        }

        return $updated;
    }

    public function delete(Program $program): bool
    {
        $deleted = $program->delete();
        if ($deleted) {
            $this->clearCache();
        }

        return $deleted;
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
