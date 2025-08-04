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

            $this->programService->createProgram($validatedData);

            return redirect()
                ->route('admin.programs.index')
                ->with('success', 'New Program successfully created!');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Error occurred: ' . $e->getMessage())
                ->withInput();
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

            $this->programService->updateProgram($program, $validatedData);

            return redirect()
                ->route('admin.programs.index')
                ->with('success', 'Program successfully updated!');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Error occurred: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Program $program): RedirectResponse
    {
        try {
            $this->programService->deleteProgram($program);

            return redirect()
                ->route('admin.programs.index')
                ->with('success', 'Program successfully deleted!');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Error occurred: ' . $e->getMessage());
        }
    }
}
