// resources/js/Pages/Front/Programs/Show.jsx
import React, { useState, useEffect } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import ProgramDetailsSection from "@/Components/ProgramDetailsSection";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import StarRating from "@/Components/StarRating";
import ReviewCard from "@/Components/ReviewCard";
import EnrollmentSwitchWarningModal from "@/Components/Dashboard/EnrollmentSwitchWarningModal";
import { MessageSquare, Plus, Sparkles, CheckCircle, Clock, XCircle, AlertTriangle, Users, Play } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProgramDetail({ auth }) {
    const { program, userEnrollment, hasAnyEnrollment, hasAnyActiveEnrollment, canReview, userReview, topReviews, flash, waiting_list_program, currentEnrollment } = usePage().props;
    const { t } = useTranslation();
    
    // Get flash messages from Inertia props
    const flashMessages = flash || {};
    
    // Modal state
    const [showSwitchWarningModal, setShowSwitchWarningModal] = useState(false);
    
    // Dynamic viewer count for guest users
    const [currentViewers, setCurrentViewers] = useState(0);
    
    useEffect(() => {
        if (!auth.user) {
            // Generate initial viewer count based on program popularity
            const baseViewers = Math.floor(Math.random() * 15) + 3; // 3-17 viewers
            setCurrentViewers(baseViewers);
            
            // Update viewer count every 8-15 seconds with realistic changes
            const interval = setInterval(() => {
                setCurrentViewers(prev => {
                    const change = Math.random() < 0.5 ? -1 : 1; // 50% chance to go up or down
                    const magnitude = Math.random() < 0.7 ? 1 : 2; // 70% chance of small change
                    const newCount = prev + (change * magnitude);
                    
                    // Keep within realistic bounds (2-25 viewers)
                    return Math.max(2, Math.min(25, newCount));
                });
            }, Math.random() * 7000 + 8000); // Random interval 8-15 seconds
            
            return () => clearInterval(interval);
        }
    }, [auth.user]);

    const handleEnrollClick = () => {
        // If user has active enrollment, show warning modal instead of direct enrollment
        if (hasAnyActiveEnrollment && currentEnrollment) {
            setShowSwitchWarningModal(true);
        } else {
            // Direct enrollment
            performEnrollment();
        }
    };

    const performEnrollment = (isSwitch = false) => {
        const data = isSwitch ? { switch_program: true } : {};
        
        router.post(
            route("programs.enroll", program.slug),
            data,
            {
                onSuccess: () => {
                    // Handle success (page will reload with success message)
                },
            }
        );
    };

    const handleSwitchConfirm = () => {
        setShowSwitchWarningModal(false);
        performEnrollment(true); // Pass true to indicate this is a switch
    };

    const getEnrollmentSection = () => {
        if (!auth.user) {
            // Not logged in - show registration/login options
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/70 backdrop-blur-lg border border-white/30 rounded-3xl shadow-xl p-10 mt-12"
                >
                    <div className="text-center">
                        <motion.div 
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 shadow-lg"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Users className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                            {t('waiting_list.join_waiting_list')}
                        </h2>
                        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                            {t('waiting_list.create_account_description')}
                        </p>

                        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center mb-8">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={route("register", {
                                        program: program.id,
                                    })}
                                    onClick={handleEnrollClick}
                                    className="block sm:inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:shadow-lg font-medium transition-all duration-300"
                                >
                                    {t('waiting_list.create_account_join')}
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={route("login")}
                                    onClick={handleEnrollClick}
                                    className="block sm:inline-block bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl hover:bg-white/90 border border-gray-200 font-medium transition-all duration-300"
                                >
                                    {t('waiting_list.i_have_account')}
                                </Link>
                            </motion.div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200/50 backdrop-blur-sm">
                            <p className="text-gray-700 mb-4 font-medium">
                                {t('waiting_list.not_sure_try_first')}
                            </p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={route("demo.access", program.slug)}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-blue-600 font-medium transition-all duration-300 shadow-lg"
                                >
                                    <Play className="w-5 h-5" />
                                    {t('waiting_list.try_free_demo')}
                                </Link>
                            </motion.div>
                        </div>

                        <p className="text-sm text-gray-600 mt-8 bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                            {t('waiting_list.after_creating_account')}
                        </p>
                    </div>
                </motion.div>
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
                                    {t('waiting_list.welcome_title')}
                                </h3>
                                <p className="text-yellow-700">
                                    {t('waiting_list.success_message', { program: program.name })} {' '}
                                    {t('waiting_list.contact_info', { email: auth.user.email })}
                                </p>
                                <p className="text-sm text-yellow-600 mt-4">
                                    {t('waiting_list.added_on')}{" "}
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
                                    {t('waiting_list.youre_enrolled')}
                                </h3>
                                <Link
                                    href={route("dashboard")}
                                    className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                                >
                                    {t('waiting_list.go_to_dashboard')}
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
                                    {t('waiting_list.enrollment_not_approved')}
                                </h3>
                                <p className="text-red-700">
                                    {userEnrollment.rejection_reason || t('waiting_list.contact_support_info')}
                                </p>
                            </div>
                        </div>
                    );
            }
        }

        // Logged in but not enrolled in this program
        if (hasAnyActiveEnrollment && currentEnrollment) {
            // User has an active enrollment in another program - show enrollment with warning
            return (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 mt-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
                            <AlertTriangle className="text-white" size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            {t('waiting_list.switch_to_program')}
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            {t('waiting_list.switch_program_description', { 
                                current: currentEnrollment.program?.translated_name || currentEnrollment.program?.name,
                                new: program.name 
                            })}
                        </p>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ {t('waiting_list.switch_important')}</h4>
                            <ul className="text-sm text-yellow-700 text-left max-w-md mx-auto space-y-1">
                                <li>• {t('waiting_list.switch_warning_dashboard')}</li>
                                <li>• {t('waiting_list.switch_warning_marked')}</li>
                                <li>• {t('waiting_list.switch_warning_new')}</li>
                            </ul>
                        </div>
                        
                        <button
                            onClick={handleEnrollClick}
                            className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {t('waiting_list.switch_programs_join')}
                        </button>
                        
                        <p className="text-sm text-gray-500 mt-4">
                            {t('waiting_list.requires_approval')}
                        </p>
                    </div>
                </div>
            );
        }

        // User has no enrollments - show enrollment option
        return (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 mt-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {t('waiting_list.join_waiting_list')}
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        {t('waiting_list.be_among_first', { program: program.name })}
                    </p>
                    <button
                        onClick={handleEnrollClick}
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        {t('waiting_list.join_waiting_list_button')}
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                        {t('waiting_list.added_contacted')}
                    </p>
                </div>
            </div>
        );
    };

    const getReviewsSection = () => {
        return (
            <div className="bg-gray-50 rounded-xl p-8 mt-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <MessageSquare className="text-blue-600" size={24} />
                        <h3 className="text-2xl font-bold text-gray-900">
                            {t('reviews.student_reviews')}
                        </h3>
                    </div>
                    
                    {program.average_rating > 0 && (
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                            <StarRating rating={program.average_rating} size={20} showRating />
                            <span className="text-gray-600 text-sm">
                                ({program.total_reviews_count} review{program.total_reviews_count !== 1 ? 's' : ''})
                            </span>
                        </div>
                    )}
                </div>

                {/* User's Review Display (Read Only) */}
                {auth.user && userReview && (
                    <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">{t('reviews.your_review')}</h4>
                            <ReviewCard review={userReview} showUserName={false} />
                            <div className="mt-3">
                                <p className="text-sm text-blue-700">
                                    {t('reviews.manage_review_from_dashboard')} <Link href={route('dashboard')} className="underline font-medium">{t('reviews.student_dashboard')}</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews List */}
                {topReviews && topReviews.length > 0 ? (
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">{t('reviews.recent_reviews')}</h4>
                        <div className="grid gap-4">
                            {topReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                        
                        {program.total_reviews_count > 3 && (
                            <div className="text-center pt-4">
                                <p className="text-gray-600 text-sm">
                                    {t('reviews.showing_reviews_of', { shown: 3, total: program.total_reviews_count })}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <MessageSquare className="mx-auto text-gray-400 mb-3" size={48} />
                        <h4 className="text-lg font-medium text-gray-600 mb-2">{t('reviews.no_reviews_yet')}</h4>
                        <p className="text-gray-500">
                            {t('reviews.be_first_to_share')}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // Flash Messages Banner Component
    const getFlashMessageBanner = () => {
        // Success message (waiting list or general success)
        if (flashMessages.success) {
            const isWaitingListSuccess = flashMessages.success === 'waiting_list_success';
            const isProgramSwitchSuccess = flashMessages.success === 'program_switch_success';
            
            if (isWaitingListSuccess || isProgramSwitchSuccess) {
                return (
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-6 px-4 mb-8 rounded-2xl shadow-xl">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        {isProgramSwitchSuccess 
                                            ? t('dashboard.program_switched_title', 'Program Switched Successfully!') 
                                            : t('waiting_list.youre_on_waiting_list')
                                        }
                                    </h2>
                                </div>
                            </div>
                            <p className="text-lg mb-4 text-white/90">
                                {isProgramSwitchSuccess 
                                    ? t('dashboard.program_switch_success', { program: waiting_list_program || program.name })
                                    : t('waiting_list.successfully_joined', { program: waiting_list_program || program.name })
                                }
                            </p>
                            <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto">
                                <p className="text-white/95">
                                    📧 {t('waiting_list.contact_at_email', { email: auth.user?.email })}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            } else if (flashMessages.success === 'left_waiting_list') {
                // Left waiting list message
                return (
                    <div className="bg-blue-500 text-white py-4 px-4 mb-8 rounded-lg shadow-lg">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-lg font-medium">{t('waiting_list.left_successfully')}</p>
                            </div>
                        </div>
                    </div>
                );
            } else {
                // General success message (fallback)
                return (
                    <div className="bg-green-500 text-white py-4 px-4 mb-8 rounded-lg shadow-lg">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-lg font-medium">{flashMessages.success}</p>
                            </div>
                        </div>
                    </div>
                );
            }
        }
        
        // Error message
        if (flashMessages.error) {
            return (
                <div className="bg-red-500 text-white py-4 px-4 mb-8 rounded-lg shadow-lg">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center mb-2">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-medium">{flashMessages.error}</p>
                        </div>
                    </div>
                </div>
            );
        }
        
        return null;
    };

    // Live viewers component for guest users
    const getLiveViewersComponent = () => {
        if (!auth.user && currentViewers > 0) {
            return (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 mb-6 rounded-lg shadow-lg">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                            </div>
                            <p className="text-sm font-medium">
                                🔥 <span className="font-bold">{currentViewers}</span> {currentViewers === 1 ? t('programs.person_viewing') : t('programs.people_viewing')}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Choose the appropriate layout based on authentication status
    const LayoutComponent = auth.user ? AuthenticatedLayout : GuestFrontLayout;
    
    return (
        <LayoutComponent auth={auth}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-to-r from-pink-200 to-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}} />
                <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}} />

                {/* Floating particles */}
                <motion.div
                    className="absolute top-32 right-32 w-3 h-3 bg-purple-400 rounded-full"
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-64 left-20 w-4 h-4 bg-blue-400 rounded-full"
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 15, 0],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />

                <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
                    {getFlashMessageBanner()}
                    {getLiveViewersComponent()}
                    <ProgramDetailsSection program={program} />
                    {getEnrollmentSection()}
                    {getReviewsSection()}
                </div>
                
                {/* Enrollment Switch Warning Modal */}
                {showSwitchWarningModal && currentEnrollment && (
                    <EnrollmentSwitchWarningModal
                        currentProgram={currentEnrollment.program}
                        newProgram={program}
                        onConfirm={handleSwitchConfirm}
                        onCancel={() => setShowSwitchWarningModal(false)}
                    />
                )}
            </div>
        </LayoutComponent>
    );
}
