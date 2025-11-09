<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\MeetingParticipant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentMeetingController extends Controller
{
    /**
     * Display student's meetings
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

        return Inertia::render('Student/Meetings/Index', [
            'upcomingMeetings' => $upcomingMeetings,
            'pastMeetings' => $pastMeetings,
        ]);
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
