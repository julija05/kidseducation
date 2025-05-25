<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;
use App\Models\Program;
use App\Services\ProgramService;
use Illuminate\Http\RedirectResponse;

class AdminProgramController extends BaseAdminController
{
    public function __construct(
        private ProgramService $programService
    ) {}

    protected function getResourceName(): string
    {
        return 'program';
    }

    protected function getIndexRouteName(): string
    {
        return 'admin.programs.index';
    }

    public function index()
    {
        $programs = $this->programService->getAllPrograms();

        return $this->createView('Admin/Programs/AdminPrograms', [
            'programs' => $programs
        ]);
    }

    public function create()
    {
        return $this->createView('Admin/Programs/Create');
    }

    public function store(StoreProgramRequest $request): RedirectResponse
    {
        try {
            $validatedData = $request->validated();
            $image = $request->file('image');

            $this->programService->createProgram($validatedData, $image);

            return $this->successRedirect('created');
        } catch (\Exception $e) {
            return $this->errorRedirect('create', $e->getMessage());
        }
    }

    public function edit(Program $program)
    {
        return $this->createView('Admin/Programs/Edit', [
            'program' => $program,
        ]);
    }

    public function update(UpdateProgramRequest $request, Program $program): RedirectResponse
    {
        try {
            $validatedData = $request->validated();
            $image = $request->file('image');

            $this->programService->updateProgram($program, $validatedData, $image);

            return $this->successRedirect('updated');
        } catch (\Exception $e) {
            return $this->errorRedirect('update', $e->getMessage());
        }
    }

    public function destroy(Program $program): RedirectResponse
    {
        try {
            $this->programService->deleteProgram($program);

            return $this->successRedirect('deleted');
        } catch (\Exception $e) {
            return $this->errorRedirect('delete', $e->getMessage());
        }
    }
}
