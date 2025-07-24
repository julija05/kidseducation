<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassSchedule;
use App\Models\User;
use App\Models\Program;
use App\Models\Lesson;
use App\Models\Enrollment;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminClassScheduleController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Display a listing of class schedules
     */
    public function index(Request $request)
    {
        $query = ClassSchedule::with(['student', 'students', 'admin', 'program', 'lesson'])
            ->orderBy('scheduled_at', 'asc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_filter')) {
            switch ($request->date_filter) {
                case 'today':
                    $query->today();
                    break;
                case 'this_week':
                    $query->thisWeek();
                    break;
                case 'upcoming':
                    $query->upcoming();
                    break;
                case 'custom':
                    if ($request->has('date')) {
                        $query->whereDate('scheduled_at', $request->date);
                    }
                    break;
            }
        }

        // Filter by admin
        if ($request->has('admin_id') && $request->admin_id !== 'all') {
            $query->where('admin_id', $request->admin_id);
        }

        // Search by student name (individual or group classes)
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                // Search in individual student
                $q->whereHas('student', function ($subQ) use ($request) {
                    $subQ->where('name', 'like', '%' . $request->search . '%')
                         ->orWhere('email', 'like', '%' . $request->search . '%');
                })
                // Search in group students
                ->orWhereHas('students', function ($subQ) use ($request) {
                    $subQ->where('name', 'like', '%' . $request->search . '%')
                         ->orWhere('email', 'like', '%' . $request->search . '%');
                });
            });
        }

        $schedules = $query->paginate(15)->withQueryString();

        $admins = User::role('admin')->get(['id', 'name']);

        return $this->createView('Admin/ClassSchedules/Index', [
            'schedules' => $schedules,
            'admins' => $admins,
            'filters' => [
                'status' => $request->status ?? 'all',
                'date_filter' => $request->date_filter ?? 'all',
                'admin_id' => $request->admin_id ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new class schedule
     */
    public function create(Request $request)
    {
        // Only show students who have at least one approved enrollment
        $students = User::role('student')
            ->whereHas('enrollments', function ($query) {
                $query->where('approval_status', 'approved')
                      ->where('status', 'active');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
            
        $admins = User::role('admin')->orderBy('name')->get(['id', 'name']);
        $programs = Program::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        // If student_id is provided, get their enrollments
        $studentEnrollments = [];
        if ($request->has('student_id')) {
            $studentEnrollments = Enrollment::with('program')
                ->where('user_id', $request->student_id)
                ->where('approval_status', 'approved')
                ->where('status', 'active')
                ->get();
        }

        // For group classes, we need to get students by program
        $studentsByProgram = [];
        if ($request->has('program_id') && $request->program_id) {
            $studentsByProgram = User::role('student')
                ->whereHas('enrollments', function ($query) use ($request) {
                    $query->where('program_id', $request->program_id)
                          ->where('approval_status', 'approved')
                          ->where('status', 'active');
                })
                ->orderBy('name')
                ->get(['id', 'name', 'email']);
        }

        return $this->createView('Admin/ClassSchedules/Create', [
            'students' => $students,
            'admins' => $admins,
            'programs' => $programs,
            'studentEnrollments' => $studentEnrollments,
            'selectedStudentId' => $request->student_id,
            'studentsByProgram' => $studentsByProgram,
        ]);
    }

    /**
     * Store a newly created class schedule
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'nullable|exists:users,id',
            'student_ids' => 'nullable|array|max:5',
            'student_ids.*' => 'exists:users,id',
            'admin_id' => 'required|exists:users,id',
            'program_id' => 'nullable|exists:programs,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'location' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|url',
            'type' => 'required|in:lesson,assessment,consultation,review',
            'is_group_class' => 'boolean',
            'max_students' => 'integer|min:1|max:5',
        ]);

        // Determine if it's a group class
        $isGroupClass = $request->boolean('is_group_class') || !empty($validated['student_ids']);
        $studentIds = $isGroupClass ? ($validated['student_ids'] ?? []) : [$validated['student_id']];
        
        // Validate student selection
        if (empty($studentIds) || (count($studentIds) === 1 && $studentIds[0] === null)) {
            return back()->withErrors(['student_id' => 'At least one student must be selected.']);
        }

        if ($isGroupClass && count($studentIds) > 5) {
            return back()->withErrors(['student_ids' => 'Group classes cannot have more than 5 students.']);
        }

        // Remove null values
        $studentIds = array_filter($studentIds);
        
        $validated['is_group_class'] = $isGroupClass;
        $validated['max_students'] = $isGroupClass ? min(count($studentIds), $validated['max_students'] ?? 5) : 1;

        // Validate that students are enrolled in the program if program is selected
        if (!empty($validated['program_id'])) {
            foreach ($studentIds as $studentId) {
                $enrollment = Enrollment::where('user_id', $studentId)
                    ->where('program_id', $validated['program_id'])
                    ->where('approval_status', 'approved')
                    ->where('status', 'active')
                    ->first();

                if (!$enrollment) {
                    $student = User::find($studentId);
                    return back()->withErrors(['program_id' => "Student {$student->name} is not enrolled in the selected program."]);
                }
            }
        }

        // Check for scheduling conflicts using the improved method
        $scheduledAt = \Carbon\Carbon::parse($validated['scheduled_at']);
        if (ClassSchedule::hasConflict($validated['admin_id'], $scheduledAt, $validated['duration_minutes'])) {
            $conflicts = ClassSchedule::getConflicts($validated['admin_id'], $scheduledAt, $validated['duration_minutes']);
            $conflictTitles = $conflicts->pluck('title')->implode(', ');
            return back()->withErrors(['scheduled_at' => "The selected time conflicts with: {$conflictTitles}"]);
        }

        try {
            DB::beginTransaction();

            // Set student_id for individual classes
            if (!$isGroupClass) {
                $validated['student_id'] = $studentIds[0];
            } else {
                $validated['student_id'] = null; // Group classes don't use student_id
            }

            $schedule = ClassSchedule::create($validated);

            // Attach students for group classes
            if ($isGroupClass) {
                $schedule->students()->attach($studentIds);
            }

            // Create notifications for all students
            foreach ($studentIds as $studentId) {
                $student = User::find($studentId);
                if ($student) {
                    // Create a temporary schedule object for notification with the specific student
                    $scheduleForNotification = clone $schedule;
                    $scheduleForNotification->student_id = $studentId;
                    $scheduleForNotification->student = $student;
                    
                    $this->notificationService->createScheduleNotification($scheduleForNotification, 'scheduled');
                }
            }

            // Mark as notified
            $schedule->markStudentNotified();

            DB::commit();

            $studentCount = count($studentIds);
            $message = $isGroupClass 
                ? "Group class scheduled successfully! {$studentCount} students have been notified."
                : 'Class scheduled successfully! Student has been notified.';

            return redirect()->route('admin.class-schedules.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to create schedule: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified class schedule
     */
    public function show(ClassSchedule $classSchedule)
    {
        $classSchedule->load(['student', 'students', 'admin', 'program', 'lesson', 'cancelledBy']);

        return $this->createView('Admin/ClassSchedules/Show', [
            'schedule' => $classSchedule,
        ]);
    }

    /**
     * Show the form for editing the specified class schedule
     */
    public function edit(ClassSchedule $classSchedule)
    {
        if ($classSchedule->isCompleted() || $classSchedule->isCancelled()) {
            return redirect()->route('admin.class-schedules.show', $classSchedule)
                ->with('error', 'Cannot edit completed or cancelled classes.');
        }

        // Only show students who have at least one approved enrollment
        $students = User::role('student')
            ->whereHas('enrollments', function ($query) {
                $query->where('approval_status', 'approved')
                      ->where('status', 'active');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
        $admins = User::role('admin')->orderBy('name')->get(['id', 'name']);
        $programs = Program::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        // Get lessons for the selected program
        $lessons = [];
        if ($classSchedule->program_id) {
            $lessons = Lesson::where('program_id', $classSchedule->program_id)
                ->where('is_active', true)
                ->orderBy('level')
                ->orderBy('order_in_level')
                ->get(['id', 'title', 'level']);
        }

        $classSchedule->load(['student', 'admin', 'program', 'lesson']);

        return $this->createView('Admin/ClassSchedules/Edit', [
            'schedule' => $classSchedule,
            'students' => $students,
            'admins' => $admins,
            'programs' => $programs,
            'lessons' => $lessons,
        ]);
    }

    /**
     * Update the specified class schedule
     */
    public function update(Request $request, ClassSchedule $classSchedule): RedirectResponse
    {
        if ($classSchedule->isCompleted() || $classSchedule->isCancelled()) {
            return back()->with('error', 'Cannot update completed or cancelled classes.');
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'admin_id' => 'required|exists:users,id',
            'program_id' => 'nullable|exists:programs,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'location' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|url',
            'type' => 'required|in:lesson,assessment,consultation,review',
        ]);

        // Check for scheduling conflicts (excluding current schedule)
        $conflictingSchedule = ClassSchedule::where('admin_id', $validated['admin_id'])
            ->where('id', '!=', $classSchedule->id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($validated) {
                $endTime = \Carbon\Carbon::parse($validated['scheduled_at'])
                    ->addMinutes($validated['duration_minutes']);
                
                $query->whereBetween('scheduled_at', [
                    $validated['scheduled_at'],
                    $endTime
                ])->orWhere(function ($q) use ($validated, $endTime) {
                    $q->where('scheduled_at', '<=', $validated['scheduled_at'])
                      ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?', [$validated['scheduled_at']]);
                });
            })
            ->first();

        if ($conflictingSchedule) {
            return back()->withErrors(['scheduled_at' => 'The selected time conflicts with another scheduled class.']);
        }

        try {
            DB::beginTransaction();

            $wasRescheduled = $classSchedule->scheduled_at->ne($validated['scheduled_at']);
            
            $classSchedule->update($validated);

            // If rescheduled, notify student and reset status
            if ($wasRescheduled) {
                $classSchedule->update(['status' => 'scheduled']);
                $this->notificationService->createScheduleNotification($classSchedule, 'rescheduled');
            }

            DB::commit();

            $message = $wasRescheduled 
                ? 'Class updated and student notified of the time change.' 
                : 'Class updated successfully.';

            return redirect()->route('admin.class-schedules.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to update schedule: ' . $e->getMessage()]);
        }
    }

    /**
     * Cancel the specified class schedule
     */
    public function cancel(Request $request, ClassSchedule $classSchedule): RedirectResponse
    {
        if (!$classSchedule->canBeCancelled()) {
            return back()->with('error', 'This class cannot be cancelled.');
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $classSchedule->cancel($validated['cancellation_reason'], Auth::user());

            // Notify student of cancellation
            $this->notificationService->createScheduleNotification($classSchedule, 'cancelled');

            DB::commit();

            return back()->with('success', 'Class cancelled successfully. Student has been notified.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to cancel class: ' . $e->getMessage()]);
        }
    }

    /**
     * Mark class as completed
     */
    public function complete(Request $request, ClassSchedule $classSchedule): RedirectResponse
    {
        if (!$classSchedule->isUpcoming() && !$classSchedule->isConfirmed()) {
            return back()->with('error', 'Only scheduled or confirmed classes can be marked as completed.');
        }

        $validated = $request->validate([
            'session_notes' => 'nullable|string',
            'session_data' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            $classSchedule->complete(
                $validated['session_notes'] ?? null,
                $validated['session_data'] ?? null
            );

            // Create completion notification
            $this->notificationService->createScheduleNotification($classSchedule, 'completed');

            DB::commit();

            return back()->with('success', 'Class marked as completed.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to complete class: ' . $e->getMessage()]);
        }
    }

    /**
     * Get lessons for a specific program (AJAX endpoint)
     */
    public function getLessonsForProgram(Program $program)
    {
        $lessons = $program->lessons()
            ->where('is_active', true)
            ->orderBy('level')
            ->orderBy('order_in_level')
            ->get(['id', 'title', 'level', 'order_in_level']);

        return response()->json($lessons);
    }

    /**
     * Get students enrolled in a specific program (AJAX endpoint)
     */
    public function getStudentsForProgram(Program $program)
    {
        $students = User::role('student')
            ->whereHas('enrollments', function ($query) use ($program) {
                $query->where('program_id', $program->id)
                      ->where('approval_status', 'approved')
                      ->where('status', 'active');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json($students);
    }

    /**
     * Check for scheduling conflicts (AJAX endpoint)
     */
    public function checkConflicts(Request $request)
    {
        $request->validate([
            'admin_id' => 'required|exists:users,id',
            'scheduled_at' => 'required|date',
            'duration_minutes' => 'required|integer|min:15',
            'exclude_id' => 'nullable|exists:class_schedules,id',
        ]);

        $scheduledAt = \Carbon\Carbon::parse($request->scheduled_at);
        $conflicts = ClassSchedule::getConflicts(
            $request->admin_id, 
            $scheduledAt, 
            $request->duration_minutes, 
            $request->exclude_id
        );

        return response()->json([
            'has_conflicts' => $conflicts->isNotEmpty(),
            'conflicts' => $conflicts->map(function ($schedule) {
                $students = $schedule->is_group_class 
                    ? $schedule->students->pluck('name')->join(', ')
                    : ($schedule->student ? $schedule->student->name : 'No student assigned');
                
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,
                    'students' => $students,
                    'is_group_class' => $schedule->is_group_class,
                    'student_count' => $schedule->getStudentCount(),
                    'scheduled_at' => $schedule->getFormattedScheduledTime(),
                    'duration' => $schedule->getFormattedDuration(),
                    'status' => $schedule->status,
                    'type' => $schedule->getTypeLabel(),
                ];
            }),
            'message' => $conflicts->isNotEmpty() 
                ? 'You are busy during this time. Please choose a different time slot.'
                : 'No conflicts found for this time slot.',
        ]);
    }
}