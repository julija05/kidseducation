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

        // Check if user is suspended
        if ($user->isSuspended()) {
            return redirect()->route('programs.show', $program->slug)
                ->with('error', 'Your account is suspended. Please contact admin@abacoding.com to resolve this issue.');
        }

        // Check if this is a program switch request
        $isSwitchRequest = $request->has('switch_program') && $request->boolean('switch_program');

        Log::info('Enrollment attempt started', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'program_id' => $program->id,
            'program_slug' => $program->slug,
            'user_verified' => $user->hasVerifiedEmail(),
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
                'existing_approval' => $existingEnrollment->approval_status,
            ]);

            return redirect()->route('programs.show', $program->slug)
                ->with('error', 'You already have an enrollment request for this program.');
        }

        // Check for existing active/pending enrollments
        $existingActiveEnrollment = $user->enrollments()
            ->whereIn('approval_status', ['pending', 'approved'])
            ->where('status', '!=', 'completed')
            ->first();

        if ($existingActiveEnrollment) {
            if ($isSwitchRequest) {
                // Handle program switching - cancel old enrollment and create new one
                Log::info('Processing program switch request', [
                    'user_id' => $user->id,
                    'old_enrollment_id' => $existingActiveEnrollment->id,
                    'old_program_id' => $existingActiveEnrollment->program_id,
                    'old_program_name' => $existingActiveEnrollment->program->name,
                    'new_program_id' => $program->id,
                    'new_program_name' => $program->name,
                    'old_approval_status' => $existingActiveEnrollment->approval_status,
                    'old_status' => $existingActiveEnrollment->status,
                ]);

                // Only allow switching FROM pending enrollments or FROM approved but not completed
                if ($existingActiveEnrollment->approval_status === 'pending' ||
                    ($existingActiveEnrollment->approval_status === 'approved' && $existingActiveEnrollment->status !== 'completed')) {

                    // Delete the old enrollment
                    $oldProgramName = $existingActiveEnrollment->program->name;
                    $existingActiveEnrollment->delete();

                    Log::info('Old enrollment deleted for program switch', [
                        'user_id' => $user->id,
                        'deleted_enrollment_id' => $existingActiveEnrollment->id,
                        'old_program_name' => $oldProgramName,
                    ]);
                } else {
                    Log::warning('Invalid program switch attempt - enrollment not eligible for switch', [
                        'user_id' => $user->id,
                        'existing_enrollment_id' => $existingActiveEnrollment->id,
                        'existing_approval_status' => $existingActiveEnrollment->approval_status,
                        'existing_status' => $existingActiveEnrollment->status,
                    ]);

                    return redirect()->route('programs.show', $program->slug)
                        ->with('error', 'Cannot switch programs at this time. Please contact support.');
                }
            } else {
                // Normal enrollment attempt blocked by existing enrollment
                $message = $existingActiveEnrollment->approval_status === 'pending'
                    ? 'You already have a pending enrollment request. Please wait for approval or complete your current program before enrolling in another program.'
                    : 'You can only enroll in a new program after completing your current program. Please finish your current program first.';

                Log::info('Enrollment blocked - user has existing active enrollment', [
                    'user_id' => $user->id,
                    'existing_enrollment_id' => $existingActiveEnrollment->id,
                    'existing_program_id' => $existingActiveEnrollment->program_id,
                    'existing_approval_status' => $existingActiveEnrollment->approval_status,
                    'existing_status' => $existingActiveEnrollment->status,
                    'requested_program_id' => $program->id,
                ]);

                return redirect()->route('programs.show', $program->slug)
                    ->with('error', $message);
            }
        }

        // Check if user has completed enrollments - they can enroll but will lose access to previous dashboard
        $completedEnrollments = $user->enrollments()
            ->whereIn('approval_status', ['approved'])
            ->where('status', 'completed')
            ->get();

        if ($completedEnrollments->isNotEmpty()) {
            Log::info('User with completed program enrolling in new program', [
                'user_id' => $user->id,
                'completed_enrollments_count' => $completedEnrollments->count(),
                'completed_program_names' => $completedEnrollments->pluck('program.name'),
                'new_program_id' => $program->id,
                'new_program_name' => $program->name,
            ]);

            // Store a flash message about losing access to previous dashboard
            session()->flash('enrollment_warning',
                'Note: By enrolling in this program, you will lose access to your previous program dashboard. You can still download certificates for completed programs from your profile.');
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
                'approval_status' => $enrollment->approval_status,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create enrollment', [
                'user_id' => $user->id,
                'program_id' => $program->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('programs.show', $program->slug)
                ->with('error', 'Failed to create enrollment. Please try again.');
        }

        // Create notification for admins
        $notificationService = new NotificationService;
        $notificationService->createEnrollmentNotification($enrollment, 'pending');

        // Send email to admin
        try {
            Mail::send(new AdminEnrollmentNotification($enrollment));
        } catch (\Exception $e) {
            \Log::error('Failed to send admin enrollment notification email: '.$e->getMessage());
        }

        // Send confirmation email to student
        \Log::info('Attempting to send student email', [
            'student_email' => $user->email,
            'student_name' => $user->name,
            'program_name' => $program->name,
            'enrollment_id' => $enrollment->id,
        ]);

        try {
            $mail = new StudentEnrollmentConfirmation($enrollment);
            Mail::to($user->email)->send($mail);
            \Log::info('Student enrollment email sent successfully to: '.$user->email);
        } catch (\Exception $e) {
            \Log::error('Failed to send student enrollment confirmation email', [
                'error' => $e->getMessage(),
                'student_email' => $user->email,
                'trace' => $e->getTraceAsString(),
            ]);
        }

        // Redirect to the program page (authenticated view) with success message
        $successMessage = $isSwitchRequest ? 'program_switch_success' : 'waiting_list_success';

        return redirect()->route('programs.show', $program->slug)
            ->with('success', $successMessage)
            ->with('waiting_list_program', $program->name);
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
            return redirect()->route('programs.show', $enrollment->program->slug)
                ->with('error', 'You can only leave the waiting list for pending requests.');
        }

        // Delete the enrollment
        $enrollment->delete();

        return redirect()->route('programs.show', $enrollment->program->slug)
            ->with('success', 'left_waiting_list');
    }
}
