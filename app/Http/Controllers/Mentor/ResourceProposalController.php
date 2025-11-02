<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\ResourceProposal;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class ResourceProposalController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Store a proposal to create a new resource
     */
    public function proposeCreate(Request $request, Lesson $lesson): RedirectResponse
    {
        $user = auth()->user();

        // Verify mentor has access to this lesson's program
        $this->verifyMentorAccess($lesson);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'resource_type' => 'required|in:youtube,pdf,word,other',
            'youtube_url' => 'nullable|required_if:resource_type,youtube|url',
            'file' => 'nullable|required_if:resource_type,pdf,word,other|file|max:51200', // 50MB max
            'order' => 'nullable|integer|min:0',
            'mentor_notes' => 'nullable|string',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('lesson-resources', 'private');
        }

        ResourceProposal::create([
            'lesson_id' => $lesson->id,
            'proposed_by' => $user->id,
            'proposal_type' => 'create',
            'proposed_title' => $validated['title'],
            'proposed_description' => $validated['description'] ?? null,
            'proposed_resource_type' => $validated['resource_type'],
            'proposed_youtube_url' => $validated['youtube_url'] ?? null,
            'proposed_file_path' => $filePath,
            'proposed_order' => $validated['order'] ?? 0,
            'mentor_notes' => $validated['mentor_notes'] ?? null,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Resource creation proposal submitted successfully. Waiting for admin approval.');
    }

    /**
     * Store a proposal to update an existing resource
     */
    public function proposeUpdate(Request $request, LessonResource $resource): RedirectResponse
    {
        $user = auth()->user();

        // Verify mentor has access to this resource's program
        $this->verifyMentorAccess($resource->lesson);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'resource_type' => 'nullable|in:youtube,pdf,word,other',
            'youtube_url' => 'nullable|url',
            'file' => 'nullable|file|max:51200',
            'order' => 'nullable|integer|min:0',
            'mentor_notes' => 'nullable|string',
        ]);

        // Store original data for reference
        $originalData = [
            'title' => $resource->title,
            'description' => $resource->description,
            'resource_type' => $resource->resource_type,
            'youtube_url' => $resource->youtube_url,
            'file_path' => $resource->file_path,
            'order' => $resource->order,
        ];

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('lesson-resources', 'private');
        }

        ResourceProposal::create([
            'lesson_resource_id' => $resource->id,
            'lesson_id' => $resource->lesson_id,
            'proposed_by' => $user->id,
            'proposal_type' => 'update',
            'proposed_title' => $validated['title'] ?? null,
            'proposed_description' => $validated['description'] ?? null,
            'proposed_resource_type' => $validated['resource_type'] ?? null,
            'proposed_youtube_url' => $validated['youtube_url'] ?? null,
            'proposed_file_path' => $filePath,
            'proposed_order' => $validated['order'] ?? null,
            'original_data' => $originalData,
            'mentor_notes' => $validated['mentor_notes'] ?? null,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Resource update proposal submitted successfully. Waiting for admin approval.');
    }

    /**
     * Store a proposal to delete a resource
     */
    public function proposeDelete(Request $request, LessonResource $resource): RedirectResponse
    {
        $user = auth()->user();

        // Verify mentor has access to this resource's program
        $this->verifyMentorAccess($resource->lesson);

        $validated = $request->validate([
            'mentor_notes' => 'required|string',
        ]);

        // Store original data for reference
        $originalData = [
            'title' => $resource->title,
            'description' => $resource->description,
            'resource_type' => $resource->resource_type,
            'youtube_url' => $resource->youtube_url,
            'file_path' => $resource->file_path,
            'order' => $resource->order,
        ];

        ResourceProposal::create([
            'lesson_resource_id' => $resource->id,
            'lesson_id' => $resource->lesson_id,
            'proposed_by' => $user->id,
            'proposal_type' => 'delete',
            'original_data' => $originalData,
            'mentor_notes' => $validated['mentor_notes'],
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Resource deletion proposal submitted successfully. Waiting for admin approval.');
    }

    /**
     * Cancel a pending proposal
     */
    public function cancel(ResourceProposal $proposal): RedirectResponse
    {
        $user = auth()->user();

        // Verify this is the mentor's own proposal
        if ($proposal->proposed_by !== $user->id) {
            abort(403, 'You can only cancel your own proposals.');
        }

        // Can only cancel pending proposals
        if ($proposal->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending proposals can be cancelled.');
        }

        // Delete uploaded file if exists
        if ($proposal->proposed_file_path) {
            Storage::disk('private')->delete($proposal->proposed_file_path);
        }

        $proposal->delete();

        return redirect()->back()->with('success', 'Proposal cancelled successfully.');
    }

    /**
     * View a resource (for preview)
     */
    public function viewResource(LessonResource $resource)
    {
        $this->verifyMentorAccess($resource->lesson);

        // For YouTube videos, return the URL
        if ($resource->resource_type === 'youtube') {
            return response()->json([
                'type' => 'youtube',
                'url' => $resource->youtube_url,
            ]);
        }

        // For file-based resources, return the file
        if ($resource->file_path && Storage::disk('private')->exists($resource->file_path)) {
            $mimeType = Storage::disk('private')->mimeType($resource->file_path);

            // For PDFs, allow inline viewing
            if ($mimeType === 'application/pdf') {
                return response()->file(
                    Storage::disk('private')->path($resource->file_path),
                    ['Content-Type' => $mimeType]
                );
            }

            // For other files, force download
            return response()->download(
                Storage::disk('private')->path($resource->file_path),
                basename($resource->file_path)
            );
        }

        abort(404, 'Resource file not found.');
    }

    /**
     * Download a resource
     */
    public function downloadResource(LessonResource $resource)
    {
        $this->verifyMentorAccess($resource->lesson);

        if ($resource->file_path && Storage::disk('private')->exists($resource->file_path)) {
            return response()->download(
                Storage::disk('private')->path($resource->file_path),
                $resource->title . '.' . pathinfo($resource->file_path, PATHINFO_EXTENSION)
            );
        }

        abort(404, 'Resource file not found.');
    }

    /**
     * Verify mentor has access to teach this lesson's program
     */
    protected function verifyMentorAccess(Lesson $lesson): void
    {
        $user = auth()->user();

        $mentorEnrollment = $user->enrollments()
            ->where('program_id', $lesson->program_id)
            ->where('enrollment_type', 'mentor')
            ->where('approval_status', 'approved')
            ->first();

        if (!$mentorEnrollment) {
            abort(403, 'You are not authorized to propose changes for this program.');
        }
    }
}
