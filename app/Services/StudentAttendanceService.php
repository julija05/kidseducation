<?php

namespace App\Services;

use App\Models\LiveSessionAttendance;
use App\Models\User;

class StudentAttendanceService
{
    public function __construct(
        private MeetingAttendanceService $meetingAttendanceService,
    ) {}

    public function forStudent(User|int $student, ?array $meetingAttendance = null): array
    {
        $studentId = $student instanceof User ? $student->id : $student;
        $meetingAttendance ??= $this->meetingAttendanceService->forStudent($studentId);
        $liveRecords = LiveSessionAttendance::query()
            ->where('student_id', $studentId)
            ->with('liveSession:id,title,scheduled_at,status')
            ->get()
            ->sortByDesc(fn (LiveSessionAttendance $attendance) => $attendance->liveSession?->scheduled_at)
            ->values();

        $attendedStatuses = [
            LiveSessionAttendance::STATUS_PRESENT,
            LiveSessionAttendance::STATUS_LATE,
            LiveSessionAttendance::STATUS_CAUGHT_UP_LATER,
        ];
        $liveAttended = $liveRecords->whereIn('status', $attendedStatuses)->count();
        $liveMissed = $liveRecords->where('status', LiveSessionAttendance::STATUS_ABSENT)->count();
        $liveExcused = $liveRecords->where('status', LiveSessionAttendance::STATUS_EXCUSED)->count();
        $ratedRecords = ($meetingAttendance['total_records'] ?? 0) + $liveRecords->count() - $liveExcused;
        $attendedCount = ($meetingAttendance['attended_count'] ?? 0) + $liveAttended;

        $meetingRecords = collect($meetingAttendance['recent_records'] ?? [])->map(fn (array $record) => [
            'id' => "meeting-{$record['id']}",
            'title' => $record['meeting_title'],
            'group_name' => $record['group_name'],
            'scheduled_at' => $record['scheduled_at'],
            'date' => $record['date'],
            'status' => $record['status'] === 'attended'
                ? LiveSessionAttendance::STATUS_PRESENT
                : LiveSessionAttendance::STATUS_ABSENT,
            'status_label' => $record['status_label'],
            'source' => 'meeting',
        ]);
        $formattedLiveRecords = $liveRecords->map(fn (LiveSessionAttendance $attendance) => [
            'id' => "live-session-{$attendance->id}",
            'title' => $attendance->liveSession?->title,
            'group_name' => null,
            'scheduled_at' => $attendance->liveSession?->scheduled_at?->toISOString(),
            'date' => $attendance->liveSession?->scheduled_at?->format('M d, Y'),
            'status' => $attendance->status,
            'status_label' => ucfirst(str_replace('_', ' ', $attendance->status)),
            'source' => 'live_session',
        ]);

        return [
            'attended_count' => $attendedCount,
            'missed_count' => ($meetingAttendance['missed_count'] ?? 0) + $liveMissed,
            'late_count' => $liveRecords->where('status', LiveSessionAttendance::STATUS_LATE)->count(),
            'caught_up_later_count' => $liveRecords->where('status', LiveSessionAttendance::STATUS_CAUGHT_UP_LATER)->count(),
            'excused_count' => $liveExcused,
            'total_records' => ($meetingAttendance['total_records'] ?? 0) + $liveRecords->count(),
            'attendance_rate' => $ratedRecords > 0
                ? (float) round(($attendedCount / $ratedRecords) * 100, 1)
                : null,
            'recent_records' => $formattedLiveRecords
                ->concat($meetingRecords)
                ->sortByDesc('scheduled_at')
                ->take(8)
                ->values(),
        ];
    }
}
