<?php

namespace App\Http\Controllers;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MentorInviteController extends Controller
{
    /**
     * Display the mentor invitation landing page
     * Shows program details and allows enrollment
     *
     * @param string $code Mentor's referral code
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(string $code)
    {
        // Find the mentor by referral code
        $mentor = User::where('referral_code', $code)->first();

        Log::info('Mentor invite accessed', [
            'code' => $code,
            'mentor_found' => $mentor ? true : false,
            'mentor_id' => $mentor?->id,
            'has_mentor_role' => $mentor ? $mentor->hasRole('mentor') : false,
        ]);

        if (!$mentor || !$mentor->hasRole('mentor')) {
            Log::warning('Invalid mentor or missing role', ['code' => $code]);
            return redirect()->route('landing.index')->with('error', __('Invalid invitation link.'));
        }

        // Get the program the mentor is teaching
        $mentorEnrollment = $mentor->enrollments()
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->whereIn('status', EnrollmentStatus::activeStatuses())
            ->with('program')
            ->first();

        Log::info('Mentor enrollment check', [
            'mentor_id' => $mentor->id,
            'enrollment_found' => $mentorEnrollment ? true : false,
            'enrollment_id' => $mentorEnrollment?->id,
            'program_id' => $mentorEnrollment?->program_id,
        ]);

        if (!$mentorEnrollment || !$mentorEnrollment->program) {
            Log::warning('Mentor has no active program', ['mentor_id' => $mentor->id]);
            return redirect()->route('landing.index')->with('error', __('This mentor is not currently teaching any programs.'));
        }

        $program = $mentorEnrollment->program;

        // If user is authenticated, check if already enrolled
        $isEnrolled = false;
        $existingEnrollment = null;

        if (Auth::check()) {
            $existingEnrollment = Enrollment::where('user_id', Auth::id())
                ->where('program_id', $program->id)
                ->where('enrollment_type', EnrollmentType::STUDENT)
                ->first();

            $isEnrolled = $existingEnrollment !== null;
        }

        return Inertia::render('MentorInvite/Show', [
            'mentor' => [
                'id' => $mentor->id,
                'name' => $mentor->name,
                'first_name' => $mentor->first_name,
                'last_name' => $mentor->last_name,
            ],
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'translated_name' => $program->translated_name,
                'slug' => $program->slug,
                'description' => $program->description,
                'translated_description' => $program->translated_description,
                'image_path' => $program->image_path,
                'icon' => $program->icon,
                'color' => $program->color,
                'light_color' => $program->light_color,
                'border_color' => $program->border_color,
                'text_color' => $program->text_color,
                'total_lessons' => $program->getTotalLessonsCount(),
            ],
            'referralCode' => $code,
            'isAuthenticated' => Auth::check(),
            'isEnrolled' => $isEnrolled,
            'existingEnrollment' => $existingEnrollment ? [
                'status' => $existingEnrollment->status,
                'approval_status' => $existingEnrollment->approval_status,
                'progress' => $existingEnrollment->progress,
            ] : null,
        ]);
    }

    /**
     * Enroll the student through mentor's referral link
     *
     * @param Request $request
     * @param string $code Mentor's referral code
     * @return \Illuminate\Http\RedirectResponse
     */
    public function enroll(Request $request, string $code)
    {
        // Must be authenticated
        if (!Auth::check()) {
            // Store the referral code in session to use after registration/login
            session(['pending_mentor_referral' => $code]);
            return redirect()->route('register')->with('info', __('Please create an account to enroll in this program.'));
        }

        $user = Auth::user();

        // Find the mentor
        $mentor = User::where('referral_code', $code)->first();

        if (!$mentor || !$mentor->hasRole('mentor')) {
            return back()->with('error', __('Invalid invitation link.'));
        }

        // Get mentor's program
        $mentorEnrollment = $mentor->enrollments()
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->whereIn('status', EnrollmentStatus::activeStatuses())
            ->first();

        if (!$mentorEnrollment) {
            return back()->with('error', __('This mentor is not currently teaching any programs.'));
        }

        $program = $mentorEnrollment->program;

        // Check if user is already enrolled
        $existingEnrollment = Enrollment::where('user_id', $user->id)
            ->where('program_id', $program->id)
            ->where('enrollment_type', EnrollmentType::STUDENT)
            ->first();

        if ($existingEnrollment) {
            return redirect()->route('dashboard')
                ->with('info', __('You are already enrolled in this program.'));
        }

        // Create the enrollment with mentor referral
        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'enrolled_at' => now(),
            'status' => EnrollmentStatus::ACTIVE,
            'approval_status' => ApprovalStatus::PENDING,
            'referred_by_mentor_id' => $mentor->id,
            'progress' => 0,
            'highest_unlocked_level' => 1,
        ]);

        Log::info('Student enrolled via mentor referral', [
            'student_id' => $user->id,
            'mentor_id' => $mentor->id,
            'program_id' => $program->id,
            'enrollment_id' => $enrollment->id,
        ]);

        return redirect()->route('dashboard')->with('success', __(
            'Your enrollment request has been submitted. You will be notified once it is approved by the mentor.'
        ));
    }

    /**
     * Handle post-registration enrollment
     * Called after a new user registers with a pending referral
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse|null
     */
    public static function handlePendingReferral(Request $request)
    {
        if (!$request->session()->has('pending_mentor_referral')) {
            return null;
        }

        $code = $request->session()->pull('pending_mentor_referral');
        $user = Auth::user();

        // Find the mentor
        $mentor = User::where('referral_code', $code)->first();

        if (!$mentor || !$mentor->hasRole('mentor')) {
            return null;
        }

        // Get mentor's program
        $mentorEnrollment = $mentor->enrollments()
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->whereIn('status', EnrollmentStatus::activeStatuses())
            ->first();

        if (!$mentorEnrollment) {
            return null;
        }

        // Create enrollment
        Enrollment::create([
            'user_id' => $user->id,
            'program_id' => $mentorEnrollment->program_id,
            'enrollment_type' => EnrollmentType::STUDENT,
            'enrolled_at' => now(),
            'status' => EnrollmentStatus::ACTIVE,
            'approval_status' => ApprovalStatus::PENDING,
            'referred_by_mentor_id' => $mentor->id,
            'progress' => 0,
            'highest_unlocked_level' => 1,
        ]);

        return redirect()->route('dashboard')->with('success', __(
            'Welcome! Your enrollment request has been submitted and is pending approval.'
        ));
    }
}
