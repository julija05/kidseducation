import { Head, Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    GraduationCap,
    User,
    BookOpen,
    CheckCircle,
    ArrowRight,
    Users,
    Award,
    Clock,
} from "lucide-react";
import GuessFrontLayout from "@/Layouts/GuessFrontLayout";

export default function Show({
    mentor,
    program,
    referralCode,
    isAuthenticated,
    isEnrolled,
    existingEnrollment,
}) {
    const handleEnroll = () => {
        router.post(route("mentor.invite.enroll", referralCode));
    };

    return (
        <GuessFrontLayout>
            <Head title={`Join ${program.translated_name || program.name} with ${mentor.name}`} />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8"
                    >
                        {/* Header with Mentor Info */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-sm text-indigo-100 mb-1">
                                        You've been invited by
                                    </p>
                                    <h1 className="text-3xl font-bold">
                                        {mentor.first_name && mentor.last_name
                                            ? `${mentor.first_name} ${mentor.last_name}`
                                            : mentor.name}
                                    </h1>
                                </div>
                            </div>
                            <p className="text-lg text-indigo-100">
                                Join an exclusive learning experience with direct mentorship!
                            </p>
                        </div>

                        {/* Program Details */}
                        <div className="p-8">
                            <div className="flex items-start gap-6 mb-8">
                                {program.image_path && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={program.image_path}
                                            alt={program.translated_name || program.name}
                                            className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                        {program.translated_name || program.name}
                                    </h2>
                                    <p className="text-lg text-gray-600 mb-4">
                                        {program.translated_description || program.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="flex items-center gap-2 text-indigo-600 font-semibold">
                                            <BookOpen className="w-4 h-4" />
                                            {program.total_lessons} Lessons
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits Section */}
                            <div className="bg-indigo-50 rounded-2xl p-6 mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    What you'll get:
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Direct Mentorship
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Get personalized guidance from your mentor
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Structured Learning
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Follow a proven curriculum
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Progress Tracking
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Monitor your growth and achievements
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Exclusive Support
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Get help when you need it
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="space-y-4">
                                {isEnrolled ? (
                                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            You're Already Enrolled!
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {existingEnrollment?.approval_status === "pending"
                                                ? "Your enrollment is pending approval."
                                                : "Continue your learning journey!"}
                                        </p>
                                        <Link
                                            href={route("dashboard")}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                                        >
                                            Go to Dashboard
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                ) : isAuthenticated ? (
                                    <button
                                        onClick={handleEnroll}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-4 px-6 font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                    >
                                        <GraduationCap className="w-6 h-6" />
                                        Enroll Now with {mentor.first_name || mentor.name}
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-center text-gray-600 mb-4">
                                            Create an account to enroll in this program
                                        </p>
                                        <Link
                                            href={route("register")}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-4 px-6 font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                        >
                                            <GraduationCap className="w-6 h-6" />
                                            Sign Up to Enroll
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                        <p className="text-center text-sm text-gray-500">
                                            Already have an account?{" "}
                                            <Link
                                                href={route("login")}
                                                className="text-indigo-600 font-semibold hover:underline"
                                            >
                                                Sign In
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                            <div className="p-3 bg-indigo-100 rounded-full w-fit mx-auto mb-3">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Expert Mentors</h4>
                            <p className="text-sm text-gray-600">
                                Learn from experienced educators
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Quality Content</h4>
                            <p className="text-sm text-gray-600">
                                Carefully crafted lessons
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                            <div className="p-3 bg-pink-100 rounded-full w-fit mx-auto mb-3">
                                <Clock className="w-6 h-6 text-pink-600" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Learn at Your Pace</h4>
                            <p className="text-sm text-gray-600">
                                Flexible learning schedule
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </GuessFrontLayout>
    );
}
