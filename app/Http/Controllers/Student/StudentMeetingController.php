<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\MeetingParticipant;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentMeetingController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService
    ) {}

    /**
     * Display the student's Messages page.
     *
     * For now "Messages" surfaces the meetings a mentor has arranged with the
     * student: upcoming invitations the student can confirm or decline, plus a
     * short history of past sessions.
     */
    public function index()
    {
        $student = Auth::user();

        $upcomingMeetings = MeetingParticipant::where('student_id', $student->id)
            ->whereHas('meeting', function ($query) {
                $query->where('scheduled_at', '>', now())
                    ->where('status', 'scheduled');
            })
            ->with(['meeting.mentor'])
            ->get()
            ->map(function ($participant) {
                return [
                    'id' => $participant->id,
                    'meeting' => [
                        'id' => $participant->meeting->id,
                        'title' => $participant->meeting->title,
                        'description' => $participant->meeting->description,
                        'meeting_type' => $participant->meeting->meeting_type,
                        'scheduled_at' => $participant->meeting->scheduled_at,
                        'duration_minutes' => $participant->meeting->duration_minutes,
                        'meeting_url' => $participant->meeting->meeting_url,
                        'location' => $participant->meeting->location,
                        'mentor' => [
                            'name' => $participant->meeting->mentor->name,
                            'email' => $participant->meeting->mentor->email,
                        ],
                    ],
                    'status' => $participant->status,
                    'response_note' => $participant->response_note,
                    'responded_at' => $participant->responded_at,
                ];
            })
            ->sortBy('meeting.scheduled_at')
            ->values();

        $pastMeetings = MeetingParticipant::where('student_id', $student->id)
            ->whereHas('meeting', function ($query) {
                $query->where('scheduled_at', '<', now());
            })
            ->with(['meeting.mentor'])
            ->take(10)
            ->get()
            ->map(function ($participant) {
                return [
                    'id' => $participant->id,
                    'meeting' => [
                        'title' => $participant->meeting->title,
                        'scheduled_at' => $participant->meeting->scheduled_at,
                        'meeting_type' => $participant->meeting->meeting_type,
                        'mentor_name' => $participant->meeting->mentor->name,
                    ],
                    'status' => $participant->status,
                ];
            })
            ->sortByDesc('meeting.scheduled_at')
            ->values();

        return $this->createView('Student/Meetings/Index', [
            'upcomingMeetings' => $upcomingMeetings,
            'pastMeetings' => $pastMeetings,
            'enrolledProgram' => $this->resolveEnrolledProgram($student),
        ]);
    }

    /**
     * Resolve the student's active/completed approved enrollment and format it
     * for the dashboard shell (sidebar theme, progress, abacus availability).
     *
     * Mirrors the other student pages so the Messages page shares the same
     * navigation chrome. Returns null when the student has no approved program,
     * in which case the shell falls back to its neutral defaults.
     *
     * @param  \App\Models\User  $student
     * @return array|null
     */
    private function resolveEnrolledProgram($student): ?array
    {
        $enrollment = $student->enrollments()
            ->with('program')
            ->whereIn('status', ['active', 'completed'])
            ->where('approval_status', 'approved')
            ->where('access_blocked', false)
            ->orderByRaw("CASE status WHEN 'active' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END")
            ->first();

        if (! $enrollment || ! $enrollment->program) {
            return null;
        }

        return $this->enrollmentService->formatEnrollmentForDashboard($enrollment);
    }

    /**
     * Confirm attendance for a meeting
     */
    public function confirm(MeetingParticipant $participant, Request $request)
    {
        $student = Auth::user();

        // Verify this participant belongs to the student
        if ($participant->student_id !== $student->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        $participant->confirm($validated['note'] ?? null);

        return back()->with('success', 'You have confirmed your attendance!');
    }

    /**
     * Decline attendance for a meeting
     */
    public function decline(MeetingParticipant $participant, Request $request)
    {
        $student = Auth::user();

        // Verify this participant belongs to the student
        if ($participant->student_id !== $student->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        $participant->decline($validated['note'] ?? null);

        return back()->with('success', 'You have declined this meeting.');
    }
}
