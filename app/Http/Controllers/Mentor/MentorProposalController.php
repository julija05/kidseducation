<?php

namespace App\Http\Controllers\Mentor;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentType;
use App\Constants\ProposalType;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\Program;
use App\Services\ProposalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * MentorProposalController
 * Handles mentor proposal submissions for resources, lessons, and levels
 */
class MentorProposalController extends Controller
{
    public function __construct(
        private ProposalService $proposalService
    ) {}

    /**
     * Display mentor's proposals dashboard
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Get all proposals by this mentor
        $proposals = $this->proposalService->getMentorProposals($user)
            ->map(fn ($proposal) => $this->proposalService->formatProposalForFrontend($proposal));

        return Inertia::render('Mentor/Proposals/Index', [
            'proposals' => $proposals,
        ]);
    }

    /**
     * Show form to create a new resource
     */
    public function createResource(Lesson $lesson): Response
    {
        $user = Auth::user();

        // Load program relationship
        $lesson->load('program');

        if (! $this->canCreateDirectContent($lesson->program, $user) && ! $this->canProposeProgramChanges($lesson->program, $user)) {
            abort(403, 'Unauthorized action.');
        }

        $isDirectContentEdit = $this->canCreateDirectContent($lesson->program, $user);

        return Inertia::render('Mentor/Proposals/CreateResource', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'level' => $lesson->level,
                'program' => [
                    'id' => $lesson->program->id,
                    'name' => $lesson->program->name,
                    'slug' => $lesson->program->slug,
                ],
            ],
            'mode' => $isDirectContentEdit ? 'direct' : 'proposal',
            'backRoute' => $isDirectContentEdit
                ? route('mentor.programs.content', $lesson->program->slug)
                : route('mentor.programs.show', $lesson->program->slug),
        ]);
    }

    /**
     * Store a resource (direct creation for programs in content development)
     */
    public function storeResource(Request $request, Lesson $lesson): RedirectResponse
    {
        $user = Auth::user();
        $lesson->load('program');

        if (! $this->canCreateDirectContent($lesson->program, $user) && ! $this->canProposeProgramChanges($lesson->program, $user)) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'proposed_title' => 'required|string|max:255',
            'proposed_description' => 'nullable|string',
            'proposed_resource_type' => 'required|string|in:youtube,pdf,word,document,other',
            'proposed_youtube_url' => 'nullable|url',
            'proposed_order' => 'nullable|integer',
            'file' => 'nullable|file|max:51200', // 50MB max
            'mentor_notes' => 'nullable|string',
        ]);

        if ($this->canCreateDirectContent($lesson->program, $user)) {
            // Create the resource directly
            $resourceData = [
                'lesson_id' => $lesson->id,
                'title' => $validated['proposed_title'],
                'description' => $validated['proposed_description'] ?? '',
                'type' => $validated['proposed_resource_type'],
                'order' => $validated['proposed_order'] ?? 1,
                'is_downloadable' => true,
                'is_required' => false,
            ];

            // Handle YouTube URL
            if ($validated['proposed_resource_type'] === 'youtube' && isset($validated['proposed_youtube_url'])) {
                $resourceData['resource_url'] = $validated['proposed_youtube_url'];
            }

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $path = $file->store('lesson-resources/' . $lesson->id, 'private');

                $resourceData['file_path'] = $path;
                $resourceData['file_name'] = $file->getClientOriginalName();
                $resourceData['file_size'] = $file->getSize();
                $resourceData['mime_type'] = $file->getMimeType();
            }

            LessonResource::create($resourceData);

            return redirect()->route('mentor.programs.content', $lesson->program->slug)
                ->with('success', 'Resource added successfully!');
        }

        $proposalData = array_merge($validated, [
            'lesson_id' => $lesson->id,
            'program_id' => $lesson->program_id,
            'proposal_type' => ProposalType::RESOURCE_CREATE,
        ]);

        if ($request->hasFile('file')) {
            $proposalData['proposed_file_path'] = $request->file('file')
                ->store('resource-proposals/' . $lesson->id, 'private');
        }

        $this->proposalService->createResourceProposal($user, $proposalData);

        return redirect()->route('mentor.programs.show', $lesson->program->slug)
            ->with('success', 'Resource proposal submitted for admin review.');
    }

    /**
     * Show form to edit a resource (for mentor-owned programs in content development)
     */
    public function editResourceDirect(LessonResource $resource): Response
    {
        $user = Auth::user();
        $resource->load('lesson.program');

        // Check if the mentor owns this program
        if ($resource->lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Check if program is in content development stage
        if (!$resource->lesson->program->canAddContent()) {
            abort(403, 'You can only edit resources in programs that are in content development.');
        }

        return Inertia::render('Mentor/Proposals/EditResourceDirect', [
            'resource' => [
                'id' => $resource->id,
                'title' => $resource->title,
                'description' => $resource->description,
                'type' => $resource->type,
                'resource_url' => $resource->resource_url,
                'file_path' => $resource->file_path,
                'file_name' => $resource->file_name,
                'order' => $resource->order,
            ],
            'lesson' => [
                'id' => $resource->lesson->id,
                'title' => $resource->lesson->title,
            ],
            'program' => [
                'id' => $resource->lesson->program->id,
                'name' => $resource->lesson->program->name,
                'slug' => $resource->lesson->program->slug,
            ],
        ]);
    }

    /**
     * Update a resource directly (for mentor-owned programs in content development)
     */
    public function updateResourceDirect(Request $request, LessonResource $resource): RedirectResponse
    {
        $user = Auth::user();
        $resource->load('lesson.program');

        // Check if the mentor owns this program
        if ($resource->lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Check if program is in content development stage
        if (!$resource->lesson->program->canAddContent()) {
            return back()->with('error', 'You can only edit resources in programs that are in content development.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:youtube,pdf,word,document,other',
            'resource_url' => 'nullable|url',
            'order' => 'nullable|integer',
            'file' => 'nullable|file|max:51200', // 50MB max
        ]);

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'type' => $validated['type'],
            'order' => $validated['order'] ?? $resource->order,
        ];

        // Handle YouTube URL
        if ($validated['type'] === 'youtube' && isset($validated['resource_url'])) {
            $updateData['resource_url'] = $validated['resource_url'];
        }

        // Handle file upload (replace existing file)
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($resource->file_path) {
                \Illuminate\Support\Facades\Storage::disk('private')->delete($resource->file_path);
            }

            $file = $request->file('file');
            $path = $file->store('lesson-resources/' . $resource->lesson_id, 'private');

            $updateData['file_path'] = $path;
            $updateData['file_name'] = $file->getClientOriginalName();
            $updateData['file_size'] = $file->getSize();
            $updateData['mime_type'] = $file->getMimeType();
        }

        $resource->update($updateData);

        return redirect()->route('mentor.programs.content', $resource->lesson->program->slug)
            ->with('success', 'Resource updated successfully!');
    }

    /**
     * Delete a resource directly (for mentor-owned programs in content development)
     */
    public function destroyResourceDirect(LessonResource $resource): RedirectResponse
    {
        $user = Auth::user();
        $resource->load('lesson.program');

        // Check if the mentor owns this program
        if ($resource->lesson->program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Check if program is in content development stage
        if (!$resource->lesson->program->canAddContent()) {
            return back()->with('error', 'You can only delete resources in programs that are in content development.');
        }

        $programSlug = $resource->lesson->program->slug;

        // Delete file if exists
        if ($resource->file_path) {
            \Illuminate\Support\Facades\Storage::disk('private')->delete($resource->file_path);
        }

        $resource->delete();

        return redirect()->route('mentor.programs.content', $programSlug)
            ->with('success', 'Resource deleted successfully!');
    }

    /**
     * Show form to propose resource update (for approved programs)
     */
    public function editResource(LessonResource $resource): Response
    {
        return Inertia::render('Mentor/Proposals/EditResource', [
            'resource' => [
                'id' => $resource->id,
                'title' => $resource->title,
                'description' => $resource->description,
                'resource_type' => $resource->resource_type,
                'youtube_url' => $resource->youtube_url,
                'order' => $resource->order,
                'lesson' => [
                    'id' => $resource->lesson->id,
                    'title' => $resource->lesson->title,
                    'program_id' => $resource->lesson->program_id,
                ],
            ],
        ]);
    }

    /**
     * Store a resource update proposal (for approved programs)
     */
    public function updateResource(Request $request, LessonResource $resource): RedirectResponse
    {
        $validated = $request->validate([
            'proposed_title' => 'nullable|string|max:255',
            'proposed_description' => 'nullable|string',
            'proposed_resource_type' => 'nullable|string|in:youtube,pdf,word,other',
            'proposed_youtube_url' => 'nullable|url',
            'proposed_order' => 'nullable|integer',
            'mentor_notes' => 'nullable|string',
        ]);

        $data = array_merge($validated, [
            'lesson_id' => $resource->lesson_id,
            'program_id' => $resource->lesson->program_id,
            'lesson_resource_id' => $resource->id,
            'proposal_type' => ProposalType::RESOURCE_UPDATE,
            'original_data' => [
                'title' => $resource->title,
                'description' => $resource->description,
                'resource_type' => $resource->resource_type,
            ],
        ]);

        $this->proposalService->createResourceProposal(Auth::user(), $data);

        return redirect()->route('mentor.proposals.index')
            ->with('success', 'Resource update proposal submitted successfully.');
    }

    /**
     * Propose deletion of a resource (for approved programs)
     */
    public function deleteResource(Request $request, LessonResource $resource): RedirectResponse
    {
        $data = [
            'lesson_id' => $resource->lesson_id,
            'program_id' => $resource->lesson->program_id,
            'lesson_resource_id' => $resource->id,
            'proposal_type' => ProposalType::RESOURCE_DELETE,
            'mentor_notes' => $request->input('mentor_notes'),
            'original_data' => [
                'title' => $resource->title,
                'description' => $resource->description,
            ],
        ];

        $this->proposalService->createResourceProposal(Auth::user(), $data);

        return redirect()->route('mentor.proposals.index')
            ->with('success', 'Resource deletion proposal submitted successfully.');
    }

    /**
     * Show form to propose a new lesson
     */
    public function createLesson(Program $program): Response
    {
        $user = Auth::user();

        if (! $this->canCreateDirectContent($program, $user) && ! $this->canProposeProgramChanges($program, $user)) {
            abort(403, 'Unauthorized action.');
        }

        // Get existing levels in the program
        $existingLevels = \App\Models\Lesson::where('program_id', $program->id)
            ->distinct('level')
            ->orderBy('level')
            ->pluck('level');

        $isDirectContentEdit = $this->canCreateDirectContent($program, $user);

        return Inertia::render('Mentor/Proposals/CreateLesson', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'slug' => $program->slug,
            ],
            'existingLevels' => $existingLevels,
            'mode' => $isDirectContentEdit ? 'direct' : 'proposal',
            'backRoute' => $isDirectContentEdit
                ? route('mentor.programs.content', $program->slug)
                : route('mentor.programs.show', $program->slug),
        ]);
    }

    /**
     * Store a lesson (direct creation for programs in content development)
     */
    public function storeLesson(Request $request, Program $program): RedirectResponse
    {
        $user = Auth::user();

        if (! $this->canCreateDirectContent($program, $user) && ! $this->canProposeProgramChanges($program, $user)) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'proposed_lesson_title' => 'required|string|max:255',
            'proposed_lesson_description' => 'nullable|string',
            'proposed_lesson_level' => 'required|integer|min:1',
            'proposed_lesson_order' => 'nullable|integer',
            'mentor_notes' => 'nullable|string',
        ]);

        if ($this->canCreateDirectContent($program, $user)) {
            // Create the lesson directly
            Lesson::create([
                'program_id' => $program->id,
                'title' => $validated['proposed_lesson_title'],
                'description' => $validated['proposed_lesson_description'] ?? '',
                'level' => $validated['proposed_lesson_level'],
                'order_in_level' => $validated['proposed_lesson_order'] ?? 1,
            ]);

            return redirect()->route('mentor.programs.content', $program->slug)
                ->with('success', 'Lesson added successfully!');
        }

        $this->proposalService->createLessonProposal($user, array_merge($validated, [
            'program_id' => $program->id,
            'proposal_type' => ProposalType::LESSON_CREATE,
        ]));

        return redirect()->route('mentor.programs.show', $program->slug)
            ->with('success', 'Lesson proposal submitted for admin review.');
    }

    /**
     * Show form to propose lesson update
     */
    public function editLesson(Lesson $lesson): Response
    {
        return Inertia::render('Mentor/Proposals/EditLesson', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'level' => $lesson->level,
                'order' => $lesson->order,
                'program_id' => $lesson->program_id,
            ],
        ]);
    }

    /**
     * Store a lesson update proposal
     */
    public function updateLesson(Request $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validate([
            'proposed_lesson_title' => 'nullable|string|max:255',
            'proposed_lesson_description' => 'nullable|string',
            'proposed_lesson_level' => 'nullable|integer|min:1',
            'proposed_lesson_order' => 'nullable|integer',
            'mentor_notes' => 'nullable|string',
        ]);

        $data = array_merge($validated, [
            'program_id' => $lesson->program_id,
            'lesson_id' => $lesson->id,
            'proposal_type' => ProposalType::LESSON_UPDATE,
            'original_data' => [
                'title' => $lesson->title,
                'description' => $lesson->description,
                'level' => $lesson->level,
            ],
        ]);

        $this->proposalService->createLessonProposal(Auth::user(), $data);

        return redirect()->route('mentor.proposals.index')
            ->with('success', 'Lesson update proposal submitted successfully.');
    }

    /**
     * Show form to propose a new level
     */
    public function createLevel(Program $program): Response
    {
        // Get highest existing level
        $highestLevel = \App\Models\Lesson::where('program_id', $program->id)
            ->max('level') ?? 0;

        return Inertia::render('Mentor/Proposals/CreateLevel', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
            ],
            'suggestedLevel' => $highestLevel + 1,
        ]);
    }

    /**
     * Store a level proposal
     */
    public function storeLevel(Request $request, Program $program): RedirectResponse
    {
        $validated = $request->validate([
            'proposed_level_number' => 'required|integer|min:1',
            'proposed_level_description' => 'nullable|string',
            'mentor_notes' => 'nullable|string',
        ]);

        $data = array_merge($validated, [
            'program_id' => $program->id,
            'proposal_type' => ProposalType::LEVEL_CREATE,
        ]);

        $this->proposalService->createLevelProposal(Auth::user(), $data);

        return redirect()->route('mentor.proposals.index')
            ->with('success', 'Level proposal submitted successfully.');
    }

    /**
     * Show form to propose a new program
     */
    public function createProgram(): Response
    {
        return Inertia::render('Mentor/Proposals/CreateProgram');
    }

    /**
     * Store a program proposal
     * Creates program in PENDING_INITIAL_REVIEW status - admin must approve before mentor can add content
     */
    public function storeProgram(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'requires_monthly_payment' => 'boolean',
            'duration_weeks' => 'nullable|integer|min:1',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'light_color' => 'nullable|string|max:50',
            'border_color' => 'nullable|string|max:50',
            'text_color' => 'nullable|string|max:50',
        ]);

        // Generate unique slug
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;
        while (Program::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Create the program in PENDING_INITIAL_REVIEW status
        // Admin must approve before mentor can add lessons/resources
        $program = Program::create(array_merge($validated, [
            'slug' => $slug,
            'approval_status' => ApprovalStatus::PENDING_INITIAL_REVIEW,
            'proposed_by' => Auth::id(),
            'is_active' => false, // Inactive until fully approved
        ]));

        return redirect()->route('mentor.proposals.programs.my-programs')
            ->with('success', 'Program proposal submitted! An administrator will review your proposal. Once approved, you can start adding lessons and resources.');
    }

    /**
     * Show mentor's own proposed programs
     */
    public function myPrograms(): Response
    {
        $user = Auth::user();

        // Get programs proposed by this mentor
        $programs = Program::where('proposed_by', $user->id)
            ->with(['proposedBy', 'approvedBy', 'lessons'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'description' => $program->description,
                    'slug' => $program->slug,
                    'price' => $program->price,
                    'duration' => $program->duration,
                    'approval_status' => $program->approval_status,
                    'approval_status_label' => ApprovalStatus::getLabel($program->approval_status),
                    'approval_status_color' => ApprovalStatus::getColorClass($program->approval_status),
                    'is_active' => $program->is_active,
                    'lessons_count' => $program->lessons->count(),
                    'can_add_content' => $program->canAddContent(),
                    'can_submit_for_final_review' => $program->isInContentDevelopment() && $program->lessons->count() > 0,
                    'can_resubmit' => $program->isRejected(),
                    'is_pending_initial_review' => $program->isPendingInitialReview(),
                    'is_pending_final_review' => $program->isPendingFinalReview(),
                    'created_at' => $program->created_at->format('Y-m-d H:i:s'),
                    'approved_at' => $program->approved_at?->format('Y-m-d H:i:s'),
                    'rejected_at' => $program->rejected_at?->format('Y-m-d H:i:s'),
                    'rejection_reason' => $program->rejection_reason,
                    'approved_by' => $program->approvedBy ? [
                        'id' => $program->approvedBy->id,
                        'name' => $program->approvedBy->name,
                    ] : null,
                ];
            });

        return Inertia::render('Mentor/Proposals/MyPrograms', [
            'programs' => $programs,
        ]);
    }

    /**
     * Submit program for final admin review after content has been added
     * Changes status from CONTENT_DEVELOPMENT to PENDING_FINAL_REVIEW
     */
    public function submitForFinalReview(Program $program): RedirectResponse
    {
        $user = Auth::user();

        // Check if the mentor owns this program
        if ($program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Check if program is in content development stage
        if (!$program->isInContentDevelopment()) {
            return back()->with('error', 'Program must be in content development stage to submit for review.');
        }

        // Check if program has at least one lesson
        if ($program->lessons()->count() === 0) {
            return back()->with('error', 'Program must have at least one lesson before submitting for review.');
        }

        // Update program status to pending final review
        $program->update([
            'approval_status' => ApprovalStatus::PENDING_FINAL_REVIEW,
        ]);

        return back()->with('success', 'Program submitted for final review! An administrator will review your complete program and content soon.');
    }

    /**
     * Resubmit a rejected program for review
     * Mentor can resubmit after making improvements based on rejection feedback
     */
    public function resubmitProgram(Program $program): RedirectResponse
    {
        $user = Auth::user();

        // Check if the mentor owns this program
        if ($program->proposed_by !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Check if program is rejected
        if (!$program->isRejected()) {
            return back()->with('error', 'Only rejected programs can be resubmitted.');
        }

        // Determine which review stage to resubmit to
        // If program has lessons, submit for final review; otherwise, submit for initial review
        $hasLessons = $program->lessons()->count() > 0;
        $newStatus = $hasLessons
            ? ApprovalStatus::PENDING_FINAL_REVIEW
            : ApprovalStatus::PENDING_INITIAL_REVIEW;

        $program->update([
            'approval_status' => $newStatus,
            'rejected_at' => null,
            'rejection_reason' => null,
        ]);

        $message = $hasLessons
            ? 'Program resubmitted for final review! An administrator will review your improvements soon.'
            : 'Program resubmitted for initial review! An administrator will review your proposal soon.';

        return back()->with('success', $message);
    }

    private function canCreateDirectContent(Program $program, $user): bool
    {
        return $program->proposed_by === $user->id && $program->canAddContent();
    }

    private function canProposeProgramChanges(Program $program, $user): bool
    {
        return $user->enrollments()
            ->where('program_id', $program->id)
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->exists();
    }
}
