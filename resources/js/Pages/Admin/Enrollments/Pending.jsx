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
} from "lucide-react";

export default function PendingEnrollments({ enrollments, highlight_user_id }) {
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
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

    return (
        <AdminLayout>
            <Head title="Pending Enrollments" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Pending Enrollments
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Review and approve student enrollment requests
                    </p>
                </div>

                {enrollments.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">
                            No pending enrollments at this time.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                                                            {
                                                                enrollment.user
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            {
                                                                enrollment.user
                                                                    .email
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {enrollment.program.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ${enrollment.program.price}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                    {new Date(
                                                        enrollment.created_at
                                                    ).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(
                                                        enrollment.created_at
                                                    ).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-amber-600">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {getWaitingTime(
                                                        enrollment.created_at
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() =>
                                                        handleApprove(
                                                            enrollment
                                                        )
                                                    }
                                                    disabled={processing}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleReject(enrollment)
                                                    }
                                                    disabled={processing}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {showRejectModal && selectedEnrollment && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Reject Enrollment Request
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Rejecting enrollment for{" "}
                            <strong>{selectedEnrollment.user.name}</strong> in{" "}
                            <strong>{selectedEnrollment.program.name}</strong>
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason (Optional)
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                                rows={3}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                placeholder="Provide a reason for rejection..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                disabled={processing}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRejection}
                                disabled={processing}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {processing
                                    ? "Processing..."
                                    : "Reject Enrollment"}
                            </button>
                        </div>
                    </div>
                </div>
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
