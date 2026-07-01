<?php

namespace App\Http\Controllers\Mentor;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentType;
use App\Contracts\EnrollmentRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Mentor\StoreMeetingAttendanceRequest;
use App\Http\Requests\Mentor\StoreMeetingRequest;
use App\Models\Enrollment;
use App\Models\LearningGroup;
use App\Models\Meeting;
use App\Models\MeetingParticipant;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MeetingController extends Controller
{
    public function __construct(
        private EnrollmentRepositoryInterface $enrollmentRepository,
        private NotificationService $notificationService,
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

        $groups = LearningGroup::query()
            ->where('mentor_id', $mentor->id)
            ->active()
            ->whereHas('students')
            ->with(['program:id,name', 'students:id,name,email'])
            ->withCount('students')
            ->orderBy('name')
            ->get()
            ->map(fn (LearningGroup $group) => [
                'id' => $group->id,
                'name' => $group->name,
                'program_name' => $group->program?->name,
                'students_count' => $group->students_count,
                'students' => $group->students->map(fn ($student) => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                ])->values(),
            ]);

        return Inertia::render('Mentor/Meetings/Create', [
            'students' => $students,
            'groups' => $groups,
        ]);
    }

    /**
     * Store a newly created meeting in storage
     */
    public function store(StoreMeetingRequest $request): RedirectResponse
    {
        $mentor = Auth::user();
        $validated = $request->validated();

        $learningGroup = null;
        if ($validated['meeting_type'] === 'group') {
            $learningGroup = LearningGroup::query()
                ->whereKey($validated['learning_group_id'])
                ->where('mentor_id', $mentor->id)
                ->active()
                ->with('students:id,name,email')
                ->first();

            if (! $learningGroup) {
                return back()->withErrors([
                    'learning_group_id' => 'Select an active learning group that you manage.',
                ])->withInput();
            }

            if ($learningGroup->students->isEmpty()) {
                return back()->withErrors([
                    'learning_group_id' => 'Students must be added to this group before scheduling a meeting.',
                ])->withInput();
            }

            $studentIds = $learningGroup->students->pluck('id');
        } else {
            $studentIds = collect($validated['student_ids'] ?? [])->map(fn ($id) => (int) $id)->unique();

            // Verify the selected student belongs to this mentor.
            $mentorPrograms = Enrollment::where('user_id', $mentor->id)
                ->where('enrollment_type', EnrollmentType::MENTOR)
                ->where('approval_status', ApprovalStatus::APPROVED)
                ->pluck('program_id');

            $validStudents = $this->enrollmentRepository->getStudentsForMentor($mentor, $mentorPrograms->all())
                ->whereIn('user_id', $studentIds)
                ->pluck('user_id')
                ->unique();

            if ($validStudents->count() !== $studentIds->count()) {
                return back()->withErrors(['student_ids' => 'The selected student is not assigned to your mentorship.']);
            }
        }

        $meeting = DB::transaction(function () use ($validated, $mentor, $learningGroup, $studentIds) {
            $meeting = Meeting::create([
                'mentor_id' => $mentor->id,
                'learning_group_id' => $learningGroup?->id,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'meeting_type' => $validated['meeting_type'],
                'scheduled_at' => $validated['scheduled_at'],
                'duration_minutes' => $validated['duration_minutes'],
                'meeting_url' => $validated['meeting_url'] ?? null,
                'location' => $validated['location'] ?? null,
                'max_participants' => $studentIds->count(),
                'notes' => $validated['notes'] ?? null,
                'status' => 'scheduled',
            ]);

            $studentIds->each(fn ($studentId) => MeetingParticipant::create([
                'meeting_id' => $meeting->id,
                'student_id' => $studentId,
                'status' => 'invited',
            ]));

            return $meeting;
        });

        $this->notifyParticipants($meeting, $studentIds->all(), 'scheduled');

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

        $meeting->load(['learningGroup:id,name', 'students', 'participants.student']);

        return Inertia::render('Mentor/Meetings/Show', [
            'meeting' => [
                'id' => $meeting->id,
                'title' => $meeting->title,
                'description' => $meeting->description,
                'meeting_type' => $meeting->meeting_type,
                'learning_group' => $meeting->learningGroup ? [
                    'id' => $meeting->learningGroup->id,
                    'name' => $meeting->learningGroup->name,
                ] : null,
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
                        'attendance_marked_at' => $participant->attendance_marked_at,
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

        $this->notifyParticipants($meeting, $meeting->participants()->pluck('student_id')->all(), 'updated');

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

        $this->notifyParticipants($meeting, $meeting->participants()->pluck('student_id')->all(), 'cancelled');

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

    public function storeAttendance(
        StoreMeetingAttendanceRequest $request,
        Meeting $meeting
    ): RedirectResponse {
        $this->authorizeMentorMeeting($meeting);

        $attendance = collect($request->validated('attendance'));
        $participantIds = $meeting->participants()->pluck('id');

        if ($attendance->pluck('participant_id')->diff($participantIds)->isNotEmpty()) {
            return back()->withErrors([
                'attendance' => 'Attendance can only be recorded for students invited to this meeting.',
            ]);
        }

        DB::transaction(function () use ($attendance) {
            $attendance->each(fn (array $record) => MeetingParticipant::whereKey($record['participant_id'])
                ->update([
                    'status' => $record['status'],
                    'attendance_marked_at' => now(),
                    'attendance_marked_by' => Auth::id(),
                ]));
        });

        return back()->with('success', 'Meeting attendance saved successfully.');
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

    private function authorizeMentorMeeting(Meeting $meeting): void
    {
        if ($meeting->mentor_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this meeting.');
        }
    }

    private function notifyParticipants(Meeting $meeting, array $studentIds, string $action): void
    {
        $meeting->loadMissing(['mentor:id,name', 'learningGroup:id,name']);

        $titles = [
            'scheduled' => 'New class meeting scheduled',
            'updated' => 'Class meeting updated',
            'cancelled' => 'Class meeting cancelled',
        ];
        $verbs = [
            'scheduled' => 'scheduled',
            'updated' => 'updated',
            'cancelled' => 'cancelled',
        ];

        foreach ($studentIds as $studentId) {
            $this->notificationService->create(
                $titles[$action] ?? 'Class meeting updated',
                sprintf(
                    '%s %s "%s" for %s.',
                    $meeting->mentor->name,
                    $verbs[$action] ?? 'updated',
                    $meeting->title,
                    $meeting->scheduled_at->format('M j, Y \a\t g:i A')
                ),
                'meeting',
                [
                    'action' => $action,
                    'student_id' => (int) $studentId,
                    'meeting_id' => $meeting->id,
                    'group_id' => $meeting->learning_group_id,
                    'group_name' => $meeting->learningGroup?->name,
                    'scheduled_at' => $meeting->scheduled_at->toISOString(),
                    'meeting_url' => $meeting->meeting_url,
                    'location' => $meeting->location,
                ],
                $meeting,
                $meeting->mentor
            );
        }
    }
}
