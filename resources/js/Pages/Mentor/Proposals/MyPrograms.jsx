import MentorLayout from "@/Layouts/MentorLayout";
import { Head, router, Link } from "@inertiajs/react";
import { GraduationCap, Plus, Clock, CheckCircle, XCircle, Calendar, FileEdit, Send, BookOpen, Layers, RotateCcw, AlertCircle } from "lucide-react";

/**
 * MyPrograms Component
 * Displays mentor's proposed programs and their approval status
 * Supports two-stage approval workflow:
 * 1. Initial Review: Admin approves the program concept
 * 2. Content Development: Mentor adds lessons/resources
 * 3. Final Review: Admin reviews complete program
 * 4. Approved: Program is public
 */
export default function MyPrograms({ programs }) {
    /**
     * Get icon based on approval status
     */
    const getStatusIcon = (status) => {
        const iconMap = {
            pending_initial_review: Clock,
            content_development: FileEdit,
            pending_final_review: AlertCircle,
            approved: CheckCircle,
            rejected: XCircle,
            pending: Clock,
        };
        return iconMap[status] || Clock;
    };

    /**
     * Handle submit for final review
     */
    const handleSubmitForFinalReview = (programSlug) => {
        if (confirm('Are you sure you want to submit this program for final review?\n\nMake sure you have added all lessons and resources before submitting.')) {
            router.post(route('mentor.proposals.programs.submit-final-review', programSlug), {}, {
                preserveScroll: true,
            });
        }
    };

    /**
     * Handle resubmit after rejection
     */
    const handleResubmit = (programSlug) => {
        if (confirm('Are you sure you want to resubmit this program for review?\n\nMake sure you have addressed the rejection feedback.')) {
            router.post(route('mentor.proposals.programs.resubmit', programSlug), {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <MentorLayout>
            <Head title="My Proposed Programs" />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900">
                                        My Proposed Programs
                                    </h1>
                                    <p className="text-slate-600 mt-1">
                                        Track your program proposals and their approval status
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('mentor.proposals.programs.create')}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                Propose New Program
                            </Link>
                        </div>
                    </div>

                    {/* Programs List */}
                    {programs.length === 0 ? (
                        <div className="bg-white rounded-2xl border-2 border-slate-200 p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                No Programs Proposed Yet
                            </h3>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                You haven't proposed any programs yet. Start by creating your first program proposal!
                            </p>
                            <Link
                                href={route('mentor.proposals.programs.create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Propose Your First Program
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {programs.map((program) => {
                                const StatusIcon = getStatusIcon(program.approval_status);

                                return (
                                    <div
                                        key={program.id}
                                        className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-purple-300 transition-colors"
                                    >
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
                                                <p className="text-slate-600 line-clamp-2">
                                                    {program.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Program Details */}
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold mb-1">Duration</p>
                                                <p className="text-sm font-bold text-slate-900">{program.duration}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold mb-1">Price</p>
                                                <p className="text-sm font-bold text-slate-900">${program.price}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold mb-1">Lessons</p>
                                                <p className="text-sm font-bold text-slate-900">{program.lessons_count}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold mb-1">Submitted</p>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {new Date(program.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold mb-1">Visibility</p>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {program.is_active ? 'Active' : 'Inactive'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Content Development Stage */}
                                        {program.can_add_content && (
                                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <FileEdit className="w-5 h-5 text-blue-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-blue-900 mb-1">
                                                            Add Your Content
                                                        </p>
                                                        <p className="text-xs text-blue-700">
                                                            Add all lessons and resources to your program, then submit for admin review.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={route('mentor.programs.content', program.slug)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                                    >
                                                        <BookOpen className="w-4 h-4" />
                                                        View & Manage Content
                                                    </Link>
                                                    {program.can_submit_for_final_review && (
                                                        <button
                                                            onClick={() => handleSubmitForFinalReview(program.slug)}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                            Submit for Review
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Approval/Rejection Details */}
                                        {program.approval_status === 'approved' && program.approved_at && (
                                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-green-900 mb-1">
                                                            Fully Approved on {new Date(program.approved_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-green-700 mb-2">
                                                            Your program is now live and available for student enrollment!
                                                        </p>
                                                        {program.approved_by && (
                                                            <p className="text-xs text-green-700">
                                                                Approved by {program.approved_by.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Rejected - Show resubmit option */}
                                        {program.approval_status === 'rejected' && program.rejected_at && (
                                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-red-900 mb-1">
                                                            Rejected on {new Date(program.rejected_at).toLocaleDateString()}
                                                        </p>
                                                        {program.rejection_reason && (
                                                            <p className="text-sm text-red-700 mt-2">
                                                                <strong>Reason:</strong> {program.rejection_reason}
                                                            </p>
                                                        )}
                                                        {program.approved_by && (
                                                            <p className="text-xs text-red-600 mt-2">
                                                                Reviewed by {program.approved_by.name}
                                                            </p>
                                                        )}
                                                        {program.can_resubmit && (
                                                            <div className="mt-3 pt-3 border-t border-red-200">
                                                                <p className="text-xs text-red-700 mb-2">
                                                                    You can make improvements based on the feedback and resubmit for review.
                                                                </p>
                                                                <button
                                                                    onClick={() => handleResubmit(program.slug)}
                                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                                                >
                                                                    <RotateCcw className="w-4 h-4" />
                                                                    Resubmit for Review
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Pending Initial Review - Admin needs to approve the concept first */}
                                        {program.approval_status === 'pending_initial_review' && (
                                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-yellow-900">
                                                            Awaiting Initial Approval
                                                        </p>
                                                        <p className="text-xs text-yellow-700 mt-1">
                                                            Your program proposal is being reviewed by an administrator.
                                                            Once approved, you can start adding lessons and resources.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Pending Final Review - Complete program is under review */}
                                        {program.approval_status === 'pending_final_review' && (
                                            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-orange-900">
                                                            Awaiting Final Approval
                                                        </p>
                                                        <p className="text-xs text-orange-700 mt-1">
                                                            Your complete program with {program.lessons_count} lesson{program.lessons_count !== 1 ? 's' : ''} is being reviewed.
                                                            Once approved, it will be available for student enrollment.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </MentorLayout>
    );
}
