// resources/js/Pages/Front/Programs/Show.jsx
import React from "react";
import { usePage, Link } from "@inertiajs/react";
import ProgramDetailsSection from "@/Components/ProgramDetailsSection";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";

export default function ProgramDetail({ auth }) {
    const { program, userEnrollment } = usePage().props;

    const handleEnrollClick = () => {
        // Save program ID to session storage before redirecting
        sessionStorage.setItem("pending_enrollment_program_id", program.id);
    };

    const getEnrollmentSection = () => {
        if (!auth.user) {
            // Not logged in - show registration/login options
            return (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 mt-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Ready to Learn?
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Please create an account to enroll in this program
                        </p>

                        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                            <Link
                                href={route("register", {
                                    program: program.id,
                                })}
                                onClick={handleEnrollClick}
                                className="block sm:inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                Create Account & Enroll
                            </Link>
                            <Link
                                href={route("login")}
                                onClick={handleEnrollClick}
                                className="block sm:inline-block bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                            >
                                I Have an Account
                            </Link>
                        </div>

                        <p className="text-sm text-gray-500 mt-6">
                            After creating your account, you'll be asked to
                            confirm your enrollment
                        </p>
                    </div>
                </div>
            );
        }

        // User is logged in - check enrollment status
        if (userEnrollment) {
            switch (userEnrollment.approval_status) {
                case "pending":
                    return (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 mt-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                                    <svg
                                        className="w-8 h-8 text-yellow-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-yellow-800 mb-2">
                                    Enrollment Pending
                                </h3>
                                <p className="text-yellow-700">
                                    Your enrollment request is being reviewed.
                                    We'll notify you at{" "}
                                    <strong>{auth.user.email}</strong> once it's
                                    approved!
                                </p>
                                <p className="text-sm text-yellow-600 mt-4">
                                    Requested on:{" "}
                                    {new Date(
                                        userEnrollment.created_at
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    );

                case "approved":
                    return (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 mt-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <svg
                                        className="w-8 h-8 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-green-800 mb-4">
                                    You're Enrolled! 🎉
                                </h3>
                                <Link
                                    href={route("dashboard")}
                                    className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                                >
                                    Go to Learning Dashboard
                                </Link>
                            </div>
                        </div>
                    );

                case "rejected":
                    return (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 mt-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                    <svg
                                        className="w-8 h-8 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-red-800 mb-2">
                                    Enrollment Not Approved
                                </h3>
                                <p className="text-red-700">
                                    {userEnrollment.rejection_reason ||
                                        "Please contact us at support@abacoding.com for more information."}
                                </p>
                            </div>
                        </div>
                    );
            }
        }

        // Logged in but not enrolled
        return (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 mt-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Ready to Start Learning?
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        You're logged in! Click below to request enrollment in{" "}
                        {program.name}
                    </p>
                    <Link
                        href={route("dashboard")}
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        Go to Dashboard to Enroll
                    </Link>
                    <p className="text-sm text-gray-500 mt-4">
                        You'll be asked to confirm your enrollment on the
                        dashboard
                    </p>
                </div>
            </div>
        );
    };

    return (
        <GuestFrontLayout auth={auth}>
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <ProgramDetailsSection program={program} />
                {getEnrollmentSection()}
            </div>
        </GuestFrontLayout>
    );
}
