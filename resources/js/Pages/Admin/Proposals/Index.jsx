import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import { FileText, Clock, CheckCircle, XCircle, Layers, Eye, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { PROPOSAL_STATUS, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS, PROPOSAL_TYPE_LABELS } from "@/Constants/proposalConstants";

export default function AdminProposalsIndex({ pendingProposals, recentReviewed }) {
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewAction, setReviewAction] = useState(null); // 'approve' or 'reject'

    const approveForm = useForm({
        admin_notes: '',
    });

    const rejectForm = useForm({
        admin_notes: '',
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case PROPOSAL_STATUS.PENDING:
                return <Clock className="w-4 h-4" />;
            case PROPOSAL_STATUS.APPROVED:
            case PROPOSAL_STATUS.APPLIED:
                return <CheckCircle className="w-4 h-4" />;
            case PROPOSAL_STATUS.REJECTED:
                return <XCircle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const openReviewModal = (proposal, action) => {
        setSelectedProposal(proposal);
        setReviewAction(action);
        setShowReviewModal(true);
        // Reset forms
        approveForm.reset();
        rejectForm.reset();
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedProposal(null);
        setReviewAction(null);
    };

    const handleApprove = (e) => {
        e.preventDefault();
        approveForm.post(route('admin.proposals.approve', selectedProposal.id), {
            onSuccess: () => closeReviewModal(),
        });
    };

    const handleReject = (e) => {
        e.preventDefault();
        rejectForm.post(route('admin.proposals.reject', selectedProposal.id), {
            onSuccess: () => closeReviewModal(),
        });
    };

    const ProposalCard = ({ proposal, isPending = false }) => (
        <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${proposal.status_color}`}>
                            {getStatusIcon(proposal.status)}
                            {proposal.status_label}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {proposal.type_label}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                        {proposal.program?.name || 'Program'}
                    </h3>
                    {proposal.lesson && (
                        <p className="text-sm text-slate-600 mt-1">
                            Lesson: {proposal.lesson.title}
                        </p>
                    )}
                    <p className="text-sm text-slate-500 mt-1">
                        By: {proposal.proposed_by.name}
                    </p>
                </div>
            </div>

            {/* Proposed Changes Summary */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <h4 className="text-xs font-bold text-slate-700 mb-2">PROPOSED CHANGES</h4>
                <div className="space-y-1 text-sm text-slate-600">
                    {proposal.proposed_data.title && (
                        <div><span className="font-semibold">Title:</span> {proposal.proposed_data.title}</div>
                    )}
                    {proposal.proposed_data.description && (
                        <div className="line-clamp-2">
                            <span className="font-semibold">Description:</span> {proposal.proposed_data.description}
                        </div>
                    )}
                    {proposal.proposed_data.level && (
                        <div><span className="font-semibold">Level:</span> {proposal.proposed_data.level}</div>
                    )}
                    {proposal.proposed_data.level_number && (
                        <div><span className="font-semibold">Level Number:</span> {proposal.proposed_data.level_number}</div>
                    )}
                </div>
            </div>

            {/* Mentor Notes */}
            {proposal.mentor_notes && (
                <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <h4 className="text-xs font-bold text-blue-900 mb-1">MENTOR'S NOTES</h4>
                    <p className="text-sm text-blue-800 line-clamp-3">{proposal.mentor_notes}</p>
                </div>
            )}

            {/* Admin Notes (for reviewed proposals) */}
            {proposal.admin_notes && (
                <div className="mb-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                    <h4 className="text-xs font-bold text-purple-900 mb-1">ADMIN NOTES</h4>
                    <p className="text-sm text-purple-800">{proposal.admin_notes}</p>
                    {proposal.reviewed_by && (
                        <p className="text-xs text-purple-600 mt-2">
                            By {proposal.reviewed_by.name}
                        </p>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                {isPending && (
                    <>
                        <button
                            onClick={() => openReviewModal(proposal, 'approve')}
                            className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                        >
                            <ThumbsUp className="w-4 h-4" />
                            Approve
                        </button>
                        <button
                            onClick={() => openReviewModal(proposal, 'reject')}
                            className="flex-1 py-2 px-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                        >
                            <ThumbsDown className="w-4 h-4" />
                            Reject
                        </button>
                    </>
                )}
                <p className="text-xs text-slate-500">
                    {proposal.created_at}
                </p>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Review Proposals" />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">Review Proposals</h1>
                                <p className="text-slate-600">Review and approve mentor-submitted proposals</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <Clock className="w-10 h-10 text-yellow-600" />
                                <div>
                                    <p className="text-3xl font-bold text-yellow-900">
                                        {pendingProposals.length}
                                    </p>
                                    <p className="text-sm text-yellow-700">Proposals Awaiting Review</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Proposals */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-yellow-600" />
                            Pending Review ({pendingProposals.length})
                        </h2>
                        {pendingProposals.length === 0 ? (
                            <div className="bg-white rounded-2xl border-2 border-slate-200 p-12 text-center">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                                <p className="text-slate-600">There are no pending proposals to review.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingProposals.map(proposal => (
                                    <ProposalCard key={proposal.id} proposal={proposal} isPending={true} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Reviewed */}
                    {recentReviewed.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Eye className="w-6 h-6 text-slate-600" />
                                Recently Reviewed ({recentReviewed.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentReviewed.map(proposal => (
                                    <ProposalCard key={proposal.id} proposal={proposal} isPending={false} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedProposal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className={`p-6 border-b-4 ${reviewAction === 'approve' ? 'border-green-500' : 'border-red-500'}`}>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                {reviewAction === 'approve' ? (
                                    <>
                                        <ThumbsUp className="w-6 h-6 text-green-600" />
                                        Approve Proposal
                                    </>
                                ) : (
                                    <>
                                        <ThumbsDown className="w-6 h-6 text-red-600" />
                                        Reject Proposal
                                    </>
                                )}
                            </h2>
                            <p className="text-slate-600 mt-2">
                                {selectedProposal.type_label} by {selectedProposal.proposed_by.name}
                            </p>
                        </div>

                        <form onSubmit={reviewAction === 'approve' ? handleApprove : handleReject} className="p-6 space-y-4">
                            {/* Proposal Details */}
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h3 className="font-bold text-slate-900 mb-2">Proposal Details</h3>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-semibold">Program:</span> {selectedProposal.program?.name}</p>
                                    {selectedProposal.lesson && (
                                        <p><span className="font-semibold">Lesson:</span> {selectedProposal.lesson.title}</p>
                                    )}
                                    {selectedProposal.mentor_notes && (
                                        <p><span className="font-semibold">Mentor Notes:</span> {selectedProposal.mentor_notes}</p>
                                    )}
                                </div>
                            </div>

                            {/* Notes Field */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    {reviewAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                                </label>
                                <textarea
                                    value={reviewAction === 'approve' ? approveForm.data.admin_notes : rejectForm.data.admin_notes}
                                    onChange={(e) => reviewAction === 'approve'
                                        ? approveForm.setData('admin_notes', e.target.value)
                                        : rejectForm.setData('admin_notes', e.target.value)
                                    }
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
                                    rows="4"
                                    placeholder={reviewAction === 'approve'
                                        ? 'Add any notes for the mentor (optional)...'
                                        : 'Explain why this proposal is being rejected (required)...'
                                    }
                                    required={reviewAction === 'reject'}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={reviewAction === 'approve' ? approveForm.processing : rejectForm.processing}
                                    className={`flex-1 py-3 px-6 font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-white ${
                                        reviewAction === 'approve'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                                            : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                                    } disabled:from-slate-300 disabled:to-slate-400`}
                                >
                                    {(reviewAction === 'approve' ? approveForm.processing : rejectForm.processing) ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        reviewAction === 'approve' ? 'Approve & Apply' : 'Reject Proposal'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeReviewModal}
                                    className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg transition-colors"
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
