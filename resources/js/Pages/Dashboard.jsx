// resources/js/Pages/Dashboard.jsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";

// Import Dashboard components
import {
    EnrollmentConfirmationModal,
    ProgramList,
    PendingEnrollment,
    ProgramContent,
    ProgressOverview,
} from "@/Components/Dashboard";
import { iconMap } from "@/Utils/iconMapping";

export default function Dashboard() {
    const { props } = usePage();
    const {
        enrolledProgram,
        pendingEnrollments,
        availablePrograms,
        nextClass,
        pendingProgramId,
        flash,
    } = props;

    const student = props.auth.user;
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);

    // Check if user came from program registration
    useEffect(() => {
        if (pendingProgramId && availablePrograms) {
            const program = availablePrograms.find(
                (p) => p.id === pendingProgramId
            );
            if (program) {
                setSelectedProgram(program);
                setShowEnrollModal(true);
            }
        }
    }, [pendingProgramId, availablePrograms]);

    const handleStartLesson = (lessonId) => {
        // Navigate to the lesson page
        router.visit(route("lessons.show", lessonId));
    };

    const handleReviewLesson = (lessonId) => {
        // Navigate to the lesson page for review
        router.visit(route("lessons.show", lessonId));
    };

    const handleEnrollConfirm = () => {
        router.post(
            route("programs.enroll", selectedProgram.slug),
            {},
            {
                onSuccess: () => {
                    setShowEnrollModal(false);
                    setSelectedProgram(null);
                },
            }
        );
    };

    // If student has an approved enrollment
    if (enrolledProgram && enrolledProgram.approvalStatus === "approved") {
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
    }

    // Show both pending enrollments AND available programs
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Show pending enrollment notification if exists */}
                {pendingEnrollments && pendingEnrollments.length > 0 && (
                    <div className="mb-8">
                        <PendingEnrollment enrollment={pendingEnrollments[0]} />
                    </div>
                )}

                {/* Always show available programs */}
                <ProgramList
                    programs={availablePrograms || []}
                    userEnrollments={pendingEnrollments || []}
                />

                {/* Enrollment Confirmation Modal */}
                {showEnrollModal && selectedProgram && (
                    <EnrollmentConfirmationModal
                        program={selectedProgram}
                        onConfirm={handleEnrollConfirm}
                        onCancel={() => {
                            setShowEnrollModal(false);
                            setSelectedProgram(null);
                        }}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
