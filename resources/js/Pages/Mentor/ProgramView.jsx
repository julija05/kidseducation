import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link } from "@inertiajs/react";
import { useTranslation } from "@/hooks/useTranslation";
import {
    Users,
    BookOpen,
    TrendingUp,
    Award,
    ChevronRight,
    GraduationCap,
    ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProgramView({ program, students, lessons, mentorEnrollment }) {
    const { t } = useTranslation();

    const totalLevels = Object.keys(lessons).length;

    return (
        <MentorLayout>
            <Head title={`${program.name} - ${t("mentor.program.teaching_view") || "Teaching View"}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href={route("mentor.dashboard")}
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {t("navigation.back_to") || "Back to"} {t("nav.dashboard")}
                </Link>

                {/* Program Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-gray-200 shadow-lg"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                                {program.name}
                            </h1>
                            <p className="text-gray-600 mb-4">{program.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-emerald-600" />
                                    {students.length} {t("mentor.program.students") || "Students"}
                                </span>
                                <span className="flex items-center">
                                    <BookOpen className="w-4 h-4 mr-2 text-emerald-600" />
                                    {program.lessons_count} {t("lessons.title") || "Lessons"}
                                </span>
                                <span className="flex items-center">
                                    <GraduationCap className="w-4 h-4 mr-2 text-emerald-600" />
                                    {totalLevels} {t("dashboard.level") || "Levels"}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Students List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <Users className="w-6 h-6 mr-2 text-emerald-600" />
                        {t("mentor.program.enrolled_students") || "Enrolled Students"}
                    </h2>

                    {students.length > 0 ? (
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-emerald-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                {t("form.student_name") || "Student Name"}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                {t("form.email")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                {t("dashboard.progress")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                {t("dashboard.quiz_points")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                {t("mentor.program.current_level") || "Current Level"}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                {t("dashboard.status")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map((student, index) => (
                                            <motion.tr
                                                key={student.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-emerald-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {student.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {student.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                            <div
                                                                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
                                                                style={{ width: `${student.progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-700 font-medium">
                                                            {student.progress}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm">
                                                        <Award className="w-4 h-4 mr-1 text-amber-500" />
                                                        <span className="font-medium">{student.quiz_points}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {t("dashboard.level")} {student.highest_unlocked_level}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            student.status === "active"
                                                                ? "bg-green-100 text-green-800"
                                                                : student.status === "completed"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {student.status}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-12 text-center border border-gray-200">
                            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-600">
                                {t("mentor.program.no_students") ||
                                    "No students enrolled yet"}
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Program Content Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <BookOpen className="w-6 h-6 mr-2 text-teal-600" />
                        {t("mentor.program.program_content") || "Program Content"}
                    </h2>

                    <div className="space-y-4">
                        {Object.entries(lessons).map(([level, levelLessons]) => (
                            <div
                                key={level}
                                className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-sm"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    {t("dashboard.level")} {level} ({levelLessons.length}{" "}
                                    {t("lessons.title")})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {levelLessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">
                                                    {lesson.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {lesson.resources_count} {t("lessons.resources") || "resources"}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </MentorLayout>
    );
}
