import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { GraduationCap, Clock, CheckCircle, XCircle, User, DollarSign, Calendar, FileEdit, Layers, AlertCircle, Send } from "lucide-react";
import { useState } from "react";

/**
 * ProgramProposals Component
 * Admin interface for reviewing and approving/rejecting mentor program proposals
 * Supports multi-step approval: Initial Review -> Content Development -> Final Review -> Approved
 */
export default function ProgramProposals({ needingReview, inDevelopment, recentReviewed }) {
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        rejection_reason: '',
    });

    /**
     * Handle program approval (different messages for initial vs final)
     */
    const handleApprove = (program) => {
        let confirmMessage;

        if (program.is_initial_review) {
            confirmMessage = `Approve "${program.name}" for content development?\n\nThis will allow the mentor to start adding lessons and resources.`;
        } else {
            confirmMessage = `Fully approve "${program.name}"?\n\nThis will make it active and publicly visible for student enrollment.`;
        }

        if (confirm(confirmMessage)) {
            router.post(route('admin.programs.approve', program.slug), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be shown via flash
                }
            });
        }
    };

    /**
     * Show rejection modal
     */
    const handleRejectClick = (program) => {
        setSelectedProgram(program);
        setShowRejectModal(true);
        reset();
    };

    /**
     * Submit rejection
     */
    const handleRejectSubmit = (e) => {
        e.preventDefault();
        post(route('admin.programs.reject', selectedProgram.slug), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedProgram(null);
                reset();
            }
        });
    };

    /**
     * Get status icon component
     */
    const getStatusIcon = (status) => {
        const iconMap = {
            pending_initial_review: Clock,
            content_development: FileEdit,
            pending_final_review: AlertCircle,
            approved: CheckCircle,
            rejected: XCircle,
        };
        return iconMap[status] || Clock;
    };

    return (
        <AdminLayout>
            <Head title="Program Proposals" />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">
                                    Program Proposals
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    Review and manage mentor-proposed educational programs
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Programs Needing Review Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            <h2 className="text-xl font-bold text-slate-900">
                                Needs Your Review ({needingReview.length})
                            </h2>
                        </div>

                        {needingReview.length === 0 ? (
                            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 text-center">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-slate-600">All caught up! No programs need review.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {needingReview.map((program) => {
                                    const StatusIcon = getStatusIcon(program.approval_status);

                                    return (
                                        <div
                                            key={program.id}
                                            className="bg-white rounded-2xl border-2 border-orange-200 p-6 hover:shadow-lg transition-shadow"
                                        >
                                            {/* Header with Status Badge */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-slate-900">
                                                            {program.name}
                                                        </h3>
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 ${program.approval_status_color}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {program.approval_status_label}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600">
                                                        {program.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Program Info - Different for initial vs final review */}
                                            {program.is_initial_review ? (
                                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                                                    <div className="flex items-start gap-3">
                                                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-bold text-yellow-900 mb-1">
                                                                📋 Initial Program Proposal
                                                            </p>
                                                            <p className="text-xs text-yellow-700 mb-2">
                                                                The mentor wants to create this program. Review the concept and details.
                                                                If approved, they can start adding lessons and resources.
                                                            </p>
                                                            <p className="text-xs text-yellow-600">
                                                                💡 Tip: Check if the program concept fits your platform's offerings.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                                                    <div className="flex items-start gap-3">
                                                        <Layers className="w-5 h-5 text-blue-600 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-bold text-blue-900 mb-1">
                                                                📝 Complete Program Ready for Final Review
                                                            </p>
                                                            <p className="text-xs text-blue-700 mb-2">
                                                                Mentor has added <strong>{program.lessons_count} lesson{program.lessons_count !== 1 ? 's' : ''}</strong>.
                                                                Review the complete program and content before making it public.
                                                            </p>
                                                            <p className="text-xs text-blue-600">
                                                                💡 Tip: Check program details, lesson quality, resources, and overall structure.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Program Details Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 font-semibold mb-1">Duration</p>
                                                    <p className="text-sm font-bold text-slate-900">{program.duration}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-semibold mb-1">Price</p>
                                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                                        <DollarSign className="w-3.5 h-3.5" />
                                                        {program.price}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-semibold mb-1">Weeks</p>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {program.duration_weeks || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-semibold mb-1">Payment</p>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {program.requires_monthly_payment ? 'Monthly' : 'One-time'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-semibold mb-1">Lessons</p>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {program.lessons_count}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Proposed By */}
                                            {program.proposed_by && (
                                                <div className="flex items-center gap-2 text-sm bg-slate-50 rounded-lg p-3 mb-4">
                                                    <User className="w-4 h-4 text-slate-600" />
                                                    <span className="text-slate-700">
                                                        Proposed by <strong className="text-slate-900">{program.proposed_by.name}</strong>
                                                        <span className="text-slate-500"> ({program.proposed_by.email})</span>
                                                    </span>
                                                </div>
                                            )}

                                            {/* Submitted Date */}
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Submitted on {new Date(program.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>

                                            {/* Action Buttons - Different labels for initial vs final */}
                                            <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-100">
                                                <button
                                                    onClick={() => handleApprove(program)}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    {program.is_initial_review ? 'Approve to Start Building' : 'Approve & Publish'}
                                                </button>
                                                <a
                                                    href={route('admin.programs.preview', program.slug)}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                                                >
                                                    <Layers className="w-4 h-4" />
                                                    Preview Content
                                                </a>
                                                <button
                                                    onClick={() => handleRejectClick(program)}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* In Development Section */}
                    {inDevelopment && inDevelopment.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <FileEdit className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-slate-900">
                                    In Content Development ({inDevelopment.length})
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {inDevelopment.map((program) => {
                                    const StatusIcon = getStatusIcon(program.approval_status);

                                    return (
                                        <div
                                            key={program.id}
                                            className="bg-white rounded-xl border-2 border-blue-200 p-4"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-slate-900">
                                                            {program.name}
                                                        </h4>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${program.approval_status_color}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {program.approval_status_label}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-slate-600 mt-2">
                                                        {program.proposed_by && (
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                {program.proposed_by.name}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Layers className="w-3 h-3" />
                                                            {program.lessons_count} lesson{program.lessons_count !== 1 ? 's' : ''}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Updated {new Date(program.updated_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-3 text-xs text-slate-500 bg-blue-50 rounded-lg p-3">
                                <p>💡 These programs are approved for content development. Mentors are currently adding lessons and resources. They will submit for final review when ready.</p>
                            </div>
                        </div>
                    )}

                    {/* Recently Reviewed Section */}
                    {recentReviewed && recentReviewed.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">
                                Recently Reviewed
                            </h2>

                            <div className="space-y-3">
                                {recentReviewed.map((program) => {
                                    const StatusIcon = getStatusIcon(program.approval_status);

                                    return (
                                        <div
                                            key={program.id}
                                            className={`bg-white rounded-xl border-2 p-4 ${program.approval_status_color.includes('green') ? 'border-green-200' : program.approval_status_color.includes('red') ? 'border-red-200' : 'border-blue-200'}`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-slate-900">
                                                            {program.name}
                                                        </h4>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${program.approval_status_color}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {program.approval_status_label}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-slate-600 line-clamp-1 mb-2">
                                                        {program.description}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                                        {program.proposed_by && (
                                                            <span>By {program.proposed_by.name}</span>
                                                        )}
                                                        {program.approved_by && (
                                                            <span>
                                                                Reviewed by {program.approved_by.name}
                                                            </span>
                                                        )}
                                                        <span>
                                                            {program.approved_at && new Date(program.approved_at).toLocaleDateString()}
                                                            {program.rejected_at && new Date(program.rejected_at).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    {program.rejection_reason && (
                                                        <p className="text-xs text-red-700 mt-2 bg-red-50 p-2 rounded">
                                                            <strong>Reason:</strong> {program.rejection_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && selectedProgram && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">
                                Reject Program Proposal
                            </h3>
                        </div>

                        <p className="text-slate-600 mb-4">
                            You are about to reject "<strong>{selectedProgram.name}</strong>".
                            Please provide a clear reason so the mentor can understand why.
                        </p>

                        <form onSubmit={handleRejectSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    value={data.rejection_reason}
                                    onChange={(e) => setData('rejection_reason', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-red-400 focus:outline-none"
                                    rows="4"
                                    placeholder="Explain why this program cannot be approved..."
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Rejecting...' : 'Reject Program'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setSelectedProgram(null);
                                        reset();
                                    }}
                                    className="px-5 py-2.5 border-2 border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
