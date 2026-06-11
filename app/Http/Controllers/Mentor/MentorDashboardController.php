<?php

namespace App\Http\Controllers\Mentor;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Contracts\EnrollmentRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Mail\AdminEnrollmentNotification;
use App\Models\Enrollment;
use App\Models\Meeting;
use App\Models\Program;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class MentorDashboardController extends Controller
{
    public function __construct(
        private EnrollmentRepositoryInterface $enrollmentRepository
    ) {}

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

        // Get mentor's enrollments with programs and student counts using repository
        $enrollments = $this->enrollmentRepository->getActiveEnrollments($user, EnrollmentType::MENTOR)
            ->map(function ($enrollment) use ($user) {
                return [
                    'id' => $enrollment->id,
                    'program' => $enrollment->program,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'students_count' => $this->enrollmentRepository->countStudentsForMentorInProgram($enrollment->program_id, $user),
                    'average_progress' => $this->enrollmentRepository->getAverageProgressForMentorInProgram($enrollment->program_id, $user),
                ];
            });

        // Get pending enrollments (only mentor-type)
        $pendingEnrollments = $user->enrollments()
            ->with(['program' => function ($query) {
                $query->select('id', 'name', 'slug', 'description', 'icon', 'color');
            }])
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->where('approval_status', ApprovalStatus::PENDING)
            ->get();

        // Get all students across all programs the mentor teaches using repository
        $programIds = $enrollments->pluck('program.id')->toArray();
        $allStudents = $this->enrollmentRepository->getStudentsForMentor($user, $programIds)
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->user->id,
                    'name' => $enrollment->user->name,
                    'email' => $enrollment->user->email,
                    'program_name' => $enrollment->program->name,
                    'program_slug' => $enrollment->program->slug,
                    'progress' => $enrollment->progress,
                    'status' => $enrollment->status,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'quiz_points' => $enrollment->quiz_points,
                    'highest_unlocked_level' => $enrollment->highest_unlocked_level,
                ];
            })
            ->unique('id')
            ->values();

        // Get mentor's invitation URL
        $invitationUrl = $user->getInvitationUrl();
        $referralCode = $user->getReferralCode();
        $referredStudentsCount = $user->getReferredStudentsCount();

        // Get upcoming meetings (next 5)
        $upcomingMeetings = Meeting::byMentor($user->id)
            ->upcoming()
            ->with(['students'])
            ->take(5)
            ->get()
            ->map(function ($meeting) {
                return [
                    'id' => $meeting->id,
                    'title' => $meeting->title,
                    'meeting_type' => $meeting->meeting_type,
                    'scheduled_at' => $meeting->scheduled_at,
                    'duration_minutes' => $meeting->duration_minutes,
                    'participants_count' => $meeting->participants->count(),
                ];
            });

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
            'allStudents' => $allStudents,
            'invitationUrl' => $invitationUrl,
            'referralCode' => $referralCode,
            'referredStudentsCount' => $referredStudentsCount,
            'upcomingMeetings' => $upcomingMeetings,
            'canUseAbacus' => $user->canUseAbacusSimulator(),
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
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->first();

        if ($existingEnrollment) {
            $status = $existingEnrollment->approval_status;

            if ($status === ApprovalStatus::PENDING) {
                return redirect()->route('mentor.dashboard')
                    ->with('error', 'You already have a pending application to teach this program.');
            } elseif ($status === ApprovalStatus::APPROVED) {
                return redirect()->route('mentor.programs.show', $program->slug)
                    ->with('info', 'You are already approved to teach this program.');
            }
        }

        // Create mentor enrollment
        try {
            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'program_id' => $program->id,
                'enrollment_type' => EnrollmentType::MENTOR,
                'enrolled_at' => now(),
                'status' => EnrollmentStatus::PAUSED, // Will become active after approval
                'approval_status' => ApprovalStatus::PENDING,
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
        if ($enrollment->user_id !== $user->id || $enrollment->enrollment_type !== EnrollmentType::MENTOR) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow cancellation of pending applications
        if ($enrollment->approval_status !== ApprovalStatus::PENDING) {
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
