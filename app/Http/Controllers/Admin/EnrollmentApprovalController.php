<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\User;
use App\Mail\EnrollmentApprovedMail;
use App\Mail\EnrollmentRejectedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class EnrollmentApprovalController extends Controller
{
    /**
     * Display pending enrollments
     */
    public function index()
    {
        $pendingEnrollments = Enrollment::with(['user', 'program'])
            ->where('approval_status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Admin/Enrollments/Pending', [
            'enrollments' => $pendingEnrollments->toArray()
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

        return Inertia::render('Admin/Enrollments/Index', [
            'enrollments' => $enrollments,
            'currentStatus' => $request->status ?? 'all',
            'searchTerm' => $request->search ?? ''
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
                'approved_by' => auth()->id()
            ]);

            // Send approval email to student
            try {
                Log::info('Sending approval email to: ' . $enrollment->user->email);
                Mail::to($enrollment->user->email)->send(
                    new EnrollmentApprovedMail($enrollment)
                );
            } catch (\Exception $mailException) {
                Log::error('Failed to send approval email: ' . $mailException->getMessage());
            }

            return redirect()->back()->with('success', 'Enrollment approved successfully! The student has been notified.');
        } catch (\Exception $e) {
            Log::error('Error approving enrollment: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error approving enrollment: ' . $e->getMessage());
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
            'rejection_reason' => 'nullable|string|max:500'
        ]);

        DB::beginTransaction();
        try {
            // Update enrollment status
            $updated = $enrollment->update([
                'approval_status' => 'rejected',
                'status' => 'cancelled',
                'rejection_reason' => $request->rejection_reason,
                'rejected_at' => now(),
                'rejected_by' => auth()->id()
            ]);

            if (!$updated) {
                throw new \Exception('Failed to update enrollment');
            }

            // Verify the update
            $enrollment->refresh();

            if ($enrollment->approval_status !== 'rejected') {
                throw new \Exception('Rejection status was not updated properly');
            }

            DB::commit();

            // Send rejection email to student
            try {
                Log::info('Sending rejection email to: ' . $enrollment->user->email);
                Mail::to($enrollment->user->email)->send(
                    new EnrollmentRejectedMail($enrollment)
                );
            } catch (\Exception $mailException) {
                Log::error('Failed to send rejection email: ' . $mailException->getMessage());
            }

            return redirect()->back()->with('success', 'Enrollment rejected successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error rejecting enrollment:', [
                'enrollment_id' => $enrollment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Error rejecting enrollment: ' . $e->getMessage());
        }
    }
}
