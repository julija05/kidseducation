// resources/js/Pages/Admin/Enrollments/Pending.jsx
import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import {
    User,
    Mail,
    Calendar,
    Clock,
    Check,
    X,
    AlertCircle,
    UserCheck,
    RefreshCw,
} from "lucide-react";
import AdminMentorReassignmentModal from "@/Components/Dashboard/AdminMentorReassignmentModal";

export default function PendingEnrollments({ enrollments, highlight_user_id, availableMentors }) {
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showMentorModal, setShowMentorModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState(false);

    const handleApprove = (enrollment) => {
        if (
            !confirm(
                `Approve enrollment for ${enrollment.user.name} in ${enrollment.program.name}?`
            )
        ) {
            return;
        }

        setProcessing(true);
        router.post(
            route("admin.enrollments.approve", enrollment.id),
            {},
            {
                onFinish: () => setProcessing(false),
            }
        );
    };

    const handleReject = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowRejectModal(true);
        setRejectionReason("");
    };

    const submitRejection = () => {
        setProcessing(true);
        router.post(
            route("admin.enrollments.reject", selectedEnrollment.id),
            { rejection_reason: rejectionReason },
            {
                onFinish: () => {
                    setProcessing(false);
                    setShowRejectModal(false);
                    setSelectedEnrollment(null);
                },
            }
        );
    };

    const handleChangeMentor = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowMentorModal(true);
    };

    const handleMentorChange = (mentorId) => {
        if (!mentorId) {
            alert("Please select a mentor.");
            return;
        }

        setProcessing(true);
        router.post(
            route("admin.enrollments.updateMentor", selectedEnrollment.id),
            { mentor_id: mentorId },
            {
                onFinish: () => {
                    setProcessing(false);
                    setShowMentorModal(false);
                    setSelectedEnrollment(null);
                },
            }
        );
    };

    return (
        <AdminLayout>
            <Head title="Pending Enrollments" />

            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="mb-4 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        Pending Enrollments
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">
                        Review and approve student enrollment requests
                    </p>
                </div>

                {enrollments.length === 0 ? (
                    <div className="text-center text-gray-500 bg-gray-50 rounded-lg p-6 sm:p-8">
                        <AlertCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-medium mb-2">No pending enrollments</h3>
                        <p className="text-sm sm:text-base">
                            No enrollment requests are waiting for approval at this time.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="block lg:hidden space-y-4">
                            {enrollments.map((enrollment) => {
                                const isHighlighted = highlight_user_id && enrollment.user.id == highlight_user_id;
                                return (
                                    <div
                                        key={enrollment.id}
                                        className={`bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow ${
                                            isHighlighted ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                                        }`}
                                    >
                                        {/* Student Info */}
                                        <div className="flex items-start space-x-3 mb-3">
                                            <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-gray-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-medium text-gray-900 truncate">
                                                    {enrollment.user.name}
                                                </p>
                                                <p className="text-sm text-gray-500 flex items-center">
                                                    <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                                    <span className="truncate">{enrollment.user.email}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Program Info */}
                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                {enrollment.program.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                €{enrollment.program.price}
                                            </p>
                                        </div>

                                        {/* Mentor Info */}
                                        {enrollment.enrollment_type === 'student' && (
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-500 mb-1">Assigned Mentor:</p>
                                                {enrollment.assigned_mentor ? (
                                                    <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                                        <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                            <UserCheck className="h-4 w-4 text-emerald-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {enrollment.assigned_mentor.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-red-600 font-medium">⚠ No mentor assigned</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Date & Waiting Time */}
                                        <div className="mb-4 space-y-1">
                                            <p className="text-xs text-gray-500 flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {new Date(enrollment.created_at).toLocaleDateString()}
                                                <span className="ml-2">{new Date(enrollment.created_at).toLocaleTimeString()}</span>
                                            </p>
                                            <p className="text-xs text-amber-600 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Waiting {getWaitingTime(enrollment.created_at)}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3 pt-3 border-t">
                                            {enrollment.enrollment_type === 'student' && (
                                                <button
                                                    onClick={() => handleChangeMentor(enrollment)}
                                                    disabled={processing}
                                                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-blue-600 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    {enrollment.assigned_mentor ? 'Change Mentor' : 'Assign Mentor'}
                                                </button>
                                            )}
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={() => handleApprove(enrollment)}
                                                    disabled={processing}
                                                    className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(enrollment)}
                                                    disabled={processing}
                                                    className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-red-600 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white shadow-sm rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Program
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assigned Mentor
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Requested On
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Waiting Time
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {enrollments.map((enrollment) => {
                                            const isHighlighted = highlight_user_id && enrollment.user.id == highlight_user_id;
                                            return (
                                            <tr
                                                key={enrollment.id}
                                                className={`hover:bg-gray-50 ${isHighlighted ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <User className="h-6 w-6 text-gray-500" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {enrollment.user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 flex items-center">
                                                                <Mail className="h-3 w-3 mr-1" />
                                                                {enrollment.user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {enrollment.program.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        €{enrollment.program.price}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {enrollment.enrollment_type === 'student' ? (
                                                        enrollment.assigned_mentor ? (
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                                    <UserCheck className="h-4 w-4 text-emerald-600" />
                                                                </div>
                                                                <div className="ml-2">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {enrollment.assigned_mentor.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-red-600 font-medium">⚠ Not assigned</span>
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                        {new Date(enrollment.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(enrollment.created_at).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-amber-600">
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        {getWaitingTime(enrollment.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {enrollment.enrollment_type === 'student' && (
                                                            <button
                                                                onClick={() => handleChangeMentor(enrollment)}
                                                                disabled={processing}
                                                                className="inline-flex items-center px-3 py-2 border border-blue-600 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                title={enrollment.assigned_mentor ? "Change mentor" : "Assign mentor"}
                                                            >
                                                                <RefreshCw className="w-3 h-3 mr-1" />
                                                                {enrollment.assigned_mentor ? 'Change' : 'Assign'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleApprove(enrollment)}
                                                            disabled={processing}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Check className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(enrollment)}
                                                            disabled={processing}
                                                            className="inline-flex items-center px-3 py-2 border border-red-600 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Rejection Modal - Mobile Responsive */}
            {showRejectModal && selectedEnrollment && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full shadow-lg">
                        <div className="p-4 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Reject Enrollment Request
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Rejecting enrollment for{" "}
                                <strong>{selectedEnrollment.user.name}</strong> in{" "}
                                <strong>{selectedEnrollment.program.name}</strong>
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason (Optional)
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={3}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 py-3 sm:py-2 text-base"
                                    placeholder="Provide a reason for rejection..."
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-end">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitRejection}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 min-h-[44px]"
                                >
                                    {processing ? "Processing..." : "Reject Enrollment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mentor Reassignment Modal */}
            {showMentorModal && selectedEnrollment && (
                <AdminMentorReassignmentModal
                    enrollment={selectedEnrollment}
                    availableMentors={availableMentors}
                    onConfirm={handleMentorChange}
                    onCancel={() => {
                        setShowMentorModal(false);
                        setSelectedEnrollment(null);
                    }}
                />
            )}
        </AdminLayout>
    );
}

// Helper function to calculate waiting time
function getWaitingTime(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
        return "Just now";
    }
}
