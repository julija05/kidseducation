import MentorLayout from "@/Layouts/MentorLayout";
import { Head, router, Link } from "@inertiajs/react";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
    BookOpen,
    Users,
    Clock,
    Award,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    GraduationCap,
    Target,
    Sparkles,
    Calendar,
    BarChart3,
    Zap,
    Star,
    ChevronRight,
    PlayCircle,
    Copy,
    Link as LinkIcon,
    Plus,
    FileText,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard({
    user,
    availablePrograms,
    enrollments,
    pendingEnrollments,
    allStudents = [],
    invitationUrl,
    referralCode,
    referredStudentsCount = 0,
    upcomingMeetings = [],
}) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const copyInvitationLink = () => {
        if (invitationUrl) {
            navigator.clipboard.writeText(invitationUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleApplyToTeach = (programSlug) => {
        router.post(
            route("mentor.apply", programSlug),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const handleCancelApplication = (enrollmentId) => {
        if (
            confirm(t("mentor.dashboard.cancel_application_confirm") || "Are you sure you want to cancel this application?")
        ) {
            router.post(
                route("mentor.applications.cancel", enrollmentId),
                {},
                {
                    preserveScroll: true,
                }
            );
        }
    };

    const totalStudents = enrollments?.reduce((acc, enrollment) =>
        acc + (enrollment.students_count || 0), 0) || 0;

    const completionRate = enrollments?.length > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + (e.average_progress || 0), 0) / enrollments.length)
        : 0;

    return (
        <MentorLayout>
            <Head title={t("mentor.dashboard.title") || "Mentor Dashboard"} />

            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Modern Welcome Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 mb-2">
                                    Hey, {user.name} 👋
                                </h1>
                                <p className="text-lg text-slate-600">
                                    Ready to inspire minds today?
                                </p>
                            </div>
                            <div className="hidden md:flex items-center gap-3">
                                <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                                    {enrollments?.length || 0} Active Programs
                                </div>
                                <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                    {totalStudents} Students
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Modern Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
                    >
                        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-emerald-300 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                                    <BookOpen className="w-6 h-6 text-emerald-600" />
                                </div>
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{enrollments?.length || 0}</p>
                            <p className="text-sm text-slate-600 mt-1">Teaching Programs</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <Star className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{totalStudents}</p>
                            <p className="text-sm text-slate-600 mt-1">Active Students</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-amber-300 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{pendingEnrollments?.length || 0}</p>
                            <p className="text-sm text-slate-600 mt-1">Pending Applications</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-purple-300 transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                                    <Award className="w-6 h-6 text-purple-600" />
                                </div>
                                <Zap className="w-5 h-5 text-purple-500" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
                            <p className="text-sm text-slate-600 mt-1">Avg Completion</p>
                        </div>

                        {/* Schedule Meeting Card */}
                        <Link href={route('mentor.meetings.create')}>
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 border-2 border-emerald-400 hover:shadow-xl transition-all group cursor-pointer h-full">
                                <div className="flex flex-col items-center justify-center h-full text-white">
                                    <div className="p-3 bg-white/20 rounded-xl mb-3 group-hover:bg-white/30 transition-colors">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-center">Schedule Meeting</p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Create Program Proposal Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-8"
                    >
                        <Link href={route('mentor.proposals.programs.create')}>
                            <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl p-8 border-2 border-purple-400 hover:shadow-2xl transition-all group cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <div className="p-5 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:bg-white/30 transition-all group-hover:scale-110">
                                        <Plus className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                                            Create New Program Proposal
                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </h3>
                                        <p className="text-purple-100 text-base">
                                            Have an idea for a new educational program? Submit your proposal for admin review and start teaching your own course!
                                        </p>
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                                                <FileText className="w-4 h-4 text-white" />
                                                <span className="text-sm text-white font-medium">Easy submission process</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                                <span className="text-sm text-white font-medium">Admin review & approval</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                                        <Sparkles className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Upcoming Meetings Section */}
                    {upcomingMeetings && upcomingMeetings.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mb-8"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-black text-slate-900">Upcoming Meetings</h2>
                                <Link href={route('mentor.meetings.index')}>
                                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                                        View All
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {upcomingMeetings.map((meeting, index) => (
                                    <motion.div
                                        key={meeting.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.05 * index }}
                                        className="bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-emerald-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="font-bold text-slate-900 text-sm">{meeting.title}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                meeting.meeting_type === 'individual'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-purple-100 text-purple-700'
                                            }`}>
                                                {meeting.meeting_type === 'individual' ? 'Individual' : 'Group'}
                                            </span>
                                        </div>
                                        <div className="space-y-1 mb-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Calendar className="w-3 h-3 text-emerald-600" />
                                                <span>{new Date(meeting.scheduled_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Clock className="w-3 h-3 text-emerald-600" />
                                                <span>{new Date(meeting.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({meeting.duration_minutes}min)</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Users className="w-3 h-3 text-emerald-600" />
                                                <span>{meeting.participants_count} student{meeting.participants_count > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                        <Link href={route('mentor.meetings.show', meeting.id)}>
                                            <button className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-lg font-semibold transition-all">
                                                View Details
                                            </button>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Invitation Link Section */}
                    {invitationUrl && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mb-8"
                        >
                            <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-xl overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                                            <LinkIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-1">
                                                Share Your Invitation Link
                                            </h3>
                                            <p className="text-sm text-white/90">
                                                Get students enrolled directly under your mentorship
                                            </p>
                                        </div>
                                        {referredStudentsCount > 0 && (
                                            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                                <p className="text-2xl font-bold text-white">{referredStudentsCount}</p>
                                                <p className="text-xs text-white/90">Student{referredStudentsCount > 1 ? 's' : ''}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Link Section */}
                                <div className="p-6 bg-gray-50">
                                    <div className="flex flex-col gap-3">
                                        {/* URL Display */}
                                        <div className="flex items-center gap-3 bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                                            <div className="flex-1 min-w-0">
                                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">
                                                    Your Invitation Link
                                                </label>
                                                <code className="text-sm font-mono text-gray-900 block truncate">
                                                    {invitationUrl}
                                                </code>
                                            </div>
                                            <button
                                                onClick={copyInvitationLink}
                                                className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                                                    copied
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                                                }`}
                                            >
                                                {copied ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        Copy Link
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Referral Code */}
                                        {referralCode && (
                                            <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Referral Code:
                                                </span>
                                                <code className="text-sm font-mono font-bold text-indigo-700 bg-white px-3 py-1 rounded border border-indigo-300">
                                                    {referralCode}
                                                </code>
                                            </div>
                                        )}

                                        {/* Success Message */}
                                        {referredStudentsCount > 0 && (
                                            <div className="flex items-center gap-2 bg-green-50 text-green-800 rounded-lg p-3 border border-green-200">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <p className="text-sm font-medium">
                                                    {referredStudentsCount} student{referredStudentsCount > 1 ? 's have' : ' has'} enrolled using your invitation link!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Pending Applications */}
                    {pendingEnrollments && pendingEnrollments.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8"
                        >
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">
                                            {pendingEnrollments.length} Pending Application{pendingEnrollments.length > 1 ? 's' : ''}
                                        </h3>
                                        <p className="text-amber-50 mb-4">
                                            Your applications are being reviewed by the admin team
                                        </p>
                                        <div className="space-y-2">
                                            {pendingEnrollments.map((enrollment) => (
                                                <div
                                                    key={enrollment.id}
                                                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="font-semibold">{enrollment.program.name}</p>
                                                        <p className="text-sm text-amber-100">
                                                            Applied {new Date(enrollment.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCancelApplication(enrollment.id)}
                                                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* My Programs - Modern Card Design */}
                    {enrollments && enrollments.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">My Teaching Programs</h2>
                                    <p className="text-slate-600 mt-1">Click to manage lessons and students</p>
                                </div>
                                <Link href={route('mentor.proposals.programs.my-programs')}>
                                    <button className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
                                        <FileText className="w-5 h-5" />
                                        My Proposed Programs
                                    </button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {enrollments.map((enrollment, index) => (
                                    <Link
                                        key={enrollment.id}
                                        href={route("mentor.programs.show", enrollment.program.slug)}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="group bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-400 p-6 transition-all hover:shadow-xl cursor-pointer"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                                    <BookOpen className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                                                {enrollment.program.name}
                                                            </h3>
                                                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                                {enrollment.program.description}
                                                            </p>
                                                        </div>
                                                        <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Users className="w-4 h-4 text-blue-600" />
                                                                <span className="text-xs text-slate-600">Students</span>
                                                            </div>
                                                            <p className="text-2xl font-bold text-slate-900">
                                                                {enrollment.students_count || 0}
                                                            </p>
                                                        </div>

                                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                                                <span className="text-xs text-slate-600">Progress</span>
                                                            </div>
                                                            <p className="text-2xl font-bold text-emerald-600">
                                                                {enrollment.average_progress || 0}%
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex items-center gap-2 text-emerald-600 font-semibold">
                                                        <PlayCircle className="w-5 h-5" />
                                                        <span>Open Teaching Dashboard</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* All Students Section */}
                    {allStudents && allStudents.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="mb-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">My Students</h2>
                                    <p className="text-slate-600 mt-1">Track progress across all programs</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allStudents.slice(0, 9).map((student, index) => (
                                        <motion.div
                                            key={student.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.05 * index }}
                                            className="p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-white transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 text-sm truncate">
                                                        {student.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-600 truncate mb-1">
                                                        {student.email}
                                                    </p>
                                                    <p className="text-xs text-emerald-600 font-semibold truncate">
                                                        {student.program_name}
                                                    </p>

                                                    {/* Progress Bar */}
                                                    <div className="mt-2">
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className="text-slate-600">Progress</span>
                                                            <span className="font-semibold text-emerald-600">
                                                                {Math.round(student.progress || 0)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                            <div
                                                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-1.5 rounded-full transition-all"
                                                                style={{ width: `${student.progress || 0}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="mt-2 flex items-center gap-3 text-xs">
                                                        <div className="flex items-center gap-1 text-slate-600">
                                                            <Award className="w-3 h-3" />
                                                            <span>{student.quiz_points || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-slate-600">
                                                            <TrendingUp className="w-3 h-3" />
                                                            <span>L{student.highest_unlocked_level || 1}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {allStudents.length > 9 && (
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-slate-600">
                                            Showing 9 of {allStudents.length} students
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Available Programs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-slate-900">Explore Programs</h2>
                            <p className="text-slate-600 mt-1">Apply to teach new subjects and grow your impact</p>
                        </div>

                        {availablePrograms && availablePrograms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availablePrograms.map((program, index) => {
                                    const isEnrolled = enrollments?.some((e) => e.program.id === program.id);
                                    const isPending = pendingEnrollments?.some((e) => e.program.id === program.id);

                                    return (
                                        <motion.div
                                            key={program.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
                                        >
                                            <div className="h-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400"></div>
                                            <div className="p-6">
                                                <div className="flex items-start gap-3 mb-4">
                                                    <div className="p-3 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl">
                                                        <BookOpen className="w-6 h-6 text-teal-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                                                            {program.name}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 line-clamp-2">
                                                            {program.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                                                    <BookOpen className="w-4 h-4" />
                                                    <span>{program.lessons_count} Lessons</span>
                                                </div>

                                                {isEnrolled ? (
                                                    <Link
                                                        href={route("mentor.programs.show", program.slug)}
                                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all"
                                                    >
                                                        <PlayCircle className="w-5 h-5" />
                                                        Open Dashboard
                                                    </Link>
                                                ) : isPending ? (
                                                    <button
                                                        disabled
                                                        className="w-full py-3 px-4 bg-amber-50 text-amber-700 border-2 border-amber-200 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        <Clock className="w-5 h-5" />
                                                        Pending Approval
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApplyToTeach(program.slug)}
                                                        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group"
                                                    >
                                                        Apply to Teach
                                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
                                <Sparkles className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600">No programs available at the moment</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </MentorLayout>
    );
}
