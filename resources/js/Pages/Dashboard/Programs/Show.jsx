import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ProgramDetailsSection from "@/Components/ProgramDetailsSection";
import EnrollmentConfirmationModal from "@/Components/Dashboard/EnrollmentConfirmationModal";
import PendingEnrollment from "@/Components/Dashboard/PendingEnrollment";

export default function DashboardProgramShow({ auth }) {
    const { program, userEnrollment } = usePage().props;
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);

    const handleEnrollClick = () => {
        setShowConfirmModal(true);
    };

    const handleConfirmEnrollment = () => {
        setIsEnrolling(true);

        router.post(
            route("programs.enroll", program.slug),
            {},
            {
                onSuccess: () => {
                    setShowConfirmModal(false);
                    setIsEnrolling(false);
                },
                onError: () => {
                    setIsEnrolling(false);
                    alert("An error occurred. Please try again.");
                },
            }
        );
    };

    const getEnrollmentSection = () => {
        if (userEnrollment) {
            switch (userEnrollment.approval_status) {
                case "pending":
                    return <PendingEnrollment enrollment={userEnrollment} />;

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
                                <p className="text-green-700 mb-4">
                                    You have full access to this program.
                                </p>
                                <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors">
                                    Start Learning
                                </button>
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

        // Not enrolled - show enroll button
        return (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 mt-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Ready to Start Learning?
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Click below to enroll in {program.name}
                    </p>
                    <button
                        onClick={handleEnrollClick}
                        disabled={isEnrolling}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEnrolling ? "Processing..." : "Enroll Now"}
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                        Your enrollment will be reviewed by our team
                    </p>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <ProgramDetailsSection program={program} />
                {getEnrollmentSection()}
            </div>

            {showConfirmModal && (
                <EnrollmentConfirmationModal
                    program={program}
                    onConfirm={handleConfirmEnrollment}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}
