<?php

namespace App\Services;

use App\Models\LearningGroup;
use App\Models\MeetingParticipant;
use App\Models\User;
use Illuminate\Support\Collection;

class MeetingAttendanceService
{
    public function forStudent(User|int $student): array
    {
        $studentId = $student instanceof User ? $student->id : $student;

        $records = MeetingParticipant::query()
            ->where('student_id', $studentId)
            ->whereIn('status', ['attended', 'missed'])
            ->whereNotNull('attendance_marked_at')
            ->with([
                'student:id,name,email',
                'meeting:id,mentor_id,learning_group_id,title,scheduled_at,duration_minutes,status',
                'meeting.mentor:id,name',
                'meeting.learningGroup:id,name',
                'attendanceMarkedBy:id,name',
            ])
            ->get()
            ->sortByDesc(fn (MeetingParticipant $participant) => $participant->meeting?->scheduled_at)
            ->values();

        return $this->summary($records);
    }

    public function forMentor(User|int $mentor): array
    {
        $mentorId = $mentor instanceof User ? $mentor->id : $mentor;

        $records = MeetingParticipant::query()
            ->whereIn('status', ['attended', 'missed'])
            ->whereNotNull('attendance_marked_at')
            ->whereHas('meeting', fn ($query) => $query->where('mentor_id', $mentorId))
            ->with([
                'student:id,name,email',
                'meeting:id,mentor_id,learning_group_id,title,scheduled_at,duration_minutes,status',
                'meeting.mentor:id,name',
                'meeting.learningGroup:id,name',
                'attendanceMarkedBy:id,name',
            ])
            ->get()
            ->sortByDesc(fn (MeetingParticipant $participant) => $participant->meeting?->scheduled_at)
            ->values();

        $summary = $this->summary($records);
        $summary['student_summaries'] = $records
            ->groupBy('student_id')
            ->map(function (Collection $studentRecords, int $studentId) {
                $attended = $studentRecords->where('status', 'attended')->count();
                $missed = $studentRecords->where('status', 'missed')->count();
                $total = $attended + $missed;

                return [
                    'student_id' => $studentId,
                    'attended_count' => $attended,
                    'missed_count' => $missed,
                    'total_records' => $total,
                    'attendance_rate' => $total > 0 ? (float) round(($attended / $total) * 100, 1) : null,
                ];
            })
            ->values();

        return $summary;
    }

    public function forGroup(LearningGroup|int $learningGroup): array
    {
        $learningGroupId = $learningGroup instanceof LearningGroup ? $learningGroup->id : $learningGroup;

        $records = MeetingParticipant::query()
            ->whereIn('status', ['attended', 'missed'])
            ->whereNotNull('attendance_marked_at')
            ->whereHas('meeting', fn ($query) => $query->where('learning_group_id', $learningGroupId))
            ->with([
                'student:id,name,email',
                'meeting:id,mentor_id,learning_group_id,title,scheduled_at,duration_minutes,status',
                'meeting.mentor:id,name',
                'meeting.learningGroup:id,name',
                'attendanceMarkedBy:id,name',
            ])
            ->get()
            ->sortByDesc(fn (MeetingParticipant $participant) => $participant->meeting?->scheduled_at)
            ->values();

        $summary = $this->summary($records);
        $summary['student_summaries'] = $records
            ->groupBy('student_id')
            ->map(function (Collection $studentRecords, int $studentId) {
                $attended = $studentRecords->where('status', 'attended')->count();
                $missed = $studentRecords->where('status', 'missed')->count();
                $total = $attended + $missed;

                return [
                    'student_id' => $studentId,
                    'attended_count' => $attended,
                    'missed_count' => $missed,
                    'total_records' => $total,
                    'attendance_rate' => $total > 0 ? (float) round(($attended / $total) * 100, 1) : null,
                    'records' => $studentRecords
                        ->map(fn (MeetingParticipant $participant) => $this->formatRecord($participant))
                        ->values(),
                ];
            })
            ->values();

        return $summary;
    }

    private function summary(Collection $records): array
    {
        $attended = $records->where('status', 'attended')->count();
        $missed = $records->where('status', 'missed')->count();
        $total = $attended + $missed;

        return [
            'attended_count' => $attended,
            'missed_count' => $missed,
            'total_records' => $total,
            'attendance_rate' => $total > 0 ? (float) round(($attended / $total) * 100, 1) : null,
            'recent_records' => $records
                ->take(8)
                ->map(fn (MeetingParticipant $participant) => $this->formatRecord($participant))
                ->values(),
        ];
    }

    private function formatRecord(MeetingParticipant $participant): array
    {
        return [
            'id' => $participant->id,
            'student_id' => $participant->student_id,
            'student_name' => $participant->student?->name,
            'student_email' => $participant->student?->email,
            'meeting_id' => $participant->meeting_id,
            'meeting_title' => $participant->meeting?->title,
            'group_name' => $participant->meeting?->learningGroup?->name,
            'mentor_name' => $participant->meeting?->mentor?->name,
            'scheduled_at' => $participant->meeting?->scheduled_at?->toISOString(),
            'date' => $participant->meeting?->scheduled_at?->format('M d, Y'),
            'status' => $participant->status,
            'status_label' => $participant->status === 'attended' ? 'Present' : 'Absent',
            'attendance_marked_at' => $participant->attendance_marked_at?->toISOString(),
            'attendance_marked_by' => $participant->attendanceMarkedBy?->name,
        ];
    }
}
