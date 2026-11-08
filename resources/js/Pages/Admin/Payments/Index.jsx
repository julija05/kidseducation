// resources/js/Pages/Admin/Payments/Index.jsx
import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, Link } from "@inertiajs/react";
import {
    CreditCard,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Plus,
    X,
} from "lucide-react";

// Visual styling for each payment status badge.
const STATUS_BADGES = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800", Icon: Clock },
    confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800", Icon: CheckCircle },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800", Icon: XCircle },
};

// Human-friendly labels for the manual payment methods.
const METHOD_LABELS = {
    bank_transfer: "Bank transfer",
    cash: "Cash",
    other: "Other",
};

// Default billing period (current month) in the YYYY-MM format the API expects.
const currentPeriod = () => new Date().toISOString().slice(0, 7);

export default function PaymentsIndex({
    payments,
    payableEnrollments = [],
    statuses = [],
    methods = [],
    defaultCurrency = "MKD",
    filters = { status: "all", search: "" },
}) {
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [form, setForm] = useState({
        enrollment_id: "",
        amount: "",
        currency: defaultCurrency,
        period: currentPeriod(),
        method: methods[0] ?? "bank_transfer",
        reference: "",
        note: "",
    });

    // Submit a search query while preserving the current status filter.
    const handleSearch = (event) => {
        event.preventDefault();
        router.get(
            route("admin.payments.index"),
            { search: event.target.search.value, status: filters.status },
            { preserveState: true, replace: true }
        );
    };

    // Switch the active status filter.
    const filterByStatus = (status) => {
        router.get(
            route("admin.payments.index"),
            { status, search: filters.search },
            { preserveState: true, replace: true }
        );
    };

    // Confirm a pending payment and unblock the student's access.
    const confirmPayment = (payment) => {
        if (!confirm("Confirm this payment and grant the student access?")) return;
        router.post(route("admin.payments.confirm", payment.id), {}, { preserveScroll: true });
    };

    // Reject a pending payment with an optional reason.
    const rejectPayment = (payment) => {
        const note = prompt("Reason for rejecting this payment (optional):", "");
        if (note === null) return;
        router.post(route("admin.payments.reject", payment.id), { note }, { preserveScroll: true });
    };

    // Submit the "record payment" form.
    const submitRecord = (event) => {
        event.preventDefault();
        setProcessing(true);
        router.post(route("admin.payments.store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRecordModal(false);
                setForm({
                    enrollment_id: "",
                    amount: "",
                    currency: defaultCurrency,
                    period: currentPeriod(),
                    method: methods[0] ?? "bank_transfer",
                    reference: "",
                    note: "",
                });
            },
            onFinish: () => setProcessing(false),
        });
    };

    const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    return (
        <AdminLayout>
            <Head title="Payments" />

            <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-7 h-7 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                            <p className="text-sm text-gray-500">
                                Record and confirm manual (bank transfer / cash) payments.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowRecordModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" /> Record payment
                    </button>
                </div>

                {/* Toolbar: status filters + search */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => filterByStatus("all")}
                            className={`px-3 py-1.5 rounded text-sm ${
                                filters.status === "all"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-gray-300 text-gray-700"
                            }`}
                        >
                            All
                        </button>
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => filterByStatus(status)}
                                className={`px-3 py-1.5 rounded text-sm capitalize ${
                                    filters.status === status
                                        ? "bg-blue-600 text-white"
                                        : "bg-white border border-gray-300 text-gray-700"
                                }`}
                            >
                                {STATUS_BADGES[status]?.label ?? status}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Search by student or program..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm">
                            Search
                        </button>
                    </form>
                </div>

                {/* Payments list */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {payments.data.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">No payments found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Student</th>
                                        <th className="px-4 py-3">Program</th>
                                        <th className="px-4 py-3">Period</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Method</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.data.map((payment) => {
                                        const badge = STATUS_BADGES[payment.status] ?? STATUS_BADGES.pending;
                                        const BadgeIcon = badge.Icon;
                                        return (
                                            <tr key={payment.id}>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">
                                                        {payment.enrollment?.user?.name ?? "—"}
                                                    </div>
                                                    <div className="text-gray-500 text-xs">
                                                        {payment.enrollment?.user?.email}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {payment.enrollment?.program?.name ?? "—"}
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">{payment.period}</td>
                                                <td className="px-4 py-3 text-gray-900 font-medium">
                                                    {payment.amount} {payment.currency}
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {METHOD_LABELS[payment.method] ?? payment.method}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
                                                    >
                                                        <BadgeIcon className="w-3 h-3" />
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {payment.status === "pending" ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => confirmPayment(payment)}
                                                                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => rejectPayment(payment)}
                                                                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            {payment.confirmed_by?.name
                                                                ? `by ${payment.confirmed_by.name}`
                                                                : "—"}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {payments.links && payments.links.length > 3 && (
                    <div className="flex justify-center pt-4">
                        <div className="flex gap-1 flex-wrap justify-center">
                            {payments.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-1 rounded border text-sm ${
                                            link.active
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-blue-600 border-gray-300 hover:bg-blue-100"
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="px-3 py-1 rounded border text-gray-400 border-gray-300 text-sm"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Record payment modal */}
            {showRecordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Record a payment</h2>
                            <button onClick={() => setShowRecordModal(false)}>
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={submitRecord} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Enrollment
                                </label>
                                <select
                                    required
                                    value={form.enrollment_id}
                                    onChange={(e) => updateForm("enrollment_id", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Select student / program...</option>
                                    {payableEnrollments.map((enrollment) => (
                                        <option key={enrollment.id} value={enrollment.id}>
                                            {enrollment.student_name} — {enrollment.program_name}
                                            {enrollment.access_blocked ? " (blocked)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={form.amount}
                                        onChange={(e) => updateForm("amount", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Currency
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.currency}
                                        onChange={(e) => updateForm("currency", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Period
                                    </label>
                                    <input
                                        type="month"
                                        required
                                        value={form.period}
                                        onChange={(e) => updateForm("period", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Method
                                    </label>
                                    <select
                                        value={form.method}
                                        onChange={(e) => updateForm("method", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        {methods.map((method) => (
                                            <option key={method} value={method}>
                                                {METHOD_LABELS[method] ?? method}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reference (optional)
                                </label>
                                <input
                                    type="text"
                                    value={form.reference}
                                    onChange={(e) => updateForm("reference", e.target.value)}
                                    placeholder="Bank reference, receipt no..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note (optional)
                                </label>
                                <textarea
                                    value={form.note}
                                    onChange={(e) => updateForm("note", e.target.value)}
                                    rows={2}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRecordModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                                >
                                    {processing ? "Saving..." : "Record & grant access"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
