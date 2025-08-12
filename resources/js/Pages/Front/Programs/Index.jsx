import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { iconMap } from "@/Utils/iconMapping";
import { BookOpen, Star, Sparkles, Clock, ArrowRight, Users, Award, Play, Zap, Target, Trophy } from "lucide-react";
import StarRating from "@/Components/StarRating";

const ProgramsIndex = ({ auth, programs, userDemoAccess = null, userEnrollments = [] }) => {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    // const { programs, pageTitle, content } = usePage().props;
    const colors = [
        {
            primary: "bg-gradient-to-br from-blue-500 to-blue-600",
            light: "bg-blue-50",
            accent: "text-blue-600",
            border: "border-blue-200",
        },
        {
            primary: "bg-gradient-to-br from-purple-500 to-purple-600", 
            light: "bg-purple-50",
            accent: "text-purple-600",
            border: "border-purple-200",
        },
        {
            primary: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            light: "bg-emerald-50", 
            accent: "text-emerald-600",
            border: "border-emerald-200",
        },
        {
            primary: "bg-gradient-to-br from-orange-500 to-orange-600",
            light: "bg-orange-50",
            accent: "text-orange-600", 
            border: "border-orange-200",
        },
    ];

    // Choose appropriate layout based on authentication
    const LayoutComponent = auth.user ? AuthenticatedLayout : GuestFrontLayout;
    
    return (
        <>
            <Head title={t('programs')} />
            <LayoutComponent auth={auth}>
            <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20 px-6 overflow-hidden">
                {/* Enhanced decorative elements */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-40 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-200 to-yellow-200 rounded-full blur-3xl opacity-40 animate-pulse" 
                     style={{animationDelay: '2s'}} />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse" 
                     style={{animationDelay: '1s'}} />
                
                {/* Floating particles */}
                <motion.div
                    className="absolute top-20 left-20 w-4 h-4 bg-blue-400 rounded-full"
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-40 right-32 w-3 h-3 bg-purple-400 rounded-full"
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
                <motion.div
                    className="absolute bottom-32 left-1/3 w-2 h-2 bg-emerald-400 rounded-full"
                    animate={{
                        y: [0, -25, 0],
                        x: [0, 15, 0],
                        opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
                {/* Welcome Message for New Users */}
                {flash?.welcome && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="max-w-4xl mx-auto mb-12 relative z-10"
                    >
                        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                            <div className="text-center">
                                <motion.div 
                                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-6 shadow-lg"
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles className="text-white" size={32} />
                                </motion.div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                                    {t('programs_page.welcome_title')}
                                </h2>
                                <p className="text-lg text-gray-600 mb-6">
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
                    </motion.div>
                )}

                {/* Hero Section */}
                <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-12"
                    >
                        <div className="flex justify-center mb-8">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 rounded-full shadow-2xl"
                            >
                                <BookOpen className="w-16 h-16 text-white" />
                            </motion.div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            {t('programs_page.discover_title')} 
                            <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                                {t('programs_page.learning_programs')}
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8">
                            {t('programs_page.subtitle')}
                        </p>
                        <div className="w-32 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mx-auto"></div>
                    </motion.div>
                </div>

                {/* Demo Limitations Notice - Only show for logged in users without enrollments */}
                {auth.user && !userEnrollments.length && (
                    <motion.div 
                        className="max-w-4xl mx-auto mb-12 relative z-10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-3xl p-8 shadow-xl">
                            <div className="text-center">
                                <motion.div 
                                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mb-6 shadow-lg"
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ 
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Play className="text-white" size={32} />
                                </motion.div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                                    {t('demo.demo_info_title')}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50">
                                        <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium">
                                            {t('demo.one_program_only')}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
                                        <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium">
                                            {t('demo.expires_seven_days')}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
                                        <BookOpen className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium">
                                            {t('demo.first_lesson_only')}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200/50">
                                        <Target className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-orange-600">
                                            {t('demo.choose_wisely')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Programs Grid */}
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {programs.map((program, index) => {
                            const color = colors[index % colors.length];
                            const Icon = iconMap[program.icon] || BookOpen;
                            
                            // Check user's enrollment and demo status
                            const userEnrollment = userEnrollments.find(enrollment => {
                                // Ensure both values are compared as the same type (numbers)
                                return parseInt(enrollment.program_id) === parseInt(program.id);
                            });
                            const hasAnyEnrollment = userEnrollments.length > 0;
                            const hasActiveDemo = userDemoAccess && userDemoAccess.program_slug;
                            const isCurrentDemoProgram = hasActiveDemo && userDemoAccess.program_slug === program.slug;

                            // Debug logging for troubleshooting
                            if (hasAnyEnrollment && index === 0) { // Only log for first program to avoid spam
                                console.log('Enrollment Debug:', {
                                    programId: program.id,
                                    programName: program.name,
                                    userEnrollments: userEnrollments,
                                    userEnrollment: userEnrollment,
                                    hasAnyEnrollment: hasAnyEnrollment,
                                    isActive: userEnrollment?.status === 'active',
                                    isApproved: userEnrollment?.approval_status === 'approved'
                                });
                            }
                            
                            return (
                                <motion.div
                                    key={program.id}
                                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="group"
                                >
                                    <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 overflow-hidden h-full flex flex-col backdrop-saturate-150">
                                            {/* Header with Icon */}
                                            <div className={`${color.light}/60 backdrop-blur-sm relative p-8 text-center border-b border-white/30`}>
                                                {/* Enhanced Background Pattern */}
                                                <div className="absolute inset-0 opacity-10">
                                                    <motion.div 
                                                        className="absolute top-4 left-4"
                                                        animate={{ rotate: [0, 360] }}
                                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <div className="w-8 h-8 border-2 border-current rounded-full opacity-20"></div>
                                                    </motion.div>
                                                    <motion.div 
                                                        className="absolute top-8 right-6"
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                                    >
                                                        <div className="w-4 h-4 border border-current rounded opacity-30"></div>
                                                    </motion.div>
                                                    <motion.div 
                                                        className="absolute bottom-6 left-8"
                                                        animate={{ rotate: [0, 45, 90, 45, 0] }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                    >
                                                        <div className="w-6 h-6 border border-current opacity-25"></div>
                                                    </motion.div>
                                                </div>
                                                
                                                {/* Enhanced Icon */}
                                                <motion.div 
                                                    className={`${color.primary} inline-flex p-6 rounded-3xl shadow-lg group-hover:shadow-xl transition-all duration-500 relative overflow-hidden`}
                                                    whileHover={{ rotate: [0, 5, -5, 0] }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    <Icon size={56} className="text-white relative z-10" />
                                                </motion.div>
                                                
                                                {/* Enhanced Badge */}
                                                <motion.div 
                                                    className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border-2 border-white"
                                                    animate={{ rotate: [0, 10, -10, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                >
                                                    <Sparkles className="w-3 h-3 inline mr-1" />
                                                    {t('programs_page.new_badge')}
                                                </motion.div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-8 flex-1 flex flex-col bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-sm">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                                    {program.name}
                                                </h3>
                                                <p className="text-gray-700 leading-relaxed mb-6 flex-1">
                                                    {program.description}
                                                </p>

                                                {/* Rating */}
                                                <div className="mb-6">
                                                    <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                                                        <div className="flex items-center space-x-2">
                                                            <StarRating rating={program.average_rating || 0} size={18} />
                                                            <span className="text-sm text-gray-600 font-medium">
                                                                {program.average_rating > 0 ? `${program.average_rating}` : 'New'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 text-gray-500">
                                                            <Trophy className="w-4 h-4" />
                                                            <span className="text-xs font-medium">
                                                                {program.total_reviews_count || 0} reviews
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Stats */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center space-x-2 text-gray-500">
                                                            <Clock size={16} />
                                                            <span>{program.duration}</span>
                                                        </div>
                                                        <div className={`${color.accent} font-bold text-lg`}>
                                                            €{program.price}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Features */}
                                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                                        <div className="flex items-center space-x-1">
                                                            <Users size={12} />
                                                            <span>{t('programs_page.all_ages')}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Award size={12} />
                                                            <span>{t('programs_page.certificate')}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* CTA Buttons */}
                                                    <div className="space-y-2">
                                                        {/* Demo Button Logic - Only show for users with no enrollments */}
                                                        {!hasAnyEnrollment && (
                                                            <>
                                                                {hasActiveDemo && !isCurrentDemoProgram ? (
                                                                    // User has demo for different program - disabled
                                                                    <div className="w-full bg-gray-300 text-gray-500 text-center py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 cursor-not-allowed">
                                                                        <Play size={16} />
                                                                        <span>{t('demo.one_demo_only')}</span>
                                                                    </div>
                                                                ) : isCurrentDemoProgram ? (
                                                                    // User has active demo for this program - continue
                                                                    <Link 
                                                                        href={`/demo/${program.slug}/dashboard`}
                                                                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2.5 px-4 rounded-xl font-medium text-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group/demo"
                                                                    >
                                                                        <Play size={16} className="group-hover/demo:scale-110 transition-transform duration-300" />
                                                                        <span>{t('demo.continue_demo')}</span>
                                                                    </Link>
                                                                ) : (
                                                                    // Normal demo button
                                                                    <Link 
                                                                        href={route('demo.access', program.slug)}
                                                                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2.5 px-4 rounded-xl font-medium text-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group/demo"
                                                                    >
                                                                        <Play size={16} className="group-hover/demo:scale-110 transition-transform duration-300" />
                                                                        <span>{t('demo.try')} {t('demo.start_free_demo')}</span>
                                                                    </Link>
                                                                )}
                                                            </>
                                                        )}
                                                        
                                                        {/* Main CTA Button */}
                                                        {userEnrollment && userEnrollment.approval_status === 'approved' && userEnrollment.status === 'active' ? (
                                                            // Enrolled, approved and ACTIVE in THIS program - go to dashboard
                                                            <Link 
                                                                href={route("dashboard")}
                                                                className={`${color.primary} text-white text-center py-3 px-4 rounded-xl font-medium text-sm group-hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2`}
                                                            >
                                                                <span>Go to Dashboard</span>
                                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                                            </Link>
                                                        ) : userEnrollment && userEnrollment.approval_status === 'approved' ? (
                                                            // Enrolled and approved but NOT active (completed/paused) - view details
                                                            <Link 
                                                                href={route("programs.show", program.slug)}
                                                                className={`${color.primary} text-white text-center py-3 px-4 rounded-xl font-medium text-sm group-hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2`}
                                                            >
                                                                <span>View Details</span>
                                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                                            </Link>
                                                        ) : userEnrollment && userEnrollment.approval_status === 'pending' ? (
                                                            // Pending enrollment for THIS program
                                                            <div className="bg-yellow-500 text-white text-center py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2">
                                                                <Clock size={16} />
                                                                <span>Enrollment Pending</span>
                                                            </div>
                                                        ) : hasAnyEnrollment ? (
                                                            // User is enrolled in ANOTHER program - just show details
                                                            <Link 
                                                                href={route("programs.show", program.slug)}
                                                                className={`${color.primary} text-white text-center py-3 px-4 rounded-xl font-medium text-sm group-hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2`}
                                                            >
                                                                <span>View Details</span>
                                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                                            </Link>
                                                        ) : (
                                                            // Not enrolled in any program - show normal enrollment button
                                                            <Link 
                                                                href={route("programs.show", program.slug)}
                                                                className={`${color.primary} text-white text-center py-3 px-4 rounded-xl font-medium text-sm group-hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2`}
                                                            >
                                                                <span>{t('programs_page.start_learning')}</span>
                                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
            </LayoutComponent>
        </>
    );
};

export default ProgramsIndex;
