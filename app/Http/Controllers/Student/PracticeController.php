<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\PracticeResource;
use App\Services\EnrollmentService;
use Illuminate\Support\Facades\Auth;

class PracticeController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService
    ) {}

    /**
     * Display the student's Practice page: the Mental Accelerator launcher (when
     * the program includes it) and any practice resources their mentor has
     * shared with the learning groups they belong to.
     */
    public function index()
    {
        $user = Auth::user();

        // Suspended accounts should not reach practice/program content.
        if ($user->isSuspended()) {
            return redirect()->route('dashboard')
                ->with('error', 'Your account is suspended. Please contact admin@abacoding.com to resolve this issue.');
        }

        // Find the student's active/completed approved enrollment (mirrors the dashboard).
        $enrollment = $user->enrollments()
            ->with('program')
            ->whereIn('status', ['active', 'completed'])
            ->where('approval_status', 'approved')
            ->where('access_blocked', false)
            ->orderByRaw("CASE status WHEN 'active' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END")
            ->first();

        // Without an approved enrollment there is nothing to practice yet.
        if (! $enrollment || ! $enrollment->program) {
            return redirect()->route('dashboard')
                ->with('error', 'Enroll in a program to access practice.');
        }

        $enrolledProgram = $this->enrollmentService->formatEnrollmentForDashboard($enrollment);

        return $this->createView('Dashboard/Practice/Index', [
            'enrolledProgram' => $enrolledProgram,
            'practiceResources' => $this->practiceResourcesForStudent($user, $enrollment->program_id),
        ]);
    }

    /**
     * Gather active practice resources from every learning group the student
     * belongs to for the given program.
     *
     * @return array<int, array<string, mixed>>
     */
    private function practiceResourcesForStudent($user, int $programId): array
    {
        // Learning group ids the student belongs to for this program.
        $groupIds = $user->learningGroups()
            ->where('learning_groups.program_id', $programId)
            ->pluck('learning_groups.id');

        if ($groupIds->isEmpty()) {
            return [];
        }

        return PracticeResource::query()
            ->active()
            ->whereIn('learning_group_id', $groupIds)
            ->with('creator:id,name')
            ->latest()
            ->get()
            ->map(fn (PracticeResource $resource) => [
                'id' => $resource->id,
                'title' => $resource->title,
                'message' => $resource->message,
                'file_name' => $resource->file_name,
                'has_file' => $resource->hasFile(),
                'is_pdf' => $resource->isPdf(),
                'download_url' => $resource->hasFile()
                    ? route('practice-resources.download', $resource->id)
                    : null,
                'mentor_name' => $resource->creator?->name,
                'created_at' => $resource->created_at->format('M d, Y'),
            ])
            ->all();
    }
}
