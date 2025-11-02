<?php

namespace App\Http\Controllers\Mentor;

use App\Constants\ProposalType;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\Program;
use App\Services\ProposalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
     * Show form to propose a new resource
     */
    public function createResource(Lesson $lesson): Response
    {
        return Inertia::render('Mentor/Proposals/CreateResource', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'level' => $lesson->level,
                'program' => [
                    'id' => $lesson->program->id,
                    'name' => $lesson->program->name,
                ],
            ],
        ]);
    }

    /**
     * Store a resource proposal
     */
    public function storeResource(Request $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validate([
            'proposed_title' => 'required|string|max:255',
            'proposed_description' => 'nullable|string',
            'proposed_resource_type' => 'required|string|in:youtube,pdf,word,other',
            'proposed_youtube_url' => 'nullable|url',
            'proposed_order' => 'nullable|integer',
            'mentor_notes' => 'nullable|string',
        ]);

        $data = array_merge($validated, [
            'lesson_id' => $lesson->id,
            'program_id' => $lesson->program_id,
            'proposal_type' => ProposalType::RESOURCE_CREATE,
        ]);

        $this->proposalService->createResourceProposal(Auth::user(), $data);

        return redirect()->route('mentor.proposals.index')
            ->with('success', 'Resource proposal submitted successfully. Waiting for admin approval.');
    }

    /**
     * Show form to propose resource update
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
     * Store a resource update proposal
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
     * Propose deletion of a resource
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
        // Get existing levels in the program
        $existingLevels = \App\Models\Lesson::where('program_id', $program->id)
            ->distinct('level')
            ->orderBy('level')
            ->pluck('level');

        return Inertia::render('Mentor/Proposals/CreateLesson', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
            ],
            'existingLevels' => $existingLevels,
        ]);
    }

    /**
     * Store a lesson proposal
     */
    public function storeLesson(Request $request, Program $program): RedirectResponse
    {
        $validated = $request->validate([
            'proposed_lesson_title' => 'required|string|max:255',
            'proposed_lesson_description' => 'nullable|string',
            'proposed_lesson_level' => 'required|integer|min:1',
            'proposed_lesson_order' => 'nullable|integer',
            'mentor_notes' => 'nullable|string',
        ]);

        $data = array_merge($validated, [
            'program_id' => $program->id,
            'proposal_type' => ProposalType::LESSON_CREATE,
        ]);

        $this->proposalService->createLessonProposal(Auth::user(), $data);

        return redirect()->route('mentor.proposals.index')
            ->with('success', 'Lesson proposal submitted successfully.');
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
}
