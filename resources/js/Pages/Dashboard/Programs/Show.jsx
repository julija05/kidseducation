// resources/js/Pages/Dashboard/Programs/Show.jsx
import React, { useState } from "react";
import { Head, router, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    EnrollmentConfirmationModal,
    PendingEnrollment,
    ProgramContent,
    ProgressOverview,
} from "@/Components/Dashboard";
import ProgramDetailsSection from "@/Components/ProgramDetailsSection";
import { iconMap } from "@/Utils/iconMapping";
import { ArrowLeft, AlertCircle, XCircle } from "lucide-react";

export default function DashboardProgramShow({
    program,
    userEnrollment,
    enrolledProgram,
    enrollmentStatus,
    nextClass,
}) {
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    const handleStartLesson = (lessonId) => {
        router.visit(route("lessons.show", lessonId));
    };

    const handleReviewLesson = (lessonId) => {
        router.visit(route("lessons.show", lessonId));
    };

    const handleEnrollConfirm = () => {
        router.post(
            route("programs.enroll", program.slug),
            {},
            {
                onSuccess: () => {
                    setShowEnrollModal(false);
                },
            }
        );
    };

    const renderEnrollmentContent = () => {
        switch (enrollmentStatus) {
            case "not_enrolled":
                return (
                    <div className="space-y-8">
                        {/* Program Details */}
                        <ProgramDetailsSection program={program} />

                        {/* Enrollment Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Ready to Start Learning?
                                </h2>
                                <p className="text-lg text-gray-600 mb-6">
                                    Click below to request enrollment in{" "}
                                    <span className="font-semibold">
                                        {program.name}
                                    </span>
                                </p>
                                <button
                                    onClick={() => setShowEnrollModal(true)}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Enroll Now
                                </button>
                                <p className="text-sm text-gray-500 mt-4">
                                    Your enrollment request will be reviewed by
                                    our team
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case "pending":
                return (
                    <div className="space-y-8">
                        {/* Program Details */}
                        <ProgramDetailsSection program={program} />

                        {/* Pending Enrollment Component */}
                        <PendingEnrollment enrollment={userEnrollment} />
                    </div>
                );

            case "approved":
                // Show the full program dashboard content
                const ProgramIcon =
                    iconMap[enrolledProgram.theme.icon] || iconMap.BookOpen;

                const customHeader = (
                    <>
                        <ProgramIcon className="mr-3" size={32} />
                        <h1 className="text-2xl font-bold">
                            {enrolledProgram.name} - Student Dashboard
                        </h1>
                    </>
                );

                return (
                    <AuthenticatedLayout
                        programConfig={enrolledProgram.theme}
                        customHeader={customHeader}
                    >
                        <Head title={`${enrolledProgram.name} Dashboard`} />

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            {/* Back to Dashboard Link */}
                            <div className="mb-6">
                                <Link
                                    href={route("dashboard")}
                                    className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    <ArrowLeft size={20} className="mr-2" />
                                    Back to Dashboard
                                </Link>
                            </div>

                            {/* Progress Overview */}
                            <ProgressOverview
                                enrolledProgram={enrolledProgram}
                                nextClass={nextClass}
                            />

                            {/* Program Content */}
                            <div
                                className={`${enrolledProgram.theme.lightColor} ${enrolledProgram.theme.borderColor} border-2 rounded-lg p-6`}
                            >
                                <ProgramContent
                                    program={enrolledProgram}
                                    onStartLesson={handleStartLesson}
                                    onReviewLesson={handleReviewLesson}
                                />
                            </div>
                        </div>
                    </AuthenticatedLayout>
                );

            case "rejected":
                return (
                    <div className="space-y-8">
                        {/* Program Details */}
                        <ProgramDetailsSection program={program} />

                        {/* Rejection Notice */}
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
                            <div className="text-center">
                                <XCircle
                                    className="text-red-600 mx-auto mb-4"
                                    size={64}
                                />
                                <h2 className="text-2xl font-bold text-red-800 mb-3">
                                    Enrollment Not Approved
                                </h2>
                                <p className="text-lg text-red-700 mb-6">
                                    Your enrollment request for{" "}
                                    <span className="font-semibold">
                                        {program.name}
                                    </span>{" "}
                                    was not approved.
                                </p>
                                {userEnrollment?.rejection_reason && (
                                    <div className="bg-red-100 rounded-lg p-4 mb-6">
                                        <p className="text-red-800">
                                            <strong>Reason:</strong>{" "}
                                            {userEnrollment.rejection_reason}
                                        </p>
                                    </div>
                                )}
                                <p className="text-red-600 mb-6">
                                    Please contact us at{" "}
                                    <a
                                        href="mailto:support@abacoding.com"
                                        className="underline"
                                    >
                                        support@abacoding.com
                                    </a>{" "}
                                    for more information.
                                </p>
                                <button
                                    onClick={() => setShowEnrollModal(true)}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Request Enrollment Again
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-12">
                        <AlertCircle
                            className="text-gray-400 mx-auto mb-4"
                            size={64}
                        />
                        <h2 className="text-xl font-bold text-gray-600">
                            Unknown enrollment status
                        </h2>
                    </div>
                );
        }
    };

    // For approved enrollments, return the custom layout
    if (enrollmentStatus === "approved") {
        return renderEnrollmentContent();
    }

    // For all other states, use the standard layout
    return (
        <AuthenticatedLayout>
            <Head title={program.name} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back to Dashboard Link */}
                <div className="mb-6">
                    <Link
                        href={route("dashboard")}
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Dashboard
                    </Link>
                </div>

                {renderEnrollmentContent()}

                {/* Enrollment Confirmation Modal */}
                {showEnrollModal && (
                    <EnrollmentConfirmationModal
                        program={program}
                        onConfirm={handleEnrollConfirm}
                        onCancel={() => setShowEnrollModal(false)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
