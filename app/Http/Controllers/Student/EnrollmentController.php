<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentRequest;
use App\Mail\CompanyNotificationMail;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
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

        // Check if already enrolled
        $existingEnrollment = $user->enrollments()
            ->where('program_id', $program->id)
            ->first();

        if ($existingEnrollment) {
            return back()->with('error', 'You already have an enrollment request for this program.');
        }

        // Check if user has any other active enrollment
        $activeEnrollment = $user->enrollments()
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->first();

        if ($activeEnrollment) {
            return back()->with('error', 'You can only be enrolled in one program at a time. Please complete your current program first.');
        }

        // Create new enrollment with pending approval status
        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'program_id' => $program->id,
            'enrolled_at' => now(),
            'status' => 'paused', // Will become active after approval
            'approval_status' => 'pending',
            'progress' => 0,
        ]);

        // Send email to student
        // if (class_exists(EnrollmentRequestMail::class)) {
        //     Mail::to($user->email)->send(
        //         new EnrollmentRequestMail($user, $program)
        //     );
        // }

        // Send notification to company email
        // Mail::to('abacoding@abacoding.com')->send(
        //     new CompanyNotificationMail($enrollment)
        // );

        // Notify all admins
        $admins = User::role('admin')->get();
        // foreach ($admins as $admin) {
        //     Mail::to($admin->email)->send(
        //         new CompanyNotificationMail($enrollment)
        //     );
        // }

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
