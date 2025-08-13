// resources/js/Components/Dashboard/ProgramList.jsx
import React from "react";
import { Link, router } from "@inertiajs/react";
import { ArrowRight, BookOpen, Clock, Star, Sparkles, Play } from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

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
                            {/* Modern Back to Demo Button */}
                            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={`/demo/${program.slug}/dashboard`}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 text-white no-underline"
                                >
                                    <Play size={20} className="mr-2" />
                                    {t('demo.back_to_demo')}
                                </Link>
                            </motion.div>
                            
                            {/* Modern View Details Button */}
                            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={route("programs.show", program.slug)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 text-white no-underline"
                                >
                                    🔍 {t('dashboard.explore_adventure')}
                                    <ArrowRight size={18} className="ml-2" />
                                </Link>
                            </motion.div>
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
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Modern Header Section */}
            <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <motion.h2 
                    className="text-4xl font-bold mb-4 flex items-center justify-center"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Sparkles className="mr-3 text-yellow-500" size={36} />
                    </motion.div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {t('dashboard.available_programs')}
                    </span>
                    <motion.div
                        animate={{ rotate: [0, -15, 15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                        <Sparkles className="ml-3 text-yellow-500" size={36} />
                    </motion.div>
                </motion.h2>
                <motion.p 
                    className="text-xl text-gray-600 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    {t('dashboard.pick_adventure')} 🚀
                </motion.p>
            </motion.div>

            {/* Modern Demo Limitations Notice */}
            {!userEnrollments.length && (
                <motion.div 
                    className="max-w-4xl mx-auto mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <motion.div 
                        className="bg-gradient-to-br from-blue-50 via-orange-50 to-yellow-50 border border-white/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm"
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="text-center">
                            <motion.div 
                                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-6 shadow-lg"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Play className="text-white" size={28} />
                            </motion.div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
                                {t('demo.demo_info_title')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <motion.div 
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200/50 shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <p className="text-sm font-semibold text-orange-700 flex items-center justify-center">
                                        <span className="mr-2">✨</span>
                                        {t('demo.one_program_only')}
                                    </p>
                                </motion.div>
                                <motion.div 
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50 shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <p className="text-sm font-semibold text-blue-700 flex items-center justify-center">
                                        <span className="mr-2">⏰</span>
                                        {t('demo.expires_seven_days')}
                                    </p>
                                </motion.div>
                                <motion.div 
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50 shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.7 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <p className="text-sm font-semibold text-purple-700 flex items-center justify-center">
                                        <span className="mr-2">📚</span>
                                        {t('demo.first_lesson_only')}
                                    </p>
                                </motion.div>
                                <motion.div 
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-200/50 shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <p className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent flex items-center justify-center">
                                        <span className="mr-2">🎯</span>
                                        {t('demo.choose_wisely')}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                {programs.map((program, index) => {
                    const Icon = iconMap[program.icon] || BookOpen;
                    const enrollment = enrollmentMap[program.id];
                    const isPending = enrollment?.approval_status === "pending";
                    const isApproved =
                        enrollment?.approval_status === "approved";

                    return (
                        <motion.div
                            key={program.id}
                            className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl border border-white/50 overflow-hidden relative flex flex-col h-full ${
                                isPending ? "ring-4 ring-yellow-400/60" : ""
                            } ${isApproved ? "ring-4 ring-green-400/60" : ""}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -10 }}
                        >
                            {/* Modern Status badge overlay */}
                            {enrollment && (
                                <motion.div 
                                    className="absolute top-4 right-4 z-10"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                                >
                                    {isPending && (
                                        <motion.span 
                                            className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center backdrop-blur-sm border border-white/30"
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Clock size={16} className="mr-1" />
                                            {t('dashboard.pending')} 📋
                                        </motion.span>
                                    )}
                                    {isApproved && (
                                        <motion.span 
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center backdrop-blur-sm border border-white/30"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Star size={16} className="mr-1" />
                                            {t('dashboard.approved')}! ✨
                                        </motion.span>
                                    )}
                                </motion.div>
                            )}

                            {/* Modern Program Header */}
                            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 relative overflow-hidden flex-grow">
                                {/* Background decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-200/30 to-yellow-200/30 rounded-full blur-2xl" />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <motion.div 
                                            className="bg-white/80 backdrop-blur-sm rounded-full p-4 shadow-lg border border-white/50"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Icon 
                                                size={48} 
                                                style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                                            />
                                        </motion.div>
                                        <div className="text-right">
                                            <motion.span 
                                                className="text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg inline-block bg-gradient-to-r from-blue-600 to-purple-600 border border-white/30"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                ${program.price}
                                            </motion.span>
                                            <div className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
                                                {t('dashboard.super_value')} 💎
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
                                        {program.name}
                                    </h3>
                                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                                        <p className="text-gray-700 text-lg leading-relaxed">
                                            {program.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Modern Program Info & Actions */}
                            <div className="p-8 bg-white/90 backdrop-blur-sm mt-auto">
                                <motion.div 
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                                >
                                    <motion.div 
                                        className="flex items-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50 shadow-sm"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                                            <Clock size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Duration</p>
                                            <span className="font-bold text-gray-800">{program.duration}</span>
                                        </div>
                                    </motion.div>
                                    {program.lessonsCount && (
                                        <motion.div 
                                            className="flex items-center bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200/50 shadow-sm"
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-2 rounded-lg mr-3">
                                                <BookOpen size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Lessons</p>
                                                <span className="font-bold text-gray-800">{program.lessonsCount} {t('lessons.title')}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                                >
                                    {getButtonContent(program)}
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
