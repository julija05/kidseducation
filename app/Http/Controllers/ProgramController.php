<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;
use App\Models\Program;
use App\Services\EnrollmentService;
use App\Services\ProgramService;
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
        $programs = Program::active()->withCount('approvedReviews')->get()->map(function ($program) {
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
                'requires_monthly_payment' => $program->requires_monthly_payment,
                'average_rating' => round($program->average_rating, 1),
                'total_reviews_count' => $program->approved_reviews_count,
            ];
        });

        // Get user demo access and enrollment info if logged in
        $userDemoAccess = null;
        $userEnrollments = [];

        if (Auth::check()) {
            $user = Auth::user();

            // Get demo access info - check regular demo access first
            if ($user->hasDemoAccess()) {
                $userDemoAccess = [
                    'program_slug' => $user->demo_program_slug,
                    'expires_at' => $user->demo_expires_at,
                    'days_remaining' => $user->getDemoRemainingDays(),
                ];
            } elseif ($user->enrollments()->where('approval_status', 'pending')->exists() && $user->demo_program_slug) {
                // Allow demo access for users with pending enrollments
                $userDemoAccess = [
                    'program_slug' => $user->demo_program_slug,
                    'expires_at' => null, // No expiration while enrollment is pending
                    'days_remaining' => 999, // Indicate unlimited access while pending
                ];
            }

            // Get enrollment info
            $userEnrollments = $user->enrollments()->with('program')->get()->map(function ($enrollment) {
                return [
                    'program_id' => $enrollment->program_id,
                    'approval_status' => $enrollment->approval_status,
                    'status' => $enrollment->status,
                ];
            });

            // Debug: Log enrollment data for troubleshooting
            Log::info('User enrollments for programs index:', [
                'user_id' => $user->id,
                'enrollments' => $userEnrollments->toArray(),
            ]);
        }

        return $this->createView('Front/Programs/Index', [
            'programs' => $programs,
            'userDemoAccess' => $userDemoAccess,
            'userEnrollments' => $userEnrollments,
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
                return redirect()->route('dashboard');
            }
        }

        $userEnrollment = null;
        $canReview = false;
        $userReview = null;
        $hasAnyEnrollment = false;
        $hasAnyActiveEnrollment = false;
        $currentEnrollment = null;

        if (Auth::user() && Auth::user()->hasRole('student')) {
            $user = Auth::user();
            $userEnrollment = $user->enrollments()
                ->where('program_id', $program->id)
                ->first();

            // Check if user has any enrollments at all
            $hasAnyEnrollment = $user->enrollments()->exists();

            // Check if user has any active enrollments (pending or approved non-completed)
            $hasAnyActiveEnrollment = $user->enrollments()
                ->whereIn('approval_status', ['pending', 'approved'])
                ->where('status', '!=', 'completed')
                ->exists();

            // Get the current active enrollment for warning modal
            if ($hasAnyActiveEnrollment) {
                $currentEnrollment = $user->enrollments()
                    ->with('program')
                    ->whereIn('approval_status', ['pending', 'approved'])
                    ->where('status', '!=', 'completed')
                    ->first();
            }

            // Debug: Log enrollment data for individual program show
            Log::info('User enrollment for program show:', [
                'user_id' => $user->id,
                'program_id' => $program->id,
                'userEnrollment' => $userEnrollment ? [
                    'id' => $userEnrollment->id,
                    'approval_status' => $userEnrollment->approval_status,
                    'status' => $userEnrollment->status,
                ] : null,
                'hasAnyEnrollment' => $hasAnyEnrollment,
                'hasAnyActiveEnrollment' => $hasAnyActiveEnrollment,
            ]);

            // Check if user can review (enrolled and approved, no existing review)
            if ($userEnrollment && $userEnrollment->approval_status === 'approved') {
                $userReview = $user->reviews()
                    ->where('reviewable_type', Program::class)
                    ->where('reviewable_id', $program->id)
                    ->first();

                $canReview = ! $userReview;
            }
        }

        // Get top 3 reviews for this program
        $topReviews = $program->approvedReviews()
            ->with('user')
            ->orderBy('rating', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at,
                    'user_name' => $review->user->name,
                ];
            });

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
                'requires_monthly_payment' => $program->requires_monthly_payment,
                'average_rating' => round($program->average_rating, 1),
                'total_reviews_count' => $program->total_reviews_count,
            ],
            'pageTitle' => $program->translated_name,
            'userEnrollment' => $userEnrollment ? [
                'id' => $userEnrollment->id,
                'approval_status' => $userEnrollment->approval_status,
                'status' => $userEnrollment->status,
                'created_at' => $userEnrollment->created_at,
                'program_id' => $userEnrollment->program_id,
            ] : null,
            'hasAnyEnrollment' => $hasAnyEnrollment,
            'hasAnyActiveEnrollment' => $hasAnyActiveEnrollment,
            'currentEnrollment' => $currentEnrollment ? [
                'id' => $currentEnrollment->id,
                'approval_status' => $currentEnrollment->approval_status,
                'status' => $currentEnrollment->status,
                'program' => [
                    'id' => $currentEnrollment->program->id,
                    'name' => $currentEnrollment->program->name,
                    'translated_name' => $currentEnrollment->program->translated_name,
                    'slug' => $currentEnrollment->program->slug,
                ],
            ] : null,
            'canReview' => $canReview,
            'userReview' => $userReview ? [
                'id' => $userReview->id,
                'rating' => $userReview->rating,
                'comment' => $userReview->comment,
                'created_at' => $userReview->created_at,
            ] : null,
            'topReviews' => $topReviews,
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
                'status' => $userEnrollment->status,
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
                    'status' => $userEnrollment->status,
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
