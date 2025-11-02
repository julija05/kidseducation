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
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard({
    user,
    availablePrograms,
    enrollments,
    pendingEnrollments,
}) {
    const { t } = useTranslation();
    const [selectedProgram, setSelectedProgram] = useState(null);

    const handleApplyToTeach = (programSlug) => {
        router.post(
            route("mentor.apply", programSlug),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Handle success
                },
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

    return (
        <MentorLayout>
            <Head title={t("mentor.dashboard.title") || "Mentor Dashboard"} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        {t("mentor.dashboard.welcome", { name: user.name }) ||
                            `Welcome, ${user.name}!`}
                    </h1>
                    <p className="text-gray-600">
                        {t("mentor.dashboard.subtitle") ||
                            "Manage your programs and track your progress"}
                    </p>
                </motion.div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    {t("mentor.dashboard.enrolled_programs") ||
                                        "Enrolled Programs"}
                                </p>
                                <p className="text-3xl font-bold text-emerald-600">
                                    {enrollments?.length || 0}
                                </p>
                            </div>
                            <BookOpen className="w-12 h-12 text-emerald-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    {t("mentor.dashboard.pending_approvals") ||
                                        "Pending Approvals"}
                                </p>
                                <p className="text-3xl font-bold text-amber-600">
                                    {pendingEnrollments?.length || 0}
                                </p>
                            </div>
                            <Clock className="w-12 h-12 text-amber-200" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    {t("mentor.dashboard.available_programs") ||
                                        "Available Programs"}
                                </p>
                                <p className="text-3xl font-bold text-teal-600">
                                    {availablePrograms?.length || 0}
                                </p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-teal-200" />
                        </div>
                    </motion.div>
                </div>

                {/* Pending Enrollments */}
                {pendingEnrollments && pendingEnrollments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <AlertCircle className="w-6 h-6 mr-2 text-amber-600" />
                            {t("mentor.dashboard.pending_applications") ||
                                "Pending Applications"}
                        </h2>
                        <div className="space-y-4">
                            {pendingEnrollments.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="bg-amber-50/70 backdrop-blur-lg rounded-2xl p-6 border border-amber-200 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800">
                                                {enrollment.program.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {t("mentor.dashboard.applied_on") || "Applied on"}{" "}
                                                {new Date(
                                                    enrollment.created_at
                                                ).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-amber-700 mt-1">
                                                {t("mentor.dashboard.waiting_admin_approval") ||
                                                    "Waiting for admin approval to start teaching"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleCancelApplication(
                                                    enrollment.id
                                                )
                                            }
                                            className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 transition-colors"
                                        >
                                            {t("mentor.dashboard.cancel_application") ||
                                                "Cancel Application"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Active Enrollments */}
                {enrollments && enrollments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <CheckCircle className="w-6 h-6 mr-2 text-emerald-600" />
                            {t("mentor.dashboard.my_programs") ||
                                "My Programs"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {enrollments.map((enrollment) => (
                                <Link
                                    key={enrollment.id}
                                    href={route("mentor.programs.show", enrollment.program.slug)}
                                    className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:scale-105 cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                                                {enrollment.program.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {enrollment.program.description}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <BookOpen className="w-4 h-4 mr-1" />
                                            {t("mentor.program.view_students") || "View Students"}
                                        </span>
                                        <span className="text-emerald-600 font-medium group-hover:underline">
                                            {t("mentor.program.teach") || "Teach"} →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Available Programs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <BookOpen className="w-6 h-6 mr-2 text-teal-600" />
                        {t("mentor.dashboard.available_programs") ||
                            "Available Programs"}
                    </h2>

                    {availablePrograms && availablePrograms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availablePrograms.map((program) => {
                                const isEnrolled = enrollments?.some(
                                    (e) => e.program.id === program.id
                                );
                                const isPending = pendingEnrollments?.some(
                                    (e) => e.program.id === program.id
                                );

                                return (
                                    <div
                                        key={program.id}
                                        className="bg-white/70 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                {program.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                {program.description}
                                            </p>

                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                <span>
                                                    {program.lessons_count}{" "}
                                                    {t("lessons.title") ||
                                                        "Lessons"}
                                                </span>
                                            </div>

                                            {isEnrolled ? (
                                                <Link
                                                    href={route("mentor.programs.show", program.slug)}
                                                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center group"
                                                >
                                                    {t("mentor.dashboard.go_to_teaching") ||
                                                        "Go to Teaching Dashboard"}
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            ) : isPending ? (
                                                <button
                                                    disabled
                                                    className="w-full py-3 px-4 bg-amber-100 text-amber-700 rounded-lg font-semibold cursor-not-allowed"
                                                >
                                                    {t(
                                                        "dashboard.pending_approval"
                                                    ) || "Pending Approval"}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleApplyToTeach(program.slug)
                                                    }
                                                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center group"
                                                >
                                                    {t("mentor.dashboard.apply_to_teach") ||
                                                        "Apply to Teach"}
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-12 text-center border border-gray-200">
                            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-600">
                                {t("mentor.dashboard.no_programs") ||
                                    "No programs available at the moment"}
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </MentorLayout>
    );
}
