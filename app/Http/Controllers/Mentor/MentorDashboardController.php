<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminEnrollmentNotification;

class MentorDashboardController extends Controller
{
    /**
     * Display the mentor dashboard.
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Get programs available for mentors to enroll in
        $availablePrograms = Program::where('is_active', true)
            ->select('id', 'name', 'slug', 'description', 'icon', 'color', 'price')
            ->withCount('lessons')
            ->get();

        // Get mentor's enrollments with programs (only mentor-type enrollments)
        $enrollments = $user->enrollments()
            ->with(['program' => function ($query) {
                $query->select('id', 'name', 'slug', 'description', 'icon', 'color');
            }])
            ->where('enrollment_type', 'mentor')
            ->where('approval_status', 'approved')
            ->get();

        // Get pending enrollments (only mentor-type)
        $pendingEnrollments = $user->enrollments()
            ->with(['program' => function ($query) {
                $query->select('id', 'name', 'slug', 'description', 'icon', 'color');
            }])
            ->where('enrollment_type', 'mentor')
            ->where('approval_status', 'pending')
            ->get();

        return Inertia::render('Mentor/Dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'mentor',
            ],
            'availablePrograms' => $availablePrograms,
            'enrollments' => $enrollments,
            'pendingEnrollments' => $pendingEnrollments,
        ]);
    }

    /**
     * Handle mentor application to teach a program.
     */
    public function applyToTeach(Program $program): RedirectResponse
    {
        $user = auth()->user();

        // Verify user is a mentor
        if (!$user->isMentor()) {
            return redirect()->route('mentor.dashboard')
                ->with('error', 'Only mentors can apply to teach programs.');
        }

        // Check if mentor already has an enrollment for this program
        $existingEnrollment = $user->enrollments()
            ->where('program_id', $program->id)
            ->where('enrollment_type', 'mentor')
            ->first();

        if ($existingEnrollment) {
            $status = $existingEnrollment->approval_status;

            if ($status === 'pending') {
                return redirect()->route('mentor.dashboard')
                    ->with('error', 'You already have a pending application to teach this program.');
            } elseif ($status === 'approved') {
                return redirect()->route('mentor.programs.show', $program->slug)
                    ->with('info', 'You are already approved to teach this program.');
            }
        }

        // Create mentor enrollment
        try {
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'program_id' => $program->id,
                'enrollment_type' => 'mentor',
                'enrolled_at' => now(),
                'status' => 'paused', // Will become active after approval
                'approval_status' => 'pending',
                'progress' => 0,
            ]);

            Log::info('Mentor teaching application created', [
                'enrollment_id' => $enrollment->id,
                'mentor_id' => $user->id,
                'mentor_name' => $user->name,
                'program_id' => $program->id,
                'program_name' => $program->name,
                'enrollment_type' => 'mentor',
            ]);

            // Create notification for admins
            $notificationService = new NotificationService;
            $notificationService->createEnrollmentNotification($enrollment, 'pending');

            // Send email to admin
            try {
                Mail::send(new AdminEnrollmentNotification($enrollment));
            } catch (\Exception $e) {
                Log::error('Failed to send admin notification for mentor application: ' . $e->getMessage());
            }

            return redirect()->route('mentor.dashboard')
                ->with('success', 'Your application to teach this program has been submitted. Please wait for admin approval.');

        } catch (\Exception $e) {
            Log::error('Failed to create mentor teaching application', [
                'mentor_id' => $user->id,
                'program_id' => $program->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('mentor.dashboard')
                ->with('error', 'Failed to submit application. Please try again.');
        }
    }

    /**
     * Cancel a pending mentor application.
     */
    public function cancelApplication(Enrollment $enrollment): RedirectResponse
    {
        $user = auth()->user();

        // Verify enrollment belongs to current mentor
        if ($enrollment->user_id !== $user->id || $enrollment->enrollment_type !== 'mentor') {
            abort(403, 'Unauthorized action.');
        }

        // Only allow cancellation of pending applications
        if ($enrollment->approval_status !== 'pending') {
            return redirect()->route('mentor.dashboard')
                ->with('error', 'You can only cancel pending applications.');
        }

        // Delete the enrollment
        $programName = $enrollment->program->name;
        $enrollment->delete();

        Log::info('Mentor application cancelled', [
            'mentor_id' => $user->id,
            'program_name' => $programName,
        ]);

        return redirect()->route('mentor.dashboard')
            ->with('success', 'Your application has been cancelled.');
    }
}
