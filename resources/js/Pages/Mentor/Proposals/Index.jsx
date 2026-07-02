import MentorLayout from "@/Layouts/MentorLayout";
import { Head } from "@inertiajs/react";
import { FileText, Clock, CheckCircle, XCircle, Layers } from "lucide-react";
import { PROPOSAL_STATUS } from "@/Constants/proposalConstants";

export default function ProposalsIndex({ proposals }) {
    // Group proposals by status
    const groupedProposals = {
        [PROPOSAL_STATUS.PENDING]: proposals.filter(p => p.status === PROPOSAL_STATUS.PENDING),
        [PROPOSAL_STATUS.APPROVED]: proposals.filter(p => p.status === PROPOSAL_STATUS.APPROVED || p.status === PROPOSAL_STATUS.APPLIED),
        [PROPOSAL_STATUS.REJECTED]: proposals.filter(p => p.status === PROPOSAL_STATUS.REJECTED),
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case PROPOSAL_STATUS.PENDING:
                return <Clock className="w-5 h-5" />;
            case PROPOSAL_STATUS.APPROVED:
            case PROPOSAL_STATUS.APPLIED:
                return <CheckCircle className="w-5 h-5" />;
            case PROPOSAL_STATUS.REJECTED:
                return <XCircle className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const getStatusStyle = (status) => {
        if (status === PROPOSAL_STATUS.PENDING) return "border-amber-200 bg-amber-50 text-amber-700";
        if (status === PROPOSAL_STATUS.APPROVED || status === PROPOSAL_STATUS.APPLIED) return "border-emerald-200 bg-emerald-50 text-emerald-700";
        if (status === PROPOSAL_STATUS.REJECTED) return "border-red-200 bg-red-50 text-red-700";

        return "border-slate-200 bg-slate-50 text-slate-700";
    };

    const ProposalCard = ({ proposal }) => (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.4)] transition hover:border-blue-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(proposal.status)}`}>
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
                </div>
                <div className="text-slate-400">
                    {getStatusIcon(proposal.status)}
                </div>
            </div>

            {/* Proposed Changes Summary */}
            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
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
                <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-1">YOUR NOTES</h4>
                    <p className="text-sm text-slate-600 line-clamp-2">{proposal.mentor_notes}</p>
                </div>
            )}

            {/* Admin Notes (if rejected or approved) */}
            {proposal.admin_notes && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
                    <h4 className="text-xs font-bold text-blue-900 mb-1">ADMIN FEEDBACK</h4>
                    <p className="text-sm text-blue-800">{proposal.admin_notes}</p>
                    {proposal.reviewed_by && (
                        <p className="text-xs text-blue-600 mt-2">
                            Reviewed by {proposal.reviewed_by.name}
                        </p>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
                <span>Submitted {proposal.created_at}</span>
                {proposal.reviewed_at && (
                    <span>Reviewed {proposal.reviewed_at}</span>
                )}
            </div>
        </div>
    );

    return (
        <MentorLayout>
            <Head title="My Proposals" />

            <div className="-mx-4 -my-6 min-h-screen bg-slate-50 sm:-mx-6 lg:-mx-8">
                <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">My Proposals</h1>
                                <p className="mt-1 text-sm text-slate-600 sm:text-base">Track your submitted proposals and their status.</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Clock className="h-5 w-5" /></span>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {groupedProposals[PROPOSAL_STATUS.PENDING].length}
                                        </p>
                                        <p className="text-sm text-slate-500">Pending Review</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle className="h-5 w-5" /></span>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {groupedProposals[PROPOSAL_STATUS.APPROVED].length}
                                        </p>
                                        <p className="text-sm text-slate-500">Approved</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><XCircle className="h-5 w-5" /></span>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {groupedProposals[PROPOSAL_STATUS.REJECTED].length}
                                        </p>
                                        <p className="text-sm text-slate-500">Rejected</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Proposals List */}
                    {proposals.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                            <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Proposals Yet</h3>
                            <p className="text-slate-600">
                                You haven't submitted any proposals yet. Navigate to a program to start proposing changes.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Pending Proposals */}
                            {groupedProposals[PROPOSAL_STATUS.PENDING].length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-yellow-600" />
                                        Pending Review ({groupedProposals[PROPOSAL_STATUS.PENDING].length})
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {groupedProposals[PROPOSAL_STATUS.PENDING].map(proposal => (
                                            <ProposalCard key={proposal.id} proposal={proposal} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Approved Proposals */}
                            {groupedProposals[PROPOSAL_STATUS.APPROVED].length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Approved ({groupedProposals[PROPOSAL_STATUS.APPROVED].length})
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {groupedProposals[PROPOSAL_STATUS.APPROVED].map(proposal => (
                                            <ProposalCard key={proposal.id} proposal={proposal} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rejected Proposals */}
                            {groupedProposals[PROPOSAL_STATUS.REJECTED].length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        Rejected ({groupedProposals[PROPOSAL_STATUS.REJECTED].length})
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {groupedProposals[PROPOSAL_STATUS.REJECTED].map(proposal => (
                                            <ProposalCard key={proposal.id} proposal={proposal} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MentorLayout>
    );
}
