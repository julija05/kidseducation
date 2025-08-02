// resources/js/Pages/Dashboard.jsx - Clean Version
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

// Import Dashboard components
import {
    EnrollmentConfirmationModal,
    ProgramList,
    PendingEnrollment,
    ProgramContent,
    ProgressOverview,
} from "@/Components/Dashboard";
import NextClassCard from "@/Components/Dashboard/NextClassCard";
import FirstTimeLanguageSelector from "@/Components/FirstTimeLanguageSelector";
import { iconMap } from "@/Utils/iconMapping";

export default function Dashboard() {
    const { props } = usePage();
    const { t } = useTranslation();
    const {
        enrolledProgram,
        pendingEnrollments,
        availablePrograms,
        nextClass,
        pendingProgramId,
        notifications,
        unreadNotificationCount,
        showLanguageSelector,
        flash,
    } = props;

    const student = props.auth.user;
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [showLanguageModal, setShowLanguageModal] = useState(showLanguageSelector || false);


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
            iconMap[enrolledProgram.theme?.icon] || iconMap.BookOpen;

        const customHeader = (
            <>
                <ProgramIcon className="mr-3" size={32} />
                <h1 className="text-2xl font-bold">
                    🎓 {t('dashboard.learning_adventure', { program: enrolledProgram.translated_name || enrolledProgram.name })}
                </h1>
            </>
        );

        return (
            <AuthenticatedLayout
                programConfig={enrolledProgram.theme}
                customHeader={customHeader}
            >
                <Head title={`${enrolledProgram.translated_name || enrolledProgram.name} Dashboard`} />

                {/* First Time Language Selector */}
                <FirstTimeLanguageSelector
                    show={showLanguageModal}
                    onClose={() => setShowLanguageModal(false)}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Next Class Card */}
                    <NextClassCard nextClass={nextClass} />

                    {/* Progress Overview */}
                    <ProgressOverview
                        enrolledProgram={enrolledProgram}
                        nextClass={nextClass}
                    />

                    {/* Program Content */}
                    <div
                        className={`${
                            enrolledProgram.theme?.lightColor || "bg-gradient-to-br from-blue-50 to-purple-50"
                        } ${
                            enrolledProgram.theme?.borderColor ||
                            "border-blue-200"
                        } border-2 rounded-xl shadow-lg p-6 transform hover:shadow-xl transition-shadow duration-300`}
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
            <Head title={t('nav.dashboard')} />
            
            {/* First Time Language Selector */}
            <FirstTimeLanguageSelector
                show={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
            />
            
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
