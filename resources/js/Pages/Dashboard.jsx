// resources/js/Pages/Dashboard.jsx - Clean Version
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Sparkles, Play } from "lucide-react";

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
    const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);

    // Check for email verification success
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('verified') === '1') {
            setShowVerificationSuccess(true);
            // Clean up URL
            window.history.replaceState(null, null, window.location.pathname);
            // Auto hide after 5 seconds
            setTimeout(() => setShowVerificationSuccess(false), 5000);
        }
    }, []);


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
                    {/* Email Verification Success Message */}
                    {showVerificationSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">
                                        {t('verification.email_verified_title')}
                                    </h3>
                                    <p className="text-sm text-green-700 mt-1">
                                        {t('verification.email_verified_message')}
                                    </p>
                                </div>
                                <div className="ml-auto pl-3">
                                    <div className="-mx-1.5 -my-1.5">
                                        <button
                                            onClick={() => setShowVerificationSuccess(false)}
                                            className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                                        >
                                            <span className="sr-only">Dismiss</span>
                                            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                {/* Welcome Message for New Users */}
                {flash?.welcome && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 shadow-sm">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                                <Sparkles className="text-green-600" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {t('programs_page.welcome_title')}
                            </h2>
                            <p className="text-gray-600 mb-4">
                                {t('programs_page.welcome_subtitle')}
                            </p>
                            <div className="bg-white rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
                                    <Play size={20} />
                                    <span className="font-semibold">{t('demo.try_demo_first')}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {t('demo.demo_instructions')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Email Verification Success Message */}
                {showVerificationSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">
                                    {t('verification.email_verified_title')}
                                </h3>
                                <p className="text-sm text-green-700 mt-1">
                                    {t('verification.email_verified_message')}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <div className="-mx-1.5 -my-1.5">
                                    <button
                                        onClick={() => setShowVerificationSuccess(false)}
                                        className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                                    >
                                        <span className="sr-only">Dismiss</span>
                                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Show pending enrollment notification if exists */}
                {pendingEnrollments && pendingEnrollments.length > 0 && (
                    <PendingEnrollment enrollment={pendingEnrollments[0]} />
                )}

                {/* Always show available programs */}
                <ProgramList
                    programs={availablePrograms || []}
                    userEnrollments={pendingEnrollments || []}
                    userDemoAccess={props.userDemoAccess || null}
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
