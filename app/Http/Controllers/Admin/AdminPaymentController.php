<?php

namespace App\Http\Controllers\Admin;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentType;
use App\Constants\PaymentMethod;
use App\Constants\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

/**
 * Admin management for the manual (offline) payment flow.
 *
 * Parents pay by bank transfer or cash; admins record/confirm the payment
 * here, which unblocks the student's access to the program.
 */
class AdminPaymentController extends Controller
{
    // Number of payments shown per page in the listing.
    private const PAYMENTS_PER_PAGE = 15;

    // Default currency for manually recorded payments.
    private const DEFAULT_CURRENCY = 'MKD';

    /**
     * List payments with status filtering and show the enrollments that can
     * still have a payment recorded for them.
     */
    public function index(Request $request)
    {
        $query = Payment::with([
            'enrollment.user:id,name,email',
            'enrollment.program:id,name',
            'confirmedBy:id,name',
        ])->latest();

        // Filter by payment status when an explicit one is requested.
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by student name/email or program name.
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('enrollment', function ($enrollmentQuery) use ($search) {
                $enrollmentQuery->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('program', function ($programQuery) use ($search) {
                    $programQuery->where('name', 'like', "%{$search}%");
                });
            });
        }

        $payments = $query->paginate(self::PAYMENTS_PER_PAGE)->withQueryString();

        return $this->createView('Admin/Payments/Index', [
            'payments' => $payments,
            'payableEnrollments' => $this->payableEnrollments(),
            'statuses' => PaymentStatus::all(),
            'methods' => PaymentMethod::all(),
            'defaultCurrency' => self::DEFAULT_CURRENCY,
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Record a payment that the admin has already received, confirm it, and
     * unblock the student's access in a single step.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enrollment_id' => ['required', 'exists:enrollments,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'max:10'],
            'period' => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'method' => ['required', Rule::in(PaymentMethod::all())],
            'reference' => ['nullable', 'string', 'max:191'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $enrollment = Enrollment::findOrFail($validated['enrollment_id']);

        // Prevent duplicate payments for the same enrollment and period.
        $alreadyExists = $enrollment->payments()
            ->where('period', $validated['period'])
            ->exists();

        if ($alreadyExists) {
            return redirect()->back()
                ->with('error', 'A payment for this enrollment and period already exists.');
        }

        try {
            DB::transaction(function () use ($enrollment, $validated) {
                $payment = $enrollment->payments()->create([
                    'amount' => $validated['amount'],
                    'currency' => $validated['currency'],
                    'period' => $validated['period'],
                    'method' => $validated['method'],
                    'reference' => $validated['reference'] ?? null,
                    'note' => $validated['note'] ?? null,
                    'status' => PaymentStatus::CONFIRMED,
                    'confirmed_by' => auth()->id(),
                    'confirmed_at' => now(),
                ]);

                $this->unblockEnrollment($payment->enrollment);
            });

            return redirect()->back()->with('success', 'Payment recorded and access granted.');
        } catch (\Exception $e) {
            Log::error('Error recording payment: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error recording payment: '.$e->getMessage());
        }
    }

    /**
     * Confirm a pending payment (e.g. declared by a parent) and unblock the
     * student's access.
     */
    public function confirm(Payment $payment): RedirectResponse
    {
        if ($payment->status === PaymentStatus::CONFIRMED) {
            return redirect()->back()->with('error', 'This payment is already confirmed.');
        }

        try {
            DB::transaction(function () use ($payment) {
                $payment->update([
                    'status' => PaymentStatus::CONFIRMED,
                    'confirmed_by' => auth()->id(),
                    'confirmed_at' => now(),
                ]);

                $this->unblockEnrollment($payment->enrollment);
            });

            return redirect()->back()->with('success', 'Payment confirmed and access granted.');
        } catch (\Exception $e) {
            Log::error('Error confirming payment: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error confirming payment: '.$e->getMessage());
        }
    }

    /**
     * Reject a pending payment. Access stays blocked; an optional note records
     * why the payment could not be verified.
     */
    public function reject(Request $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($payment->status === PaymentStatus::CONFIRMED) {
            return redirect()->back()->with('error', 'Cannot reject an already confirmed payment.');
        }

        try {
            $payment->update([
                'status' => PaymentStatus::REJECTED,
                'note' => $validated['note'] ?? $payment->note,
                'confirmed_by' => auth()->id(),
                'confirmed_at' => now(),
            ]);

            return redirect()->back()->with('success', 'Payment marked as rejected.');
        } catch (\Exception $e) {
            Log::error('Error rejecting payment: '.$e->getMessage());

            return redirect()->back()->with('error', 'Error rejecting payment: '.$e->getMessage());
        }
    }

    /**
     * Approved student enrollments whose program requires a monthly payment,
     * used to populate the "record a payment" selector.
     *
     * @return \Illuminate\Support\Collection
     */
    private function payableEnrollments()
    {
        return Enrollment::query()
            ->where('enrollment_type', EnrollmentType::STUDENT)
            ->where('approval_status', ApprovalStatus::APPROVED)
            ->whereHas('program', function ($programQuery) {
                $programQuery->where('requires_monthly_payment', true);
            })
            ->with(['user:id,name,email', 'program:id,name'])
            ->get()
            ->map(fn (Enrollment $enrollment) => [
                'id' => $enrollment->id,
                'student_name' => $enrollment->user?->name,
                'program_name' => $enrollment->program?->name,
                'access_blocked' => (bool) $enrollment->access_blocked,
            ])
            ->values();
    }

    /**
     * Clear any payment block on an enrollment so the student regains access.
     */
    private function unblockEnrollment(Enrollment $enrollment): void
    {
        if (! $enrollment->access_blocked) {
            return;
        }

        $enrollment->update([
            'access_blocked' => false,
            'block_reason' => null,
            'blocked_at' => null,
            'blocked_by' => null,
        ]);
    }
}
