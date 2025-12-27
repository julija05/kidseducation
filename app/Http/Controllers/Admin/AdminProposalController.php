<?php

namespace App\Http\Controllers\Admin;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\ResourceProposal;
use App\Services\ProposalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * AdminProposalController
 * Handles admin review and approval of mentor proposals
 */
class AdminProposalController extends Controller
{
    public function __construct(
        private ProposalService $proposalService
    ) {}

    /**
     * Display all pending proposals for review
     */
    public function index(): Response
    {
        // Get all pending proposals
        $pendingProposals = $this->proposalService->getPendingProposals()
            ->map(fn ($proposal) => $this->proposalService->formatProposalForFrontend($proposal));

        // Get recent reviewed proposals for reference
        $recentReviewed = \App\Models\ResourceProposal::with(['proposedBy', 'reviewedBy', 'program', 'lesson'])
            ->whereIn('status', \App\Constants\ProposalStatus::reviewedStatuses())
            ->orderBy('reviewed_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($proposal) => $this->proposalService->formatProposalForFrontend($proposal));

        return Inertia::render('Admin/Proposals/Index', [
            'pendingProposals' => $pendingProposals,
            'recentReviewed' => $recentReviewed,
        ]);
    }

    /**
     * Show detailed view of a proposal
     */
    public function show(ResourceProposal $proposal): Response
    {
        $proposal->load(['proposedBy', 'reviewedBy', 'program', 'lesson', 'lessonResource']);

        return Inertia::render('Admin/Proposals/Show', [
            'proposal' => $this->proposalService->formatProposalForFrontend($proposal),
        ]);
    }

    /**
     * Approve a proposal
     */
    public function approve(Request $request, ResourceProposal $proposal): RedirectResponse
    {
        $validated = $request->validate([
            'admin_notes' => 'nullable|string',
        ]);

        $success = $this->proposalService->approveProposal(
            $proposal,
            Auth::user(),
            $validated['admin_notes'] ?? null
        );

        if ($success) {
            return redirect()->route('admin.proposals.index')
                ->with('success', 'Proposal approved and changes applied successfully.');
        }

        return redirect()->back()
            ->with('error', 'Failed to approve proposal. Please try again.');
    }

    /**
     * Reject a proposal
     */
    public function reject(Request $request, ResourceProposal $proposal): RedirectResponse
    {
        $validated = $request->validate([
            'admin_notes' => 'required|string',
        ]);

        $success = $this->proposalService->rejectProposal(
            $proposal,
            Auth::user(),
            $validated['admin_notes']
        );

        if ($success) {
            return redirect()->route('admin.proposals.index')
                ->with('success', 'Proposal rejected.');
        }

        return redirect()->back()
            ->with('error', 'Failed to reject proposal. Please try again.');
    }

    /**
     * Display all pending program proposals for review
     */
    public function programProposals(): Response
    {
        // Get programs needing review (both initial and final review)
        $needingReview = Program::needingReview()
            ->with(['proposedBy', 'lessons'])
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
                    'duration_weeks' => $program->duration_weeks,
                    'requires_monthly_payment' => $program->requires_monthly_payment,
                    'icon' => $program->icon,
                    'color' => $program->color,
                    'approval_status' => $program->approval_status,
                    'approval_status_label' => ApprovalStatus::getLabel($program->approval_status),
                    'approval_status_color' => ApprovalStatus::getColorClass($program->approval_status),
                    'lessons_count' => $program->lessons->count(),
                    'is_initial_review' => $program->isPendingInitialReview(),
                    'is_final_review' => $program->isPendingFinalReview(),
                    'created_at' => $program->created_at->format('Y-m-d H:i:s'),
                    'proposed_by' => $program->proposedBy ? [
                        'id' => $program->proposedBy->id,
                        'name' => $program->proposedBy->name,
                        'email' => $program->proposedBy->email,
                    ] : null,
                ];
            });

        // Get programs in content development (for reference)
        $inDevelopment = Program::contentDevelopment()
            ->with(['proposedBy', 'lessons'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'approval_status' => $program->approval_status,
                    'approval_status_label' => ApprovalStatus::getLabel($program->approval_status),
                    'approval_status_color' => ApprovalStatus::getColorClass($program->approval_status),
                    'lessons_count' => $program->lessons->count(),
                    'updated_at' => $program->updated_at->format('Y-m-d H:i:s'),
                    'proposed_by' => $program->proposedBy ? [
                        'id' => $program->proposedBy->id,
                        'name' => $program->proposedBy->name,
                    ] : null,
                ];
            });

        // Get recently reviewed programs
        $recentReviewed = Program::whereIn('approval_status', [
                ApprovalStatus::APPROVED,
                ApprovalStatus::REJECTED,
                ApprovalStatus::CONTENT_DEVELOPMENT
            ])
            ->whereNotNull('proposed_by')
            ->with(['proposedBy', 'approvedBy'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'description' => $program->description,
                    'approval_status' => $program->approval_status,
                    'approval_status_label' => ApprovalStatus::getLabel($program->approval_status),
                    'approval_status_color' => ApprovalStatus::getColorClass($program->approval_status),
                    'approved_at' => $program->approved_at?->format('Y-m-d H:i:s'),
                    'rejected_at' => $program->rejected_at?->format('Y-m-d H:i:s'),
                    'rejection_reason' => $program->rejection_reason,
                    'proposed_by' => $program->proposedBy ? [
                        'id' => $program->proposedBy->id,
                        'name' => $program->proposedBy->name,
                    ] : null,
                    'approved_by' => $program->approvedBy ? [
                        'id' => $program->approvedBy->id,
                        'name' => $program->approvedBy->name,
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Proposals/ProgramProposals', [
            'needingReview' => $needingReview,
            'inDevelopment' => $inDevelopment,
            'recentReviewed' => $recentReviewed,
        ]);
    }

    /**
     * Approve a program proposal (handles both initial and final approval)
     * Initial approval: PENDING_INITIAL_REVIEW → CONTENT_DEVELOPMENT (mentor can build content)
     * Final approval: PENDING_FINAL_REVIEW → APPROVED (program goes public)
     */
    public function approveProgram(Request $request, Program $program): RedirectResponse
    {
        // Handle initial approval - allow mentor to start building content
        if ($program->isPendingInitialReview()) {
            $program->update([
                'approval_status' => ApprovalStatus::CONTENT_DEVELOPMENT,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'is_active' => false, // Not public yet
                'rejected_at' => null,
                'rejection_reason' => null,
            ]);

            return redirect()->route('admin.programs.proposals')
                ->with('success', 'Program proposal approved! The mentor can now add lessons and resources.');
        }

        // Handle final approval - make program public
        if ($program->isPendingFinalReview()) {
            $program->update([
                'approval_status' => ApprovalStatus::APPROVED,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'is_active' => true, // Activate the program for public enrollment
                'rejected_at' => null,
                'rejection_reason' => null,
            ]);

            // Automatically enroll the program creator as a mentor
            // so they can teach the program without needing to apply
            if ($program->proposed_by) {
                $this->createMentorEnrollmentForCreator($program);
            }

            return redirect()->route('admin.programs.proposals')
                ->with('success', 'Program fully approved and is now active for public enrollment!');
        }

        return redirect()->back()
            ->with('error', 'This program is not pending approval.');
    }

    /**
     * Preview a program's full content before approval
     * Shows all lessons, resources, and quizzes for admin review
     */
    public function previewProgram(Program $program): Response
    {
        // Load program with all content
        $program->load([
            'proposedBy',
            'lessons.resources',
            'lessons.quizzes.questions'
        ]);

        // Organize lessons by level
        $lessonsByLevel = $program->lessons->groupBy('level')->map(function ($lessons, $level) {
            return [
                'level' => $level,
                'lessons' => $lessons->map(function ($lesson) {
                    return [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'description' => $lesson->description,
                        'order_in_level' => $lesson->order_in_level,
                        'resources_count' => $lesson->resources->count(),
                        'quizzes_count' => $lesson->quizzes->count(),
                        'resources' => $lesson->resources->map(function ($resource) {
                            return [
                                'id' => $resource->id,
                                'title' => $resource->title,
                                'description' => $resource->description,
                                'type' => $resource->type,
                                'order' => $resource->order,
                                'resource_url' => $resource->resource_url,
                                'file_path' => $resource->file_path,
                                'file_name' => $resource->file_name,
                                'file_size' => $resource->file_size,
                                'mime_type' => $resource->mime_type,
                            ];
                        })->sortBy('order')->values(),
                        'quizzes' => $lesson->quizzes->map(function ($quiz) {
                            return [
                                'id' => $quiz->id,
                                'title' => $quiz->title,
                                'description' => $quiz->description,
                                'type' => $quiz->type,
                                'passing_score' => $quiz->passing_score,
                                'time_limit' => $quiz->time_limit,
                                'questions_count' => $quiz->questions->count(),
                                'is_active' => $quiz->is_active,
                                'questions' => $quiz->questions->map(function ($question) {
                                    return [
                                        'id' => $question->id,
                                        'question_text' => $question->question_text,
                                        'question_type' => $question->question_type,
                                        'options' => $question->options,
                                        'correct_answer' => $question->correct_answer,
                                        'points' => $question->points,
                                    ];
                                }),
                            ];
                        }),
                    ];
                })->sortBy('order_in_level')->values(),
            ];
        })->sortBy('level')->values();

        return Inertia::render('Admin/Proposals/ProgramPreview', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'slug' => $program->slug,
                'description' => $program->description,
                'price' => $program->price,
                'duration' => $program->duration,
                'duration_weeks' => $program->duration_weeks,
                'requires_monthly_payment' => $program->requires_monthly_payment,
                'icon' => $program->icon,
                'color' => $program->color,
                'approval_status' => $program->approval_status,
                'approval_status_label' => ApprovalStatus::getLabel($program->approval_status),
                'is_initial_review' => $program->isPendingInitialReview(),
                'is_final_review' => $program->isPendingFinalReview(),
                'proposed_by' => $program->proposedBy ? [
                    'id' => $program->proposedBy->id,
                    'name' => $program->proposedBy->name,
                    'email' => $program->proposedBy->email,
                ] : null,
            ],
            'lessonsByLevel' => $lessonsByLevel,
            'totalLessons' => $program->lessons->count(),
            'totalResources' => $program->lessons->sum(fn ($lesson) => $lesson->resources->count()),
            'totalQuizzes' => $program->lessons->sum(fn ($lesson) => $lesson->quizzes->count()),
            'totalQuestions' => $program->lessons->sum(fn ($lesson) =>
                $lesson->quizzes->sum(fn ($quiz) => $quiz->questions->count())
            ),
        ]);
    }

    /**
     * Reject a program proposal (can be rejected at any stage)
     */
    public function rejectProgram(Request $request, Program $program): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        // Can only reject if program needs review or is in development
        if ($program->isApproved() || $program->isRejected()) {
            return redirect()->back()
                ->with('error', 'This program cannot be rejected at this stage.');
        }

        // Reject the program
        $program->update([
            'approval_status' => ApprovalStatus::REJECTED,
            'approved_by' => Auth::id(),
            'rejected_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
            'is_active' => false,
            'approved_at' => null,
        ]);

        return redirect()->route('admin.programs.proposals')
            ->with('success', 'Program proposal rejected. Mentor will be notified.');
    }

    /**
     * Create a mentor enrollment for the program creator
     * This allows the mentor who created the program to teach it automatically
     * without needing to apply like other mentors would
     */
    private function createMentorEnrollmentForCreator(Program $program): void
    {
        // Check if mentor enrollment already exists for the creator
        $existingEnrollment = Enrollment::where('user_id', $program->proposed_by)
            ->where('program_id', $program->id)
            ->where('enrollment_type', EnrollmentType::MENTOR)
            ->first();

        if ($existingEnrollment) {
            // If enrollment exists but is not approved, approve it
            if ($existingEnrollment->approval_status !== ApprovalStatus::APPROVED) {
                $existingEnrollment->update([
                    'approval_status' => ApprovalStatus::APPROVED,
                    'approved_at' => now(),
                    'approved_by' => Auth::id(),
                    'status' => EnrollmentStatus::ACTIVE,
                ]);
            }
            return;
        }

        // Create new mentor enrollment for the program creator
        Enrollment::create([
            'user_id' => $program->proposed_by,
            'program_id' => $program->id,
            'enrollment_type' => EnrollmentType::MENTOR,
            'enrolled_at' => now(),
            'approval_status' => ApprovalStatus::APPROVED,
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'status' => EnrollmentStatus::ACTIVE,
            'progress' => 0,
            'quiz_points' => 0,
            'highest_unlocked_level' => 1,
        ]);
    }
}
