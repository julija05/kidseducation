// resources/js/Components/Dashboard/ProgramList.jsx
import React from "react";
import { Link, router } from "@inertiajs/react";
import { ArrowRight, BookOpen, Clock, Star, Sparkles } from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";

export default function ProgramList({ programs, userEnrollments = [] }) {
    // Create a map of program enrollments for quick lookup
    const enrollmentMap = userEnrollments.reduce((acc, enrollment) => {
        acc[enrollment.program?.id || enrollment.program_id] = enrollment;
        return acc;
    }, {});

    const getButtonContent = (program) => {
        const enrollment = enrollmentMap[program.id];

        if (!enrollment) {
            // Not enrolled - show View Details button that goes to dashboard program show
            return (
                <Link
                    href={route("dashboard.programs.show", program.slug)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    🔍 Explore This Adventure!
                    <ArrowRight size={20} className="ml-2" />
                </Link>
            );
        }

        // Check enrollment status
        switch (enrollment.approval_status) {
            case "pending":
                return (
                    <button
                        disabled
                        className="w-full bg-gradient-to-r from-yellow-300 to-orange-400 text-white py-4 rounded-xl font-bold text-lg cursor-not-allowed flex items-center justify-center shadow-lg opacity-75"
                    >
                        <Clock size={20} className="mr-2" />
                        ⏳ Waiting for Approval!
                    </button>
                );
            case "approved":
                return (
                    <button
                        onClick={() =>
                            router.visit(
                                route("dashboard.programs.show", program.slug)
                            )
                        }
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        🚀 Continue Learning!
                        <ArrowRight size={20} className="ml-2" />
                    </button>
                );
            case "rejected":
                return (
                    <button
                        disabled
                        className="w-full bg-gradient-to-r from-red-300 to-pink-400 text-white py-4 rounded-xl font-bold text-lg cursor-not-allowed flex items-center justify-center shadow-lg opacity-75"
                    >
                        😞 Enrollment Not Approved
                    </button>
                );
            default:
                return (
                    <Link
                        href={route("dashboard.programs.show", program.slug)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        🔍 Explore This Adventure!
                        <ArrowRight size={20} className="ml-2" />
                    </Link>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center">
                    <Sparkles className="mr-3 text-yellow-500" size={36} />
                    Amazing Learning Adventures!
                    <Sparkles className="ml-3 text-yellow-500" size={36} />
                </h2>
                <p className="text-xl text-gray-600">
                    Pick your favorite adventure and let's start learning! 🚀
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {programs.map((program) => {
                    const Icon = iconMap[program.icon] || BookOpen;
                    const enrollment = enrollmentMap[program.id];
                    const isPending = enrollment?.approval_status === "pending";
                    const isApproved =
                        enrollment?.approval_status === "approved";

                    return (
                        <div
                            key={program.id}
                            className={`bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden relative ${
                                isPending ? "ring-4 ring-yellow-400 ring-opacity-60" : ""
                            } ${isApproved ? "ring-4 ring-green-400 ring-opacity-60" : ""}`}
                        >
                            {/* Status badge overlay */}
                            {enrollment && (
                                <div className="absolute top-4 right-4 z-10">
                                    {isPending && (
                                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse flex items-center">
                                            <Clock size={16} className="mr-1" />
                                            Pending ⏳
                                        </span>
                                    )}
                                    {isApproved && (
                                        <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                                            <Star size={16} className="mr-1" />
                                            Enrolled! ✨
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-white rounded-full p-4 shadow-lg">
                                        <Icon className="text-blue-600" size={48} />
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                                            ${program.price}
                                        </span>
                                        <div className="text-sm text-gray-600 mt-1">Super Value! 💎</div>
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-3 leading-tight">
                                    {program.name}
                                </h3>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    {program.description}
                                </p>
                            </div>

                            <div className="p-6 bg-white">
                                <div className="flex items-center justify-between text-lg text-gray-600 mb-6 bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <Clock size={20} className="mr-2 text-blue-500" />
                                        <span className="font-medium">{program.duration}</span>
                                    </div>
                                    {program.lessonsCount && (
                                        <div className="flex items-center">
                                            <BookOpen size={20} className="mr-2 text-green-500" />
                                            <span className="font-medium">{program.lessonsCount} lessons</span>
                                        </div>
                                    )}
                                </div>

                                {getButtonContent(program)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
