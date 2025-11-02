<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
}
