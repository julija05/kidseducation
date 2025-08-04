<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;
use App\Models\Program;
use App\Services\ProgramService;
use App\Services\EnrollmentService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProgramController extends Controller
{
    public function __construct(
        private ProgramService $programService,
        private EnrollmentService $enrollmentService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $programs = Program::active()->get()->map(function ($program) {
            return [
                'id' => $program->id,
                'name' => $program->translated_name,
                'description' => $program->translated_description,
                'slug' => $program->slug,
                'icon' => $program->icon,
                'color' => $program->color,
                'light_color' => $program->light_color,
                'text_color' => $program->text_color,
                'duration' => $program->duration,
                'duration_weeks' => $program->duration_weeks,
                'price' => $program->price,
            ];
        });

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
        if (Auth::user() && Auth::user()->hasRole('student')) {
            $userEnrollment = Auth::user()->enrollments()
                ->where('program_id', $program->id)
                ->first();

            // If enrolled and approved, redirect to dashboard
            if ($userEnrollment && $this->enrollmentService->isEnrollmentActiveAndApproved($userEnrollment)) {
                return redirect()->route('dashboard.programs.show', $program->slug);
            }
        }


        $userEnrollment = null;

        if (Auth::user() && Auth::user()->hasRole('student')) {
            $userEnrollment = Auth::user()->enrollments()
                ->where('program_id', $program->id)
                ->first();
        }

        return $this->createView('Front/Programs/Show', [
            'program' => [
                'id' => $program->id,
                'name' => $program->translated_name,
                'description' => $program->translated_description,
                'slug' => $program->slug,
                'icon' => $program->icon,
                'color' => $program->color,
                'light_color' => $program->light_color,
                'text_color' => $program->text_color,
                'duration' => $program->duration,
                'duration_weeks' => $program->duration_weeks,
                'price' => $program->price,
            ],
            'pageTitle' => $program->translated_name,
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
        $user = Auth::user();

        // Check if user is enrolled
        $userEnrollment = $user->enrollments()
            ->where('program_id', $program->id)
            ->first();

        // Determine enrollment status
        $enrollmentStatus = 'not_enrolled';
        $enrolledProgramData = null;

        if ($userEnrollment) {
            // Log for debugging
            Log::info('User enrollment found', [
                'user_id' => $user->id,
                'program_id' => $program->id,
                'approval_status' => $userEnrollment->approval_status,
                'status' => $userEnrollment->status
            ]);

            if ($userEnrollment->approval_status === 'approved' && $userEnrollment->status === 'active') {
                $enrollmentStatus = 'approved';
                // Only format enrollment data if approved
                $enrolledProgramData = $this->enrollmentService->formatEnrollmentForDashboard($userEnrollment);
            } elseif ($userEnrollment->approval_status === 'pending') {
                $enrollmentStatus = 'pending';
            } elseif ($userEnrollment->approval_status === 'rejected') {
                $enrollmentStatus = 'rejected';
            } else {
                // Handle any unexpected status combinations
                Log::warning('Unexpected enrollment status combination', [
                    'user_id' => $user->id,
                    'program_id' => $program->id,
                    'approval_status' => $userEnrollment->approval_status,
                    'status' => $userEnrollment->status
                ]);
                // Default to pending if status is unclear
                $enrollmentStatus = 'pending';
            }
        }

        // Return view with appropriate data for all enrollment states
        return $this->createView('Dashboard/Programs/Show', [
            'program' => $program,
            'userEnrollment' => $userEnrollment,
            'enrolledProgram' => $enrolledProgramData,
            'enrollmentStatus' => $enrollmentStatus,
            'nextClass' => '02-10-2025 10:00 AM', // Placeholder for next class
        ]);
    }
}
