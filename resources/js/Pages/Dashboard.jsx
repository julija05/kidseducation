// resources/js/Pages/Dashboard.jsx - Clean Version
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Sparkles, Play, TrendingUp, Calendar, Trophy, Zap, ArrowRight, Star, BookOpen } from "lucide-react";
import ReviewSection from "@/Components/ReviewSection";
import ReviewPromptModal from "@/Components/ReviewPromptModal";
import StudentNavBar from "@/Components/StudentNavBar";

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
        canReview,
        userReview,
        shouldPromptReview,
        program,
    } = props;

    const student = props.auth.user;
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [showLanguageModal, setShowLanguageModal] = useState(showLanguageSelector || false);
    const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
    const [showReviewPrompt, setShowReviewPrompt] = useState(shouldPromptReview || false);

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
                    // Redirect to the program page to show the waiting list banner
                    router.visit(route("programs.show", selectedProgram.slug));
                },
            }
        );
    };

    // If student has an approved enrollment
    if (enrolledProgram && enrolledProgram.approvalStatus === "approved") {
        const ProgramIcon =
            iconMap[enrolledProgram.theme?.icon] || iconMap.BookOpen;

        return (
            <AuthenticatedLayout
                programConfig={enrolledProgram.theme}
            >
                <Head title={`${enrolledProgram.translated_name || enrolledProgram.name} Dashboard`} />

                {/* First Time Language Selector */}
                <FirstTimeLanguageSelector
                    show={showLanguageModal}
                    onClose={() => setShowLanguageModal(false)}
                />

                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-pink-200 to-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}} />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}} />
                    </div>
                    
                    <div className="relative z-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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

                        {/* Modern Next Class Card */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
                            <NextClassCard nextClass={nextClass} />
                        </div>

                        {/* Modern Progress Overview */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
                            <ProgressOverview
                                enrolledProgram={enrolledProgram}
                                nextClass={nextClass}
                            />
                        </div>

                        {/* Modern Program Content */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
                            <ProgramContent
                                program={enrolledProgram}
                                onStartLesson={handleStartLesson}
                                onReviewLesson={handleReviewLesson}
                            />
                        </div>

                        {/* Modern Review Section */}
                        {program && (
                            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
                                <ReviewSection
                                    enrolledProgram={enrolledProgram}
                                    program={program}
                                    userReview={userReview}
                                    canReview={canReview}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Review Prompt Modal */}
                {program && (
                    <ReviewPromptModal
                        program={program}
                        isOpen={showReviewPrompt}
                        onClose={() => setShowReviewPrompt(false)}
                    />
                )}
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
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}} />
                    <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}} />
                </div>
                
                <div className="relative z-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Modern Welcome Message for New Users */}
                    {flash?.welcome && (
                        <div className="bg-white/80 backdrop-blur-lg border border-white/50 rounded-3xl p-8 shadow-xl">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-6 shadow-lg">
                                    <Sparkles className="text-white" size={28} />
                                </div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                                    {t('programs_page.welcome_title')}
                                </h2>
                                <p className="text-gray-600 mb-6 text-lg">
                                    {t('programs_page.welcome_subtitle')}
                                </p>
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-200/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-center space-x-3 text-blue-600 mb-3">
                                        <Play size={24} className="animate-bounce" />
                                        <span className="font-bold text-lg">{t('demo.try_demo_first')}</span>
                                    </div>
                                    <p className="text-gray-600">
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

                    {/* Modern Pending Enrollment */}
                    {pendingEnrollments && pendingEnrollments.length > 0 && (
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
                            <PendingEnrollment 
                                enrollment={pendingEnrollments[0]} 
                                userDemoAccess={props.userDemoAccess || null}
                            />
                        </div>
                    )}

                    {/* Modern Program List */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
                        <ProgramList
                            programs={availablePrograms || []}
                            userEnrollments={pendingEnrollments || []}
                            userDemoAccess={props.userDemoAccess || null}
                        />
                    </div>

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
            </div>
        </AuthenticatedLayout>
    );
}
