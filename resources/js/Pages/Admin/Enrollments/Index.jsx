// resources/js/Pages/Admin/Enrollments/Index.jsx
import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, Link } from "@inertiajs/react";
import {
    User,
    Mail,
    Calendar,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    Lock,
    Unlock,
    Shield,
    ShieldOff,
} from "lucide-react";

export default function AllEnrollments({
    enrollments,
    currentStatus,
    searchTerm,
}) {
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const [processing, setProcessing] = useState(false);
    const handleSearch = (e) => {
        e.preventDefault();
        const search = e.target.search.value;
        router.get(route("admin.enrollments.index"), {
            search,
            status: currentStatus,
        });
    };

    const handleStatusFilter = (status) => {
        router.get(route("admin.enrollments.index"), {
            status,
            search: searchTerm,
        });
    };

    const handleBlockAccess = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowBlockModal(true);
        setBlockReason("");
    };

    const handleUnblockAccess = (enrollment) => {
        if (
            !confirm(
                `Restore access for ${enrollment.user?.name || 'Unknown User'} in ${enrollment.program?.name || 'Unknown Program'}?`
            )
        ) {
            return;
        }

        setProcessing(true);
        router.post(
            route("admin.enrollments.unblock", enrollment.id),
            {},
            {
                onFinish: () => setProcessing(false),
            }
        );
    };

    const submitBlock = () => {
        if (!blockReason.trim()) {
            alert("Please provide a reason for blocking access.");
            return;
        }

        setProcessing(true);
        router.post(
            route("admin.enrollments.block", selectedEnrollment.id),
            { block_reason: blockReason },
            {
                onFinish: () => {
                    setProcessing(false);
                    setShowBlockModal(false);
                    setSelectedEnrollment(null);
                },
            }
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </span>
                );
            case "approved":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </span>
                );
        }
    };

    const getAccessBadge = (enrollment) => {
        if (enrollment.approval_status !== 'approved') {
            return null; // No access badge for non-approved enrollments
        }

        if (enrollment.access_blocked) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Lock className="w-3 h-3 mr-1" />
                    Blocked
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Unlock className="w-3 h-3 mr-1" />
                Active Access
            </span>
        );
    };

    return (
        <AdminLayout>
            <Head title="All Enrollments" />

            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="mb-4 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        All Enrollments
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">
                        View and manage all student enrollments
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4">
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                name="search"
                                defaultValue={searchTerm}
                                placeholder="Search by student name, email, or program..."
                                className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base min-h-[44px]"
                            />
                            <Search className="absolute left-3 top-3.5 sm:top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium min-h-[44px] flex items-center justify-center"
                        >
                            Search
                        </button>
                    </form>

                    {/* Status Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleStatusFilter("all")}
                            className={`px-4 py-3 sm:py-2 rounded-lg font-medium min-h-[44px] flex items-center justify-center ${
                                currentStatus === "all"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => handleStatusFilter("pending")}
                            className={`px-4 py-3 sm:py-2 rounded-lg font-medium min-h-[44px] flex items-center justify-center ${
                                currentStatus === "pending"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => handleStatusFilter("approved")}
                            className={`px-4 py-3 sm:py-2 rounded-lg font-medium min-h-[44px] flex items-center justify-center ${
                                currentStatus === "approved"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => handleStatusFilter("rejected")}
                            className={`px-4 py-3 sm:py-2 rounded-lg font-medium min-h-[44px] flex items-center justify-center ${
                                currentStatus === "rejected"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Rejected
                        </button>
                    </div>
                </div>

                {/* Enrollments List - Mobile First Design */}
                {enrollments.data.length === 0 ? (
                    <div className="text-center text-gray-500 bg-gray-50 rounded-lg p-6 sm:p-8">
                        <h3 className="text-base sm:text-lg font-medium mb-2">No enrollments found</h3>
                        <p className="text-sm sm:text-base">
                            No enrollments match your current filters.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="block lg:hidden space-y-4">
                            {enrollments.data.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow"
                                >
                                    {/* Student Info */}
                                    <div className="flex items-start space-x-3 mb-3">
                                        <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="h-6 w-6 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-medium text-gray-900 truncate">
                                                {enrollment.user?.name || 'Unknown User'}
                                            </p>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                                <span className="truncate">{enrollment.user?.email || 'No email'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Program & Status Info */}
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                            {enrollment.program?.name || 'Unknown Program'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {getStatusBadge(enrollment.approval_status)}
                                            {getAccessBadge(enrollment)}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(enrollment.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    {enrollment.approval_status === 'approved' && (
                                        <div className="pt-3 border-t">
                                            {enrollment.access_blocked ? (
                                                <button
                                                    onClick={() => handleUnblockAccess(enrollment)}
                                                    disabled={processing}
                                                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
                                                >
                                                    <Unlock className="w-4 h-4 mr-2" />
                                                    Restore Access
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBlockAccess(enrollment)}
                                                    disabled={processing}
                                                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                                                >
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    Block Access
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
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
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Access
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {enrollments.data.map((enrollment) => (
                                            <tr
                                                key={enrollment.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <User className="h-6 w-6 text-gray-500" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {enrollment.user?.name || 'Unknown User'}
                                                            </div>
                                                            <div className="text-sm text-gray-500 flex items-center">
                                                                <Mail className="h-3 w-3 mr-1" />
                                                                {enrollment.user?.email || 'No email'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {enrollment.program?.name || 'Unknown Program'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(
                                                        enrollment.approval_status
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getAccessBadge(enrollment)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                        {new Date(
                                                            enrollment.created_at
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {enrollment.approval_status === 'approved' && (
                                                            <>
                                                                {enrollment.access_blocked ? (
                                                                    <button
                                                                        onClick={() => handleUnblockAccess(enrollment)}
                                                                        disabled={processing}
                                                                        className="inline-flex items-center px-3 py-2 border border-green-300 text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                    >
                                                                        <Unlock className="w-3 h-3 mr-1" />
                                                                        Restore
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleBlockAccess(enrollment)}
                                                                        disabled={processing}
                                                                        className="inline-flex items-center px-3 py-2 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                                    >
                                                                        <Lock className="w-3 h-3 mr-1" />
                                                                        Block
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Pagination */}
                {enrollments.links && enrollments.links.length > 3 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                            {enrollments.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-2 sm:px-3 sm:py-1 rounded border text-xs sm:text-sm min-h-[44px] sm:min-h-0 flex items-center justify-center ${
                                            link.active
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-blue-600 border-gray-300 hover:bg-blue-100"
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="px-3 py-2 sm:px-3 sm:py-1 rounded border text-gray-400 border-gray-300 text-xs sm:text-sm min-h-[44px] sm:min-h-0 flex items-center justify-center"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Block Access Modal - Mobile Responsive */}
                {showBlockModal && selectedEnrollment && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="relative mx-auto max-w-md w-full bg-white rounded-lg shadow-lg">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Block Access
                                    </h3>
                                    <button
                                        onClick={() => setShowBlockModal(false)}
                                        className="text-gray-400 hover:text-gray-600 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>
                                
                                <p className="text-sm text-gray-500 mb-4">
                                    Block access for <strong>{selectedEnrollment.user?.name || 'Unknown User'}</strong> in{' '}
                                    <strong>{selectedEnrollment.program?.name || 'Unknown Program'}</strong>
                                </p>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reason for blocking access (required)
                                    </label>
                                    <textarea
                                        value={blockReason}
                                        onChange={(e) => setBlockReason(e.target.value)}
                                        className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-base"
                                        rows="3"
                                        placeholder="Please provide a reason for blocking access..."
                                    />
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-end">
                                    <button
                                        onClick={() => setShowBlockModal(false)}
                                        disabled={processing}
                                        className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitBlock}
                                        disabled={processing || !blockReason.trim()}
                                        className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                                    >
                                        {processing ? 'Blocking...' : 'Block Access'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
