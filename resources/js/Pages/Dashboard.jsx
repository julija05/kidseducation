// resources/js/Pages/Dashboard.jsx - Clean Version
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ParentLayout from "@/Layouts/ParentLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Sparkles, Play, TrendingUp, Calendar, Trophy, Zap, ArrowRight, Star, BookOpen, Rocket, ArrowLeft, UserRound, ClipboardCheck, Clock, CheckCircle2, HelpCircle } from "lucide-react";
import ReviewSection from "@/Components/ReviewSection";
import ReviewPromptModal from "@/Components/ReviewPromptModal";
import StudentNavBar from "@/Components/StudentNavBar";
import CertificateModal from "@/Components/Certificate/CertificateModal";

// Import Dashboard components
import {
    ProgramList,
    PendingEnrollment,
    ProgramContent,
    ProgressOverview,
} from "@/Components/Dashboard";
import CompletedPrograms from "@/Components/Dashboard/CompletedPrograms";
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
        completedEnrollments,
        nextClass,
        homeworkAssignments,
        pendingProgramId,
        notifications,
        unreadNotificationCount,
        showLanguageSelector,
        flash,
        canReview,
        userReview,
        shouldPromptReview,
        program,
        userStatus,
        suspensionMessage,
        currentEnrollment,
        parentView,
    } = props;

    const student = props.auth.user;
    const isParentView = Boolean(parentView);
    const DashboardLayout = isParentView ? ParentLayout : AuthenticatedLayout;
    const [showLanguageModal, setShowLanguageModal] = useState(!isParentView && (showLanguageSelector || false));
    const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
    const [showReviewPrompt, setShowReviewPrompt] = useState(shouldPromptReview || false);
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [certificateProgram, setCertificateProgram] = useState(null);

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

    // Check for program completion and show certificate modal
    useEffect(() => {
        if (isParentView) {
            return;
        }

        if (enrolledProgram && enrolledProgram.progress >= 100 && enrolledProgram.approvalStatus === "approved") {
            // Only show certificate modal once per session
            const certificateShown = sessionStorage.getItem(`certificate_shown_${enrolledProgram.id}`);
            if (!certificateShown) {
                setCertificateProgram(enrolledProgram);
                setShowCertificateModal(true);
                sessionStorage.setItem(`certificate_shown_${enrolledProgram.id}`, 'true');
            }
        }
    }, [enrolledProgram, isParentView]);


    // Check if user came from program registration
    // If there's a pending program, redirect to the program page for enrollment
    useEffect(() => {
        if (isParentView) {
            return;
        }

        if (pendingProgramId && availablePrograms) {
            const program = availablePrograms.find(
                (p) => p.id === pendingProgramId
            );
            if (program) {
                // Redirect to the program page where they can enroll
                router.visit(route("programs.show", program.slug));
            }
        }
    }, [pendingProgramId, availablePrograms, isParentView]);

    const handleStartLesson = (lessonId) => {
        if (isParentView) {
            return;
        }

        // Navigate to the lesson page
        router.visit(route("lessons.show", lessonId));
    };

    const handleReviewLesson = (lessonId) => {
        if (isParentView) {
            return;
        }

        // Navigate to the lesson page for review
        router.visit(route("lessons.show", lessonId));
    };

    const handleCertificateGenerated = (certificateData) => {
        console.log('Certificate generated:', certificateData);
        // You could add success notifications here
    };


    // If user is suspended, show suspended dashboard
    if (userStatus === 'suspended' && suspensionMessage) {
        return (
            <DashboardLayout>
                <Head title={t('nav.dashboard')} />
                
                {/* First Time Language Selector */}
                <FirstTimeLanguageSelector
                    show={showLanguageModal}
                    onClose={() => setShowLanguageModal(false)}
                />
                
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 relative overflow-hidden">
                    {/* Background decorative elements - red theme for suspension */}
                    <div className="absolute inset-0">
                        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-red-200 to-pink-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-orange-200 to-red-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}} />
                    </div>
                    
                    <div className="relative z-5 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <ParentViewBanner parentView={parentView} />

                        {/* Suspension Alert */}
                        <div className="bg-red-50/90 backdrop-blur-lg border border-red-200 rounded-3xl p-8 shadow-xl mb-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-full mb-6 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-red-600 mb-4">
                                    {suspensionMessage.title}
                                </h2>
                                <p className="text-gray-700 mb-6 text-lg">
                                    {suspensionMessage.message}
                                </p>
                                <div className="bg-white rounded-2xl p-6 border border-red-200/50 backdrop-blur-sm">
                                    <p className="text-gray-600 mb-4 font-medium">
                                        Please contact our administrator to resolve this issue:
                                    </p>
                                    <div className="inline-flex items-center space-x-2 bg-red-100 rounded-lg px-4 py-2">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                        <a 
                                            href={`mailto:${suspensionMessage.contact_email}`}
                                            className="text-red-700 font-semibold hover:text-red-800 transition-colors"
                                        >
                                            {suspensionMessage.contact_email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Show current enrollment info (disabled) */}
                        {currentEnrollment && (
                            <div className="bg-gray-50/90 backdrop-blur-lg border border-gray-200 rounded-3xl p-8 shadow-xl opacity-60">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-500 mb-4">
                                        Your Current Program (Suspended)
                                    </h3>
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                        <h4 className="text-lg font-medium text-gray-600 mb-2">
                                            {currentEnrollment.program.translated_name || currentEnrollment.program.name}
                                        </h4>
                                        <p className="text-gray-500">
                                            Access to this program has been temporarily suspended
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Show available programs (disabled) */}
                        {availablePrograms && availablePrograms.length > 0 && (
                            <div className="mt-8 bg-gray-50/90 backdrop-blur-lg border border-gray-200 rounded-3xl p-8 shadow-xl opacity-60">
                                <h3 className="text-xl font-semibold text-gray-500 mb-6 text-center">
                                    Available Programs (Currently Unavailable)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availablePrograms.map((program) => {
                                        const ProgramIcon = iconMap[program.icon] || iconMap.BookOpen;
                                        return (
                                            <div key={program.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <div className={`p-2 rounded-lg ${program.lightColor || 'bg-gray-100'}`}>
                                                        <ProgramIcon size={24} className={program.textColor || 'text-gray-600'} />
                                                    </div>
                                                    <h4 className="font-medium text-gray-600">
                                                        {program.translated_name || program.name}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    {program.translated_description || program.description}
                                                </p>
                                                <button 
                                                    disabled 
                                                    className="w-full bg-gray-200 text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed"
                                                >
                                                    Enrollment Suspended
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // If student has an approved enrollment
    if (enrolledProgram && enrolledProgram.approvalStatus === "approved") {
        const ProgramIcon =
            iconMap[enrolledProgram.theme?.icon] || iconMap.BookOpen;

        return (
            <DashboardLayout
                {...(!isParentView ? { programConfig: enrolledProgram.theme } : {})}
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
                    <ParentViewBanner parentView={parentView} />

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

                        <HomeworkAssignmentsPanel assignments={homeworkAssignments || []} canUpdate={!isParentView} />

                        {/* Modern Next Class Card */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
                            <NextClassCard nextClass={nextClass} />
                        </div>

                        {/* Program Completion Celebration - Show when program is completed */}
                        {enrolledProgram?.status === 'completed' && (
                            <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 backdrop-blur-lg rounded-3xl shadow-xl border border-green-200/50 p-8">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
                                        <Trophy className="text-white" size={36} />
                                    </div>
                                    <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                                        🎉 {t('dashboard.congratulations')} 🎉
                                    </h2>
                                    <p className="text-xl text-gray-700 mb-2">
                                        {t('dashboard.program_completed_message')}
                                    </p>
                                    <p className="text-lg font-semibold text-emerald-600 mb-8">
                                        {enrolledProgram.translatedName || enrolledProgram.name}
                                    </p>
                                    
                                    {/* Achievement Badge */}
                                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-6 py-3 border border-yellow-200 mb-8">
                                        <Star className="text-yellow-500" size={20} />
                                        <span className="font-semibold text-yellow-700">{t('dashboard.program_master')}</span>
                                        <Star className="text-yellow-500" size={20} />
                                    </div>
                                </div>
                            </div>
                        )}

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
                                readOnly={isParentView}
                            />
                        </div>

                        {/* Modern Program List for browsing other programs */}
                        {availablePrograms && availablePrograms.length > 0 && (
                            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
                                <ProgramList
                                    programs={availablePrograms || []}
                                    userEnrollments={pendingEnrollments || []}
                                    userDemoAccess={props.userDemoAccess || null}
                                />
                            </div>
                        )}

                        {/* Modern Review Section */}
                        {!isParentView && program && (
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
                {!isParentView && program && (
                    <ReviewPromptModal
                        program={program}
                        isOpen={showReviewPrompt}
                        onClose={() => setShowReviewPrompt(false)}
                    />
                )}

                {/* Certificate Modal */}
                {!isParentView && certificateProgram && (
                    <CertificateModal
                        isOpen={showCertificateModal}
                        onClose={() => setShowCertificateModal(false)}
                        program={certificateProgram}
                        enrollment={enrolledProgram}
                        onGenerate={handleCertificateGenerated}
                    />
                )}
            </DashboardLayout>
        );
    }

    // Show both pending enrollments AND available programs
    return (
        <DashboardLayout>
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
                    <ParentViewBanner parentView={parentView} />

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

                    {/* Completed Programs with Certificate Functionality */}
                    {completedEnrollments && completedEnrollments.length > 0 && (
                        <CompletedPrograms 
                            completedEnrollments={completedEnrollments}
                            onCertificateGenerate={handleCertificateGenerated}
                        />
                    )}

                    {/* Modern Program List */}
                    {(!isParentView || (availablePrograms && availablePrograms.length > 0)) && (
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
                            <ProgramList
                                programs={availablePrograms || []}
                                userEnrollments={pendingEnrollments || []}
                                userDemoAccess={props.userDemoAccess || null}
                            />
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}

function ParentViewBanner({ parentView }) {
    if (!parentView) {
        return null;
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
                        <UserRound className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Viewing child dashboard</p>
                        <h1 className="text-lg font-semibold text-slate-950">
                            {parentView.child?.name || "Selected child"}
                        </h1>
                        {parentView.child?.username && (
                            <p className="font-mono text-xs text-slate-500">{parentView.child.username}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href={parentView.backUrl || route("parent.dashboard")}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Parent dashboard
                    </Link>
                    {parentView.detailsUrl && (
                        <Link
                            href={parentView.detailsUrl}
                            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Child details
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

function HomeworkAssignmentsPanel({ assignments, canUpdate = true }) {
    const updateHomeworkStatus = (assignment, status) => {
        router.patch(route("dashboard.homework.status", assignment.id), { status }, {
            preserveScroll: true,
        });
    };
    const markPracticeTaskDone = (task) => {
        router.patch(route("dashboard.homework.practice-tasks.done", task.id), {}, {
            preserveScroll: true,
        });
    };
    const startHomework = (assignment) => {
        if (assignment.lesson?.id) {
            router.visit(route("lessons.show", assignment.lesson.id));
        }
    };
    const currentAssignment = assignments[0] || null;
    const otherAssignments = assignments.slice(1, 4);

    if (!currentAssignment) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <ClipboardCheck className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Current homework</p>
                        <p className="mt-1 text-sm text-slate-600">No homework assigned yet.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="rounded-2xl border border-emerald-200 bg-white/95 p-5 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase text-emerald-700 ring-1 ring-emerald-200">
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            Current homework
                        </span>
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {currentAssignment.student_status_label || currentAssignment.status}
                        </span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-slate-950">{currentAssignment.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {shortInstruction(currentAssignment.instructions)}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <HomeworkMeta icon={Clock} label="Practice time" value={currentAssignment.estimated_practice_time} />
                        <HomeworkMeta icon={BookOpen} label="Lesson" value={currentAssignment.lesson?.title} />
                        <HomeworkMeta icon={Calendar} label="Due date" value={currentAssignment.due_date} />
                    </div>

                    <PracticeTaskList tasks={currentAssignment.practice_tasks || []} onDone={markPracticeTaskDone} canUpdate={canUpdate} />
                </div>

                {canUpdate && (
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-52">
                        <button
                            type="button"
                            onClick={() => startHomework(currentAssignment)}
                            disabled={!currentAssignment.lesson?.id}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Play className="h-4 w-4" />
                            Start homework
                        </button>
                        <button
                            type="button"
                            onClick={() => updateHomeworkStatus(currentAssignment, "completed")}
                            disabled={currentAssignment.student_status === "completed"}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Completed
                        </button>
                        <button
                            type="button"
                            onClick={() => updateHomeworkStatus(currentAssignment, "needs_help")}
                            disabled={currentAssignment.student_status === "needs_help"}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <HelpCircle className="h-4 w-4" />
                            I need help
                        </button>
                    </div>
                )}
            </div>

            {otherAssignments.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">More homework</p>
                    <div className="mt-3 grid gap-3 lg:grid-cols-3">
                        {otherAssignments.map((assignment) => (
                            <div key={assignment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="text-sm font-semibold text-slate-950">{assignment.title}</p>
                                <p className="mt-1 text-xs text-slate-600">{assignment.estimated_practice_time || "Practice time not set"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

function shortInstruction(value) {
    if (!value) {
        return "No instructions added yet.";
    }

    const text = String(value).trim();
    return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function PracticeTaskList({ tasks, onDone, canUpdate }) {
    if (!tasks.length) {
        return null;
    }

    return (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Practice tasks</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                        <span className={`text-sm font-medium ${task.is_done ? "text-slate-500 line-through" : "text-slate-900"}`}>
                            {task.prompt}
                        </span>
                        {canUpdate && (
                            <button
                                type="button"
                                onClick={() => onDone(task)}
                                disabled={task.is_done}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Done
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function HomeworkMeta({ icon: Icon, label, value }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">{value || "Not set"}</p>
        </div>
    );
}
