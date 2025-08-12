// resources/js/Pages/Front/Programs/Show.jsx
import React, { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import ProgramDetailsSection from "@/Components/ProgramDetailsSection";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import StarRating from "@/Components/StarRating";
import ReviewCard from "@/Components/ReviewCard";
import { MessageSquare, Plus, Sparkles, CheckCircle, Clock, XCircle, AlertTriangle, Users, Play } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProgramDetail({ auth }) {
    const { program, userEnrollment, hasAnyEnrollment, hasAnyActiveEnrollment, canReview, userReview, topReviews, flash, waiting_list_program } = usePage().props;
    const { t } = useTranslation();
    
    // Get flash messages from Inertia props
    const flashMessages = flash || {};
    
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
        // Save program ID to session storage before redirecting
        sessionStorage.setItem("pending_enrollment_program_id", program.id);
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
                            Join Our Waiting List!
                        </h2>
                        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                            Create an account to join our waiting list and be among the first
                            to know when this program launches!
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
                                    Create Account & Join Waiting List
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={route("login")}
                                    onClick={handleEnrollClick}
                                    className="block sm:inline-block bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl hover:bg-white/90 border border-gray-200 font-medium transition-all duration-300"
                                >
                                    I Have an Account
                                </Link>
                            </motion.div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200/50 backdrop-blur-sm">
                            <p className="text-gray-700 mb-4 font-medium">
                                Not sure yet? Try it first!
                            </p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={route("demo.access", program.slug)}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-blue-600 font-medium transition-all duration-300 shadow-lg"
                                >
                                    <Play className="w-5 h-5" />
                                    Try Free Demo
                                </Link>
                            </motion.div>
                        </div>

                        <p className="text-sm text-gray-600 mt-8 bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                            After creating your account, you'll be added to our waiting list
                            and we'll contact you with launch details
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
                                    You're Enrolled! 🎉
                                </h3>
                                <Link
                                    href={route("dashboard")}
                                    className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                                >
                                    Go to Dashboard
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

        // Logged in but not enrolled in this program
        if (hasAnyActiveEnrollment) {
            // User has an active enrollment in another program - show restriction message
            return (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg p-8 mt-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Enrollment Restricted
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            You currently have a pending enrollment or are enrolled in another program. You can view the details of{" "}
                            <strong>{program.name}</strong> below, but enrollment is limited to one program at a time.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                            <p className="text-sm text-blue-700">
                                💡 Complete your current program or wait for approval to unlock enrollment in additional programs.
                            </p>
                        </div>
                        <div className="mt-6 p-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-3 text-center">
                                Demo access is also restricted while you have an active enrollment.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        // User has no enrollments - show enrollment option
        return (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 mt-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Join Our Waiting List!
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Be among the first to experience{" "}
                        <strong>{program.name}</strong>. Join our waiting list and we'll notify you
                        with launch details and exclusive early access!
                    </p>
                    <Link
                        href={route("programs.enroll", program.slug)}
                        method="post"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        Join Waiting List
                    </Link>
                    <p className="text-sm text-gray-500 mt-4">
                        You'll be added to our waiting list and contacted with program details
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
            
            if (isWaitingListSuccess) {
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
                                        You're on the Waiting List! 🎉
                                    </h2>
                                </div>
                            </div>
                            <p className="text-lg mb-4 text-white/90">
                                You've successfully joined the waiting list for <strong>{waiting_list_program || program.name}</strong>!
                            </p>
                            <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto">
                                <p className="text-white/95">
                                    📧 We'll contact you at <strong>{auth.user?.email}</strong> with program details and launch information soon!
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
                                🔥 <span className="font-bold">{currentViewers}</span> {currentViewers === 1 ? 'person is' : 'people are'} currently viewing this program
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
            </div>
        </LayoutComponent>
    );
}
