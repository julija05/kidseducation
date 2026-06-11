<?php

namespace App\Http\Controllers\Mentor;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentType;
use App\Contracts\EnrollmentRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Meeting;
use App\Models\MeetingParticipant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MeetingController extends Controller
{
    public function __construct(
        private EnrollmentRepositoryInterface $enrollmentRepository
    ) {}

    /**
     * Display a listing of the mentor's meetings
     */
    public function index()
    {
        $mentor = Auth::user();

        $upcomingMeetings = Meeting::byMentor($mentor->id)
            ->upcoming()
            ->with(['students', 'participants'])
            ->get()
            ->map(function ($meeting) {
                return [
                    'id' => $meeting->id,
                    'title' => $meeting->title,
                    'description' => $meeting->description,
                    'meeting_type' => $meeting->meeting_type,
                    'scheduled_at' => $meeting->scheduled_at,
                    'duration_minutes' => $meeting->duration_minutes,
                    'meeting_url' => $meeting->meeting_url,
                    'location' => $meeting->location,
                    'status' => $meeting->status,
                    'max_participants' => $meeting->max_participants,
                    'participants_count' => $meeting->participants->count(),
                    'confirmed_count' => $meeting->getConfirmedParticipantsCount(),
                    'students' => $meeting->students->map(function ($student) {
                        return [
                            'id' => $student->id,
                            'name' => $student->name,
                            'email' => $student->email,
                            'status' => $student->pivot->status,
                        ];
                    }),
                ];
            });

        $pastMeetings = Meeting::byMentor($mentor->id)
            ->past()
            ->with(['students', 'participants'])
            ->take(10)
            ->get()
            ->map(function ($meeting) {
                return [
                    'id' => $meeting->id,
                    'title' => $meeting->title,
                    'scheduled_at' => $meeting->scheduled_at,
                    'meeting_type' => $meeting->meeting_type,
                    'status' => $meeting->status,
                    'participants_count' => $meeting->participants->count(),
                ];
            });

        return Inertia::render('Mentor/Meetings/Index', [
            'upcomingMeetings' => $upcomingMeetings,
            'pastMeetings' => $pastMeetings,
        ]);
    }

    /**
     * Show the form for creating a new meeting
     */
    public function create()
    {
        $mentor = Auth::user();

        // Get programs where this mentor teaches (approved enrollments with enrollment_type='mentor')
        $mentorPrograms = Enrollment::where('user_id', $mentor->id)
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->pluck('program_id');

        // Get only students assigned to this mentor in the programs they teach
        $students = $this->enrollmentRepository->getStudentsForMentor($mentor, $mentorPrograms->all())
            ->pluck('user')
            ->unique('id')
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                ];
            })
            ->values();

        return Inertia::render('Mentor/Meetings/Create', [
            'students' => $students,
        ]);
    }

    /**
     * Store a newly created meeting in storage
     */
    public function store(Request $request)
    {
        $mentor = Auth::user();

        $validated = $request->validate([
            'title' => 'required|string|max:191',
            'description' => 'nullable|string',
            'meeting_type' => 'required|in:individual,group',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'meeting_url' => 'nullable|url|max:500',
            'location' => 'nullable|string|max:191',
            'student_ids' => 'required|array|min:1|max:5',
            'student_ids.*' => 'required|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        // Verify all students belong to programs this mentor teaches
        $mentorPrograms = Enrollment::where('user_id', $mentor->id)
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->pluck('program_id');

        $validStudents = $this->enrollmentRepository->getStudentsForMentor($mentor, $mentorPrograms->all())
            ->whereIn('user_id', $validated['student_ids'])
            ->pluck('user_id')
            ->unique();

        if ($validStudents->count() !== count($validated['student_ids'])) {
            return back()->withErrors(['student_ids' => 'One or more selected students are not assigned to your mentorship.']);
        }

        // Set max_participants based on meeting type and actual participants
        $maxParticipants = $validated['meeting_type'] === 'individual' ? 1 : count($validated['student_ids']);

        $meeting = Meeting::create([
            'mentor_id' => $mentor->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'meeting_type' => $validated['meeting_type'],
            'scheduled_at' => $validated['scheduled_at'],
            'duration_minutes' => $validated['duration_minutes'],
            'meeting_url' => $validated['meeting_url'],
            'location' => $validated['location'],
            'max_participants' => $maxParticipants,
            'notes' => $validated['notes'],
            'status' => 'scheduled',
        ]);

        // Add participants
        foreach ($validated['student_ids'] as $studentId) {
            MeetingParticipant::create([
                'meeting_id' => $meeting->id,
                'student_id' => $studentId,
                'status' => 'invited',
            ]);
        }

        return redirect()->route('mentor.meetings.index')
            ->with('success', 'Meeting scheduled successfully!');
    }

    /**
     * Display the specified meeting
     */
    public function show(Meeting $meeting)
    {
        $mentor = Auth::user();

        // Ensure this meeting belongs to the mentor
        if ($meeting->mentor_id !== $mentor->id) {
            abort(403, 'Unauthorized access to this meeting.');
        }

        $meeting->load(['students', 'participants.student']);

        return Inertia::render('Mentor/Meetings/Show', [
            'meeting' => [
                'id' => $meeting->id,
                'title' => $meeting->title,
                'description' => $meeting->description,
                'meeting_type' => $meeting->meeting_type,
                'scheduled_at' => $meeting->scheduled_at,
                'duration_minutes' => $meeting->duration_minutes,
                'meeting_url' => $meeting->meeting_url,
                'location' => $meeting->location,
                'status' => $meeting->status,
                'max_participants' => $meeting->max_participants,
                'notes' => $meeting->notes,
                'participants' => $meeting->participants->map(function ($participant) {
                    return [
                        'id' => $participant->id,
                        'student' => [
                            'id' => $participant->student->id,
                            'name' => $participant->student->name,
                            'email' => $participant->student->email,
                        ],
                        'status' => $participant->status,
                        'response_note' => $participant->response_note,
                        'responded_at' => $participant->responded_at,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Update the specified meeting
     */
    public function update(Request $request, Meeting $meeting)
    {
        $mentor = Auth::user();

        // Ensure this meeting belongs to the mentor
        if ($meeting->mentor_id !== $mentor->id) {
            abort(403, 'Unauthorized access to this meeting.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:191',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'meeting_url' => 'nullable|url|max:500',
            'location' => 'nullable|string|max:191',
            'notes' => 'nullable|string',
        ]);

        $meeting->update($validated);

        return redirect()->route('mentor.meetings.show', $meeting)
            ->with('success', 'Meeting updated successfully!');
    }

    /**
     * Cancel the specified meeting
     */
    public function cancel(Meeting $meeting)
    {
        $mentor = Auth::user();

        // Ensure this meeting belongs to the mentor
        if ($meeting->mentor_id !== $mentor->id) {
            abort(403, 'Unauthorized access to this meeting.');
        }

        $meeting->cancel();

        return redirect()->route('mentor.meetings.index')
            ->with('success', 'Meeting cancelled successfully!');
    }

    /**
     * Mark the meeting as completed
     */
    public function complete(Meeting $meeting)
    {
        $mentor = Auth::user();

        // Ensure this meeting belongs to the mentor
        if ($meeting->mentor_id !== $mentor->id) {
            abort(403, 'Unauthorized access to this meeting.');
        }

        $meeting->markAsCompleted();

        return redirect()->route('mentor.meetings.show', $meeting)
            ->with('success', 'Meeting marked as completed!');
    }

    /**
     * Delete the specified meeting
     */
    public function destroy(Meeting $meeting)
    {
        $mentor = Auth::user();

        // Ensure this meeting belongs to the mentor
        if ($meeting->mentor_id !== $mentor->id) {
            abort(403, 'Unauthorized access to this meeting.');
        }

        $meeting->delete();

        return redirect()->route('mentor.meetings.index')
            ->with('success', 'Meeting deleted successfully!');
    }
}
