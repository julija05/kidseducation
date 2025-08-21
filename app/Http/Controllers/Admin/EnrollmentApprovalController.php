<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\EnrollmentApprovedMail;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EnrollmentApprovalController extends Controller
{
    /**
     * Display pending enrollments
     */
    public function index(Request $request)
    {
        $query = Enrollment::with(['user', 'program'])
            ->where('approval_status', 'pending');

        // Check if we need to highlight a specific user
        $highlightUserId = $request->get('highlight_user');

        if ($highlightUserId) {
            // Order by highlighted user first, then by creation date
            $query->orderByRaw('CASE WHEN user_id = ? THEN 0 ELSE 1 END', [$highlightUserId])
                ->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'asc');
        }

        $pendingEnrollments = $query->get();

        return $this->createView('Admin/Enrollments/Pending', [
            'enrollments' => $pendingEnrollments->toArray(),
            'highlight_user_id' => $highlightUserId,
        ]);
    }

    /**
     * Display all enrollments
     */
    public function all(Request $request)
    {
        $query = Enrollment::with(['user', 'program']);

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('approval_status', $request->status);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhereHas('program', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $enrollments = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return $this->createView('Admin/Enrollments/Index', [
            'enrollments' => $enrollments,
            'currentStatus' => $request->status ?? 'all',
            'searchTerm' => $request->search ?? '',
        ]);
    }

    /**
     * Approve an enrollment request
     */
    public function approve(Request $request, Enrollment $enrollment)
    {
        // Check if enrollment is already processed
        if ($enrollment->approval_status !== 'pending') {
            return redirect()->back()->with('error', 'This enrollment has already been processed.');
        }

        try {
            // Update enrollment status
            $enrollment->update([
                'approval_status' => 'approved',
                'status' => 'active',
                'approved_at' => now(),
                'approved_by' => auth()->id(),
            ]);

            // Create notification
            $notificationService = new NotificationService;
            $notificationService->createEnrollmentNotification($enrollment, 'approved');

            // Send approval email to student (if mail class exists)
            // try {
            //     if (class_exists(EnrollmentApprovedMail::class)) {
            //         Mail::to($enrollment->user->email)->send(
            //             new EnrollmentApprovedMail($enrollment)
            //         );
            //     }
            // } catch (\Exception $mailException) {
            //     // Log email error but don't fail the approval
            //     \Log::error('Failed to send approval email: ' . $mailException->getMessage());
            // }

            return redirect()->back()->with('success', 'Enrollment approved successfully! The student has been notified.');
        } catch (\Exception $e) {
            Log::error('Error approving enrollment: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error approving enrollment: '.$e->getMessage());
        }
    }

    /**
     * Reject an enrollment request
     */
    public function reject(Request $request, Enrollment $enrollment)
    {
        // Check if enrollment is already processed
        if ($enrollment->approval_status !== 'pending') {
            return redirect()->back()->with('error', 'This enrollment has already been processed.');
        }

        // Validate the rejection reason
        $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            // Update enrollment status
            $updated = $enrollment->update([
                'approval_status' => 'rejected',
                'status' => 'cancelled',
                'rejection_reason' => $request->rejection_reason,
                'rejected_at' => now(),
                'rejected_by' => auth()->id(),
            ]);

            if (! $updated) {
                throw new \Exception('Failed to update enrollment');
            }

            // Verify the update
            $enrollment->refresh();

            if ($enrollment->approval_status !== 'rejected') {
                throw new \Exception('Rejection status was not updated properly');
            }

            DB::commit();

            // Create notification
            $notificationService = new NotificationService;
            $notificationService->createEnrollmentNotification($enrollment, 'rejected');

            // Send rejection email to student (if needed)
            // ... email code ...

            return redirect()->back()->with('success', 'Enrollment rejected successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error rejecting enrollment:', [
                'enrollment_id' => $enrollment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Error rejecting enrollment: '.$e->getMessage());
        }
    }

    /**
     * Block user access to learning dashboard
     */
    public function blockAccess(Request $request, Enrollment $enrollment)
    {
        // Only allow blocking approved enrollments
        if ($enrollment->approval_status !== 'approved') {
            return redirect()->back()->with('error', 'Can only block access for approved enrollments.');
        }

        // Validate the block reason
        $request->validate([
            'block_reason' => 'required|string|max:500',
        ]);

        try {
            $enrollment->update([
                'access_blocked' => true,
                'block_reason' => $request->block_reason,
                'blocked_at' => now(),
                'blocked_by' => auth()->id(),
            ]);

            // Create notification
            $notificationService = new NotificationService;
            $notificationService->createEnrollmentNotification($enrollment, 'blocked');

            return redirect()->back()->with('success', 'User access blocked successfully.');
        } catch (\Exception $e) {
            Log::error('Error blocking access: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error blocking access: '.$e->getMessage());
        }
    }

    /**
     * Unblock user access to learning dashboard
     */
    public function unblockAccess(Enrollment $enrollment)
    {
        try {
            $enrollment->update([
                'access_blocked' => false,
                'block_reason' => null,
                'blocked_at' => null,
                'blocked_by' => null,
            ]);

            // Create notification
            $notificationService = new NotificationService;
            $notificationService->createEnrollmentNotification($enrollment, 'unblocked');

            return redirect()->back()->with('success', 'User access restored successfully.');
        } catch (\Exception $e) {
            Log::error('Error unblocking access: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error unblocking access: '.$e->getMessage());
        }
    }
}
