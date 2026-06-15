<?php

namespace App\Http\Controllers\Admin;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Http\Controllers\Controller;
use App\Models\ChildProfile;
use App\Models\ClassSchedule;
use App\Models\Enrollment;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminChildProfileController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ChildProfile::query()
            ->with(['parent:id,name,email', 'child:id,name,username', 'program:id,name,slug', 'enrollment:id,approval_status,status'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('child_name', 'like', "%{$search}%")
                    ->orWhere('grade_class', 'like', "%{$search}%")
                    ->orWhereHas('parent', function ($parentQuery) use ($search) {
                        $parentQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        return Inertia::render('Admin/ChildProfiles/Index', [
            'childProfiles' => $query->paginate(20)->appends($request->query()),
            'filters' => $request->only(['search', 'status']),
            'statuses' => ChildProfile::STATUSES,
        ]);
    }

    public function show(ChildProfile $childProfile): Response
    {
        $childProfile->load([
            'parent:id,name,email,first_name,last_name',
            'child:id,name,email,username,status',
            'program:id,name,slug',
            'enrollment:id,user_id,program_id,approval_status,status,rejection_reason,progress',
        ]);

        return Inertia::render('Admin/ChildProfiles/Show', [
            'childProfile' => $childProfile,
            'programOptions' => $this->programOptions(),
            'groupOptions' => $this->groupOptions(),
        ]);
    }

    public function approve(Request $request, ChildProfile $childProfile): RedirectResponse
    {
        if ($childProfile->status !== ChildProfile::STATUS_PENDING) {
            return back()->with('error', 'This child application has already been processed.');
        }

        $validated = $request->validate([
            'program_id' => [
                'required',
                Rule::exists('programs', 'id')->where(fn ($query) => $query
                    ->where('is_active', true)
                    ->where('approval_status', ApprovalStatus::APPROVED)
                ),
            ],
            'group_schedule_id' => ['nullable', 'integer', 'exists:class_schedules,id'],
        ]);

        $childProfile->load(['child', 'enrollment', 'parent']);

        if (! $childProfile->child) {
            return back()->with('error', 'This application is missing a linked child learner account.');
        }

        $group = null;
        if (! empty($validated['group_schedule_id'])) {
            $group = ClassSchedule::withCount('students')
                ->whereKey($validated['group_schedule_id'])
                ->where('is_group_class', true)
                ->where('scheduled_at', '>', now())
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->first();

            if (! $group) {
                return back()->withErrors(['group_schedule_id' => 'Select an available upcoming group class.']);
            }

            if ((int) $group->program_id !== (int) $validated['program_id']) {
                return back()->withErrors(['group_schedule_id' => 'The selected group must belong to the assigned program.']);
            }

            $alreadyAssigned = $group->students()
                ->where('users.id', $childProfile->child->id)
                ->exists();

            if (! $alreadyAssigned && $group->students_count >= $group->max_students) {
                return back()->withErrors(['group_schedule_id' => 'The selected group is already full.']);
            }
        }

        DB::transaction(function () use ($childProfile, $validated, $group) {
            $child = $childProfile->child;
            $enrollment = $childProfile->enrollment;

            if (! $enrollment) {
                $enrollment = Enrollment::where('user_id', $child->id)
                    ->where('program_id', $validated['program_id'])
                    ->where('enrollment_type', EnrollmentType::STUDENT)
                    ->latest()
                    ->first() ?: new Enrollment([
                        'user_id' => $child->id,
                        'enrollment_type' => EnrollmentType::STUDENT,
                        'enrolled_at' => now(),
                        'progress' => 0,
                    ]);
            }

            $enrollment->fill([
                'user_id' => $child->id,
                'program_id' => $validated['program_id'],
                'enrollment_type' => EnrollmentType::STUDENT,
                'enrolled_at' => $enrollment->enrolled_at ?: now(),
                'approval_status' => ApprovalStatus::APPROVED,
                'status' => EnrollmentStatus::ACTIVE,
                'rejection_reason' => null,
                'approved_at' => now(),
                'approved_by' => auth()->id(),
                'rejected_at' => null,
                'rejected_by' => null,
            ]);
            $enrollment->save();

            $childProfile->update([
                'program_id' => $validated['program_id'],
                'enrollment_id' => $enrollment->id,
                'status' => ChildProfile::STATUS_APPROVED,
            ]);

            $childProfile->parent?->children()->syncWithoutDetaching([$child->id]);

            if ($group) {
                $group->students()->syncWithoutDetaching([$child->id]);
            }
        });

        return back()->with('success', 'Child application approved successfully.');
    }

    public function reject(Request $request, ChildProfile $childProfile): RedirectResponse
    {
        if ($childProfile->status !== ChildProfile::STATUS_PENDING) {
            return back()->with('error', 'This child application has already been processed.');
        }

        $validated = $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:500'],
        ]);

        $childProfile->load('enrollment');

        DB::transaction(function () use ($childProfile, $validated) {
            if ($childProfile->enrollment) {
                $childProfile->enrollment->update([
                    'approval_status' => ApprovalStatus::REJECTED,
                    'status' => EnrollmentStatus::CANCELLED,
                    'rejection_reason' => $validated['rejection_reason'] ?? null,
                    'rejected_at' => now(),
                    'rejected_by' => auth()->id(),
                ]);
            }

            $childProfile->update([
                'status' => ChildProfile::STATUS_REJECTED,
            ]);
        });

        return back()->with('success', 'Child application rejected.');
    }

    private function programOptions()
    {
        return Program::query()
            ->where('is_active', true)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);
    }

    private function groupOptions()
    {
        return ClassSchedule::with(['program:id,name,slug'])
            ->withCount('students')
            ->where('is_group_class', true)
            ->where('scheduled_at', '>', now())
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('scheduled_at')
            ->get()
            ->filter(fn (ClassSchedule $schedule) => $schedule->students_count < $schedule->max_students)
            ->map(fn (ClassSchedule $schedule) => [
                'id' => $schedule->id,
                'title' => $schedule->title,
                'program_id' => $schedule->program_id,
                'program_name' => $schedule->program?->name,
                'scheduled_at' => $schedule->scheduled_at,
                'formatted_time' => $schedule->getFormattedScheduledTime(),
                'students_count' => $schedule->students_count,
                'max_students' => $schedule->max_students,
            ])
            ->values();
    }
}
