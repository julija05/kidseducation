<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;
use App\Models\Program;
use Illuminate\Support\Facades\Auth;

class ProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $programs = Program::all();
        return $this->createView('Front/Programs/Index', [
            'programs' => $programs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProgramRequest $request)
    {
        // $program = Program::create($request->validated());

        // return $program;
    }

    /**
     * Display the specified resource.
     */
    public function show(Program $program)
    {
        $userEnrollment = null;

        if (Auth::user() && Auth::user()->hasRole('student')) {
            $userEnrollment = Auth::user()->enrollments()
                ->where('program_id', $program->id)
                ->first();
        }

        return $this->createView('Front/Programs/Show', [
            'program' => $program,
            'pageTitle' => $program->name,
            'userEnrollment' => $userEnrollment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Program $program)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProgramRequest $request, Program $program)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Program $program)
    {
        //
    }

    public function showDashboard(Program $program)
    {
        // Check if user is enrolled
        $userEnrollment = Auth::user()->enrollments()
            ->where('program_id', $program->id)
            ->first();

        return $this->createView('Dashboard/Programs/Show', [
            'program' => $program,
            'userEnrollment' => $userEnrollment,
        ]);
    }
}
