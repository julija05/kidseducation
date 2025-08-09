<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentRequest;
use App\Mail\AdminEnrollmentNotification;
use App\Mail\StudentEnrollmentConfirmation;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(StoreEnrollmentRequest $request, Program $program)
    {
        $user = $request->user();

        Log::info('Enrollment attempt started', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'program_id' => $program->id,
            'program_slug' => $program->slug,
            'user_verified' => $user->hasVerifiedEmail()
        ]);

        // Check if already enrolled
        $existingEnrollment = $user->enrollments()
            ->where('program_id', $program->id)
            ->first();

        if ($existingEnrollment) {
            Log::warning('User already has enrollment for this program', [
                'user_id' => $user->id,
                'program_id' => $program->id,
                'existing_enrollment_id' => $existingEnrollment->id,
                'existing_status' => $existingEnrollment->status,
                'existing_approval' => $existingEnrollment->approval_status
            ]);
            return back()->with('error', 'You already have an enrollment request for this program.');
        }

        // Check if user has any pending or active enrollment (only one enrollment at a time)
        $existingAnyEnrollment = $user->enrollments()
            ->whereIn('approval_status', ['pending', 'approved'])
            ->where('status', '!=', 'completed')
            ->first();

        if ($existingAnyEnrollment) {
            $message = $existingAnyEnrollment->approval_status === 'pending' 
                ? 'You already have a pending enrollment request. Please wait for approval or cancel your current request before enrolling in another program.'
                : 'You can only be enrolled in one program at a time. Please complete your current program first.';
            
            Log::info('Enrollment blocked - user has existing enrollment', [
                'user_id' => $user->id,
                'existing_enrollment_id' => $existingAnyEnrollment->id,
                'existing_program_id' => $existingAnyEnrollment->program_id,
                'existing_approval_status' => $existingAnyEnrollment->approval_status,
                'existing_status' => $existingAnyEnrollment->status,
                'requested_program_id' => $program->id
            ]);
            
            return back()->with('error', $message);
        }

        // Create new enrollment with pending approval status
        try {
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'program_id' => $program->id,
                'enrolled_at' => now(),
                'status' => 'paused', // Will become active after approval
                'approval_status' => 'pending',
                'progress' => 0,
            ]);

            Log::info('Enrollment created successfully', [
                'enrollment_id' => $enrollment->id,
                'user_id' => $user->id,
                'program_id' => $program->id,
                'status' => $enrollment->status,
                'approval_status' => $enrollment->approval_status
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create enrollment', [
                'user_id' => $user->id,
                'program_id' => $program->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Failed to create enrollment. Please try again.');
        }

        // Create notification for admins
        $notificationService = new NotificationService();
        $notificationService->createEnrollmentNotification($enrollment, 'pending');

        // Send email to admin
        try {
            Mail::send(new AdminEnrollmentNotification($enrollment));
        } catch (\Exception $e) {
            \Log::error('Failed to send admin enrollment notification email: ' . $e->getMessage());
        }

        // Send confirmation email to student
        \Log::info('Attempting to send student email', [
            'student_email' => $user->email,
            'student_name' => $user->name,
            'program_name' => $program->name,
            'enrollment_id' => $enrollment->id
        ]);

        try {
            $mail = new StudentEnrollmentConfirmation($enrollment);
            Mail::to($user->email)->send($mail);
            \Log::info('Student enrollment email sent successfully to: ' . $user->email);
        } catch (\Exception $e) {
            \Log::error('Failed to send student enrollment confirmation email', [
                'error' => $e->getMessage(),
                'student_email' => $user->email,
                'trace' => $e->getTraceAsString()
            ]);
        }

        return back()->with('success', 'Your enrollment request has been submitted! We\'ll notify you once it\'s approved.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Enrollment $enrollment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Enrollment $enrollment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Enrollment $enrollment)
    {
        //
    }

    /**
     * Cancel an enrollment.
     */
    public function cancel(Enrollment $enrollment)
    {
        // Check if enrollment belongs to current user
        if ($enrollment->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow cancellation of pending enrollments
        if ($enrollment->approval_status !== 'pending') {
            return back()->with('error', 'You can only cancel pending enrollment requests.');
        }

        // Delete the enrollment
        $enrollment->delete();

        return back()->with('success', 'Enrollment request cancelled successfully.');
    }
}
