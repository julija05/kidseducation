// resources/js/Components/Dashboard/ProgramList.jsx
import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
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
            // Not enrolled - show View Details button
            return (
                <Link
                    href={route("dashboard.programs.show", program.slug)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-opacity flex items-center justify-center"
                >
                    View Details
                    <ArrowRight size={18} className="ml-2" />
                </Link>
            );
        }

        // Check enrollment status
        switch (enrollment.approval_status) {
            case "pending":
                return (
                    <button
                        disabled
                        className="w-full bg-yellow-100 text-yellow-800 py-3 rounded-lg font-medium cursor-not-allowed flex items-center justify-center"
                    >
                        <Clock size={18} className="mr-2" />
                        Enrollment Pending
                    </button>
                );
            case "approved":
                return (
                    <Link
                        href={route("dashboard.programs.show", program.slug)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-opacity flex items-center justify-center"
                    >
                        Continue Learning
                        <ArrowRight size={18} className="ml-2" />
                    </Link>
                );
            case "rejected":
                return (
                    <button
                        disabled
                        className="w-full bg-red-100 text-red-800 py-3 rounded-lg font-medium cursor-not-allowed flex items-center justify-center"
                    >
                        Enrollment Rejected
                    </button>
                );
            default:
                return (
                    <Link
                        href={route("dashboard.programs.show", program.slug)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-opacity flex items-center justify-center"
                    >
                        View Details
                        <ArrowRight size={18} className="ml-2" />
                    </Link>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Available Programs
                </h2>
                <p className="text-lg text-gray-600">
                    Choose a program below to start your learning journey
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programs.map((program) => {
                    const Icon = iconMap[program.icon] || BookOpen;
                    const enrollment = enrollmentMap[program.id];
                    const isPending = enrollment?.approval_status === "pending";
                    const isApproved =
                        enrollment?.approval_status === "approved";

                    return (
                        <div
                            key={program.id}
                            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative ${
                                isPending ? "ring-2 ring-yellow-400" : ""
                            } ${isApproved ? "ring-2 ring-green-400" : ""}`}
                        >
                            {/* Status badge overlay */}
                            {enrollment && (
                                <div className="absolute top-4 right-4 z-10">
                                    {isPending && (
                                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                            Pending
                                        </span>
                                    )}
                                    {isApproved && (
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                            ✓ Enrolled
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="bg-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <Icon className="text-gray-700" size={48} />
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        ${program.price}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    {program.name}
                                </h3>
                                <p className="text-gray-700">
                                    {program.description}
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span>Duration: {program.duration}</span>
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
