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
            <div className="flex items-center">
                <div 
                    className="p-2 rounded-lg mr-4"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                    <ProgramIcon size={28} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {enrolledProgram.translated_name || enrolledProgram.name}
                    </h1>
                    <p className="text-sm text-white opacity-90">
                        {t('dashboard.learning_adventure_subtitle')}
                    </p>
                </div>
            </div>
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

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Next Class Card */}
                    <NextClassCard nextClass={nextClass} />

                    {/* Progress Overview */}
                    <ProgressOverview
                        enrolledProgram={enrolledProgram}
                        nextClass={nextClass}
                    />

                    {/* Program Content */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-8">
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
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Show pending enrollment notification if exists */}
                {pendingEnrollments && pendingEnrollments.length > 0 && (
                    <PendingEnrollment enrollment={pendingEnrollments[0]} />
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
