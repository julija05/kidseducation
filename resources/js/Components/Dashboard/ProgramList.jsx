// resources/js/Components/Dashboard/ProgramList.jsx
import React from "react";
import { Link, router } from "@inertiajs/react";
import { ArrowRight, BookOpen, Clock, Star, Sparkles, Play } from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProgramList({ programs, userEnrollments = [], userDemoAccess = null }) {
    const { t } = useTranslation();
    
    // Create a map of program enrollments for quick lookup
    const enrollmentMap = userEnrollments.reduce((acc, enrollment) => {
        acc[enrollment.program?.id || enrollment.program_id] = enrollment;
        return acc;
    }, {});

    // Check if user has any pending or active enrollments (only one enrollment at a time)
    const hasAnyActiveEnrollment = userEnrollments.some(enrollment => 
        (enrollment.approval_status === 'pending' || 
         (enrollment.approval_status === 'approved' && enrollment.status !== 'completed'))
    );
    
    // Check if user has any pending enrollments specifically
    const hasPendingEnrollments = userEnrollments.some(enrollment => 
        enrollment.approval_status === 'pending'
    );

    const getButtonContent = (program) => {
        const enrollment = enrollmentMap[program.id];

        if (!enrollment) {
            // Not enrolled - check if user has pending enrollments or demo access
            const hasActiveDemo = userDemoAccess && userDemoAccess.program_slug;
            const isCurrentDemoProgram = hasActiveDemo && userDemoAccess.program_slug === program.slug;
            
            // If user has pending enrollments, only show demo access for their current demo program
            if (hasPendingEnrollments) {
                if (isCurrentDemoProgram) {
                    // User has pending enrollment AND this is their demo program - show "Back to Demo"
                    return (
                        <div className="space-y-3">
                            {/* Back to Demo Button */}
                            <Link
                                href={`/demo/${program.slug}/dashboard`}
                                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 text-white no-underline"
                            >
                                <Play size={20} className="mr-2" />
                                {t('demo.back_to_demo')}
                            </Link>
                            
                            {/* View Details Button */}
                            <Link
                                href={route("programs.show", program.slug)}
                                className="w-full text-white py-3 rounded-xl font-medium text-base transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg border border-gray-300"
                                style={{
                                    background: 'var(--primary-gradient, linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229)))'
                                }}
                            >
                                🔍 {t('dashboard.explore_adventure')}
                                <ArrowRight size={18} className="ml-2" />
                            </Link>
                        </div>
                    );
                } else {
                    // User has pending enrollment but this is NOT their demo program - only show view details
                    return (
                        <div className="space-y-3">
                            {/* Disabled message */}
                            <div className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl font-medium text-base flex items-center justify-center shadow-md cursor-not-allowed">
                                <Clock size={20} className="mr-2" />
                                {t('dashboard.enrollment_pending_other')}
                            </div>
                            
                            {/* View Details Button */}
                            <Link
                                href={route("programs.show", program.slug)}
                                className="w-full text-white py-3 rounded-xl font-medium text-base transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg border border-gray-300"
                                style={{
                                    background: 'var(--primary-gradient, linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229)))'
                                }}
                            >
                                🔍 {t('dashboard.explore_adventure')}
                                <ArrowRight size={18} className="ml-2" />
                            </Link>
                        </div>
                    );
                }
            }
            
            // User has no pending enrollments - show normal demo/enroll logic
            if (hasActiveDemo && !isCurrentDemoProgram) {
                // User has demo for different program - show disabled state
                return (
                    <div className="space-y-3">
                        {/* Disabled Demo Button */}
                        <div className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-bold text-lg flex items-center justify-center shadow-md cursor-not-allowed">
                            <Play size={20} className="mr-2" />
                            {t('demo.one_demo_only')}
                        </div>
                        
                        {/* View Details Button */}
                        <Link
                            href={route("programs.show", program.slug)}
                            className="w-full text-white py-3 rounded-xl font-medium text-base transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg border border-gray-300"
                            style={{
                                background: 'var(--primary-gradient, linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229)))'
                            }}
                        >
                            🔍 {t('dashboard.explore_adventure')}
                            <ArrowRight size={18} className="ml-2" />
                        </Link>
                    </div>
                );
            } else if (isCurrentDemoProgram) {
                // User has active demo for this program - show "Continue Demo"
                return (
                    <div className="space-y-3">
                        {/* Continue Demo Button */}
                        <Link
                            href={`/demo/${program.slug}/dashboard`}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 text-white no-underline"
                        >
                            <Play size={20} className="mr-2" />
                            🎮 {t('demo.continue_demo')}
                        </Link>
                        
                        {/* View Details Button */}
                        <Link
                            href={route("programs.show", program.slug)}
                            className="w-full text-white py-3 rounded-xl font-medium text-base transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg border border-gray-300"
                            style={{
                                background: 'var(--primary-gradient, linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229)))'
                            }}
                        >
                            🔍 {t('dashboard.explore_adventure')}
                            <ArrowRight size={18} className="ml-2" />
                        </Link>
                    </div>
                );
            } else {
                // No demo access - show normal demo button
                return (
                    <div className="space-y-3">
                        {/* Demo Button */}
                        {hasAnyActiveEnrollment ? (
                            <div className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl font-bold text-lg flex items-center justify-center shadow-md cursor-not-allowed">
                                <Clock size={20} className="mr-2" />
                                {t('dashboard.enrollment_pending_other')}
                            </div>
                        ) : (
                            <Link
                                href={`/demo/${program.slug}`}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 text-white no-underline"
                            >
                                <Play size={20} className="mr-2" />
                                🎮 {t('demo.try')} {t('demo.start_free_demo')}
                            </Link>
                        )}
                        
                        {/* View Details Button */}
                        <Link
                            href={route("programs.show", program.slug)}
                            className="w-full text-white py-3 rounded-xl font-medium text-base transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg border border-gray-300"
                            style={{
                                background: 'var(--primary-gradient, linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229)))'
                            }}
                        >
                            🔍 {t('dashboard.explore_adventure')}
                            <ArrowRight size={18} className="ml-2" />
                        </Link>
                    </div>
                );
            }
        }

        // Check enrollment status
        switch (enrollment.approval_status) {
            case "pending":
                return (
                    <button
                        disabled
                        className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-4 rounded-xl font-bold text-lg cursor-not-allowed flex items-center justify-center shadow-lg opacity-90"
                    >
                        <Clock size={20} className="mr-2" />
                        📋 {t('dashboard.pending_approval')}
                    </button>
                );
            case "approved":
                return (
                    <button
                        onClick={() =>
                            router.visit(
                                route("dashboard")
                            )
                        }
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        🚀 {t('dashboard.continue_learning')}
                        <ArrowRight size={20} className="ml-2" />
                    </button>
                );
            case "rejected":
                return (
                    <button
                        disabled
                        className="w-full bg-gradient-to-r from-red-300 to-pink-400 text-white py-4 rounded-xl font-bold text-lg cursor-not-allowed flex items-center justify-center shadow-lg opacity-75"
                    >
                        😞 {t('dashboard.rejected')}
                    </button>
                );
            default:
                return (
                    <Link
                        href={route("programs.show", program.slug)}
                        className="w-full text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                        style={{
                            background: 'var(--primary-gradient, linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229)))'
                        }}
                    >
                        🔍 {t('dashboard.explore_adventure')}
                        <ArrowRight size={20} className="ml-2" />
                    </Link>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center">
                    <Sparkles className="mr-3 text-yellow-500" size={36} />
                    {t('dashboard.available_programs')}
                    <Sparkles className="ml-3 text-yellow-500" size={36} />
                </h2>
                <p className="text-xl text-gray-600">
                    {t('dashboard.pick_adventure')} 🚀
                </p>
            </div>

            {/* Demo Limitations Notice */}
            {!userEnrollments.length && (
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-2xl p-6">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                                <Play className="text-orange-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t('demo.demo_info_title')}
                            </h3>
                            <div className="text-gray-600 space-y-2">
                                <p className="text-sm">
                                    ✨ {t('demo.one_program_only')}
                                </p>
                                <p className="text-sm">
                                    ⏰ {t('demo.expires_seven_days')}
                                </p>
                                <p className="text-sm">
                                    📚 {t('demo.first_lesson_only')}
                                </p>
                                <p className="text-sm font-medium text-blue-600">
                                    🎯 {t('demo.choose_wisely')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {programs.map((program) => {
                    const Icon = iconMap[program.icon] || BookOpen;
                    const enrollment = enrollmentMap[program.id];
                    const isPending = enrollment?.approval_status === "pending";
                    const isApproved =
                        enrollment?.approval_status === "approved";

                    return (
                        <div
                            key={program.id}
                            className={`bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden relative ${
                                isPending ? "ring-4 ring-yellow-400 ring-opacity-60" : ""
                            } ${isApproved ? "ring-4 ring-green-400 ring-opacity-60" : ""}`}
                        >
                            {/* Status badge overlay */}
                            {enrollment && (
                                <div className="absolute top-4 right-4 z-10">
                                    {isPending && (
                                        <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse flex items-center">
                                            <Clock size={16} className="mr-1" />
                                            {t('dashboard.pending')} 📋
                                        </span>
                                    )}
                                    {isApproved && (
                                        <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                                            <Star size={16} className="mr-1" />
                                            {t('dashboard.approved')}! ✨
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-white rounded-full p-4 shadow-lg">
                                        <Icon 
                                            size={48} 
                                            style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                                        />
                                    </div>
                                    <div className="text-right">
                                        <span 
                                            className="text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg"
                                            style={{
                                                background: 'var(--primary-gradient, linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229)))'
                                            }}
                                        >
                                            ${program.price}
                                        </span>
                                        <div className="text-sm text-gray-600 mt-1">{t('dashboard.super_value')} 💎</div>
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-3 leading-tight">
                                    {program.name}
                                </h3>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    {program.description}
                                </p>
                            </div>

                            <div className="p-6 bg-white">
                                <div className="flex items-center justify-between text-lg text-gray-600 mb-6 bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <Clock size={20} className="mr-2 text-blue-500" />
                                        <span className="font-medium">{program.duration}</span>
                                    </div>
                                    {program.lessonsCount && (
                                        <div className="flex items-center">
                                            <BookOpen size={20} className="mr-2 text-green-500" />
                                            <span className="font-medium">{program.lessonsCount} {t('lessons.title')}</span>
                                        </div>
                                    )}
                                </div>

                                {getButtonContent(program)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
