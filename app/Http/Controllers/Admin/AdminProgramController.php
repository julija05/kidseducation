<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminProgramController extends Controller
{
    public function index()
    {
        $programs = Program::all();

        return $this->createView('Admin/Programs/AdminPrograms', [
            'programs' => $programs
        ]);
    }

    // Show create form
    public function create()
    {
        return $this->createView('Admin/Programs/Create');
    }

    // Store new program
    public function store(StoreProgramRequest $request)
    {
        $data = $request->all();

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('program_images', 'public');
            $data['image'] = "/storage/{$imagePath}";
        }
        Program::create($data);
        Cache::forget('controllerData.programs');

        return redirect()->route('admin.programs.index')->with('success', 'Program created successfully.');
    }


    // Show edit form
    public function edit(Program $program)
    {
        return $this->createView('Admin/Programs/Edit', [
            'program' => $program,
        ]);
    }

    // Update existing program
    public function update(UpdateProgramRequest $request, Program $program)
    {
        $data = $request->all();

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('program_images', 'public');
            $data['image'] = "/storage/{$imagePath}";
        }

        $program->update($data);

        Cache::forget('controllerData.programs');

        return redirect()->route('admin.programs.index')->with('success', 'Program updated successfully.');
    }

    // Delete program (already implemented)
    public function destroy(Program $program)
    {
        $program->delete();
        Cache::forget('controllerData.programs');
        return redirect()->route('admin.programs.index')->with('success', 'Program deleted successfully.');
    }
}
