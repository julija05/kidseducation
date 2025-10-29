<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ResourceProposal;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ResourceProposalController extends Controller
{
    /**
     * Display all resource proposals
     */
    public function index(Request $request): Response
    {
        $query = ResourceProposal::with([
            'lesson:id,title,program_id',
            'lesson.program:id,name,slug',
            'lessonResource:id,title',
            'proposedBy:id,name,email',
            'reviewedBy:id,name',
        ])->latest();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by proposal type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('proposal_type', $request->type);
        }

        $proposals = $query->paginate(20);

        // Get counts for stats
        $stats = [
            'total' => ResourceProposal::count(),
            'pending' => ResourceProposal::where('status', 'pending')->count(),
            'approved' => ResourceProposal::where('status', 'approved')->count(),
            'rejected' => ResourceProposal::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/ResourceProposals/Index', [
            'proposals' => $proposals,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status ?? 'pending',
                'type' => $request->type ?? 'all',
            ],
        ]);
    }

    /**
     * Show a specific proposal
     */
    public function show(ResourceProposal $proposal): Response
    {
        $proposal->load([
            'lesson:id,title,program_id,description',
            'lesson.program:id,name,slug',
            'lessonResource',
            'proposedBy:id,name,email',
            'reviewedBy:id,name',
        ]);

        // Add comparison data for easier viewing
        $comparisonData = null;
        if ($proposal->proposal_type === 'update' && $proposal->lessonResource) {
            $comparisonData = [
                'original' => [
                    'title' => $proposal->lessonResource->title,
                    'description' => $proposal->lessonResource->description,
                    'resource_type' => $proposal->lessonResource->resource_type,
                    'youtube_url' => $proposal->lessonResource->youtube_url,
                    'file_path' => $proposal->lessonResource->file_path,
                ],
                'proposed' => [
                    'title' => $proposal->proposed_title ?? $proposal->lessonResource->title,
                    'description' => $proposal->proposed_description ?? $proposal->lessonResource->description,
                    'resource_type' => $proposal->proposed_resource_type ?? $proposal->lessonResource->resource_type,
                    'youtube_url' => $proposal->proposed_youtube_url ?? $proposal->lessonResource->youtube_url,
                    'file_path' => $proposal->proposed_file_path ?? $proposal->lessonResource->file_path,
                ],
            ];
        }

        return Inertia::render('Admin/ResourceProposals/Show', [
            'proposal' => $proposal,
            'comparison' => $comparisonData,
        ]);
    }

    /**
     * Approve a proposal
     */
    public function approve(Request $request, ResourceProposal $proposal): RedirectResponse
    {
        if ($proposal->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending proposals can be approved.');
        }

        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $admin = auth()->user();
        $success = $proposal->approve($admin, $validated['admin_notes'] ?? null);

        if ($success) {
            return redirect()->back()->with('success', 'Proposal approved and changes applied successfully.');
        }

        return redirect()->back()->with('error', 'Failed to apply proposal changes. Please check the logs.');
    }

    /**
     * Reject a proposal
     */
    public function reject(Request $request, ResourceProposal $proposal): RedirectResponse
    {
        if ($proposal->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending proposals can be rejected.');
        }

        $validated = $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $admin = auth()->user();
        $success = $proposal->reject($admin, $validated['admin_notes']);

        if ($success) {
            return redirect()->back()->with('success', 'Proposal rejected successfully.');
        }

        return redirect()->back()->with('error', 'Failed to reject proposal.');
    }

    /**
     * Delete a proposal (admin can delete any proposal)
     */
    public function destroy(ResourceProposal $proposal): RedirectResponse
    {
        $proposal->delete();

        return redirect()->route('admin.resource-proposals.index')
            ->with('success', 'Proposal deleted successfully.');
    }

    /**
     * Preview the proposed resource
     */
    public function previewProposed(ResourceProposal $proposal)
    {
        // For YouTube videos, return JSON with URL
        if ($proposal->proposed_resource_type === 'youtube') {
            return response()->json([
                'type' => 'youtube',
                'url' => $proposal->proposed_youtube_url,
            ]);
        }

        // For file-based resources
        if ($proposal->proposed_file_path && \Storage::disk('private')->exists($proposal->proposed_file_path)) {
            $mimeType = \Storage::disk('private')->mimeType($proposal->proposed_file_path);

            // For PDFs, allow inline viewing
            if ($mimeType === 'application/pdf') {
                return response()->file(
                    \Storage::disk('private')->path($proposal->proposed_file_path),
                    ['Content-Type' => $mimeType]
                );
            }

            // For other files, force download
            return response()->download(
                \Storage::disk('private')->path($proposal->proposed_file_path),
                basename($proposal->proposed_file_path)
            );
        }

        abort(404, 'Proposed resource file not found.');
    }

    /**
     * Preview the original resource (for comparison)
     */
    public function previewOriginal(ResourceProposal $proposal)
    {
        if (!$proposal->lessonResource) {
            abort(404, 'No original resource to preview.');
        }

        $resource = $proposal->lessonResource;

        // For YouTube videos, return JSON with URL
        if ($resource->resource_type === 'youtube') {
            return response()->json([
                'type' => 'youtube',
                'url' => $resource->youtube_url,
            ]);
        }

        // For file-based resources
        if ($resource->file_path && \Storage::disk('private')->exists($resource->file_path)) {
            $mimeType = \Storage::disk('private')->mimeType($resource->file_path);

            // For PDFs, allow inline viewing
            if ($mimeType === 'application/pdf') {
                return response()->file(
                    \Storage::disk('private')->path($resource->file_path),
                    ['Content-Type' => $mimeType]
                );
            }

            // For other files, force download
            return response()->download(
                \Storage::disk('private')->path($resource->file_path),
                basename($resource->file_path)
            );
        }

        abort(404, 'Original resource file not found.');
    }
}
