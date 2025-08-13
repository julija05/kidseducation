import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    CircleDot,
    Lock,
    Play,
    FileText,
    Calculator,
    Trophy,
    ChevronDown,
    ChevronRight,
    Download,
    ExternalLink,
    Video,
    File,
    Link as LinkIcon,
    Eye,
    Star,
    Zap,
    Target,
    Sparkles,
    Award,
} from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme, useThemeClasses } from "@/hooks/useTheme.jsx";
import { motion } from "framer-motion";

export default function ProgramContent({
    program,
    onStartLesson,
    onReviewLesson,
}) {
    const { t } = useTranslation();
    // Temporarily disable theme system
    // const { theme } = useTheme();
    // const themeClasses = useThemeClasses();
    // Theme colors are now handled by CSS variables
    // Theme colors are now handled by CSS variables and inline styles
    
    // Note: Translation is now handled by the backend models
    // program.translated_name and program.translated_description are automatically localized
    const [expandedLevels, setExpandedLevels] = useState(
        new Set([program.currentLevel])
    );
    const [expandedLessons, setExpandedLessons] = useState(new Set());

    const toggleLevel = (level) => {
        const newExpanded = new Set(expandedLevels);
        if (newExpanded.has(level)) {
            newExpanded.delete(level);
        } else {
            newExpanded.add(level);
        }
        setExpandedLevels(newExpanded);
    };

    const toggleLesson = (lessonId) => {
        const newExpanded = new Set(expandedLessons);
        if (newExpanded.has(lessonId)) {
            newExpanded.delete(lessonId);
        } else {
            newExpanded.add(lessonId);
        }
        setExpandedLessons(newExpanded);
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case "video":
                return <Video size={16} style={{ color: 'rgb(var(--primary-600, 37 99 235))' }} />;
            case "document":
                return <FileText size={16} className="text-green-600" />;
            case "link":
                return <ExternalLink size={16} className="text-purple-600" />;
            case "download":
                return <Download size={16} className="text-indigo-600" />;
            case "interactive":
                return <Calculator size={16} className="text-orange-600" />;
            case "quiz":
                return <Trophy size={16} className="text-yellow-600" />;
            default:
                return <File size={16} className="text-gray-600" />;
        }
    };

    const getResourceTypeColor = (type) => {
        switch (type) {
            case "video":
                return "border";
                // Use inline styles for theme colors instead of classes
            case "document":
                return "bg-green-50 border-green-200 text-green-700";
            case "link":
                return "bg-purple-50 border-purple-200 text-purple-700";
            case "download":
                return "bg-indigo-50 border-indigo-200 text-indigo-700";
            case "interactive":
                return "bg-orange-50 border-orange-200 text-orange-700";
            case "quiz":
                return "bg-yellow-50 border-yellow-200 text-yellow-700";
            default:
                return "bg-gray-50 border-gray-200 text-gray-700";
        }
    };

    const handleResourceClick = (resource) => {
        // Mark resource as viewed
        router.post(
            route("lesson-resources.mark-viewed", resource.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );

        // Handle different resource types
        if (resource.resource_url) {
            // External URL - open in new tab
            window.open(resource.resource_url, "_blank");
        } else if (resource.download_url) {
            // Downloadable file
            window.open(resource.download_url, "_blank");
        } else if (resource.stream_url) {
            // Streamable content
            window.open(resource.stream_url, "_blank");
        }
    };

    const getLessonIcon = (status, isUnlocked, isLevelUnlocked) => {
        if (!isLevelUnlocked) {
            return <Lock size={16} className="text-gray-400" />;
        }
        
        if (!isUnlocked) {
            return <Lock size={16} className="text-gray-400" />;
        }

        switch (status) {
            case "completed":
                return <CheckCircle size={16} className="text-white" />;
            case "in_progress":
                return <CircleDot size={16} className="text-white" />;
            default:
                return (
                    <div className="w-4 h-4 rounded-full border-2 border-white"></div>
                );
        }
    };

    const getLessonButtonConfig = (lesson) => {
        // Check if lesson level is unlocked based on points
        const isLevelUnlocked = lesson.level <= (program.highestUnlockedLevel || 1);
        
        if (!isLevelUnlocked) {
            const pointsNeeded = program.levelRequirements?.[lesson.level] || 0;
            return {
                text: t('dashboard.locked_points_needed', { points: pointsNeeded }),
                className: "bg-gray-100 text-gray-400 cursor-not-allowed",
                onClick: () => {},
                disabled: true,
            };
        }

        if (!lesson.is_unlocked) {
            return {
                text: t('dashboard.locked_generic'),
                className: "bg-gray-100 text-gray-400 cursor-not-allowed",
                onClick: () => {},
                disabled: true,
            };
        }

        switch (lesson.status) {
            case "completed":
                return {
                    text: t('dashboard.review'),
                    className: "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    onClick: () => handleLessonClick(lesson, "review"),
                    disabled: false,
                };
            case "in_progress":
                return {
                    text: t('dashboard.continue'),
                    className: `${program.theme.color} text-white hover:opacity-90`,
                    onClick: () => handleLessonClick(lesson, "continue"),
                    disabled: false,
                };
            default:
                return {
                    text: t('dashboard.start'),
                    className: `${program.theme.color} text-white hover:opacity-90`,
                    onClick: () => handleLessonClick(lesson, "start"),
                    disabled: false,
                };
        }
    };

    const getStatusColor = (status, isUnlocked) => {
        if (!isUnlocked) {
            return "bg-gray-300";
        }

        switch (status) {
            case "completed":
                return "bg-green-500";
            case "in_progress":
                return 'bg-[rgb(var(--primary-600,37_99_235))]';
            default:
                return "bg-gray-300";
        }
    };

    const getContentTypeIcon = (contentType) => {
        switch (contentType) {
            case "video":
                return <Play size={14} className="mr-1" />;
            case "text":
                return <FileText size={14} className="mr-1" />;
            case "interactive":
                return <Calculator size={14} className="mr-1" />;
            case "quiz":
                return <Trophy size={14} className="mr-1" />;
            default:
                return <BookOpen size={14} className="mr-1" />;
        }
    };

    const handleLessonClick = (lesson, action) => {
        if (lesson.id) {
            // Navigate to the lesson page
            router.visit(route("lessons.show", lesson.id));
        } else {
            // Fallback to the callback functions
            if (action === "review") {
                onReviewLesson(lesson.id);
            } else {
                onStartLesson(lesson.id);
            }
        }
    };

    const getLevelStatus = (levelData, levelNumber) => {
        if (!levelData) return { status: "locked", text: t('dashboard.locked_generic') };

        // Check if level is unlocked based on points
        const isUnlocked = levelNumber <= (program.highestUnlockedLevel || 1);
        
        if (!isUnlocked) {
            const pointsNeeded = program.levelRequirements?.[levelNumber] || 0;
            return { 
                status: "locked", 
                text: t('dashboard.locked_points_needed', { points: pointsNeeded }) 
            };
        }

        if (levelData.isCompleted) {
            return { status: "completed", text: t('dashboard.completed') };
        } else if (levelData.isUnlocked) {
            return { status: "current", text: t('dashboard.in_progress') };
        } else {
            return { status: "current", text: t('dashboard.available') };
        }
    };

    const getLevelBadgeClass = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "current":
                return 'border';
                // Use inline styles for theme colors
            case "locked":
                return "bg-gray-100 text-gray-500";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };

    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Modern Program Overview */}
            <motion.div
                className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-white/50 shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
            >
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                            {t('dashboard.welcome_to_program')} {program.translated_name || program.name}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            {program.translated_description || program.description}
                        </p>
                    </div>
                    <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-xl shadow-lg ml-6"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <BookOpen className="w-8 h-8 text-white" />
                    </motion.div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50 shadow-sm"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                                <Calendar size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t('dashboard.enrolled_on')}</p>
                                <p className="font-bold text-gray-800">{program.enrolledAt}</p>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50 shadow-sm"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                                <BookOpen size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t('dashboard.level')}</p>
                                <p className="font-bold text-gray-800">
                                    {t('dashboard.level_of', { current: program.currentLevel, total: program.totalLevels })}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yellow-200/50 shadow-sm"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2, delay: 0.2 }}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
                                <Star size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t('dashboard.points')}</p>
                                <p className="font-bold text-yellow-600 text-lg">
                                    {program.quizPoints || 0} {t('dashboard.points')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
            
            {/* Modern Points & Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Modern Current Points Card */}
                <motion.div 
                    className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-8 border border-white/50 shadow-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                            {t('dashboard.your_points')}
                        </h4>
                        <motion.div 
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl shadow-lg"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Star className="w-6 h-6 text-white" />
                        </motion.div>
                    </div>
                    <div className="text-center">
                        <motion.div 
                            className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                        >
                            {program.quizPoints || 0}
                        </motion.div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                            {t('dashboard.total_points_earned')}
                        </p>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yellow-200/50">
                            <p className="text-sm text-gray-600 font-medium">
                                {t('dashboard.from_completing_quizzes')}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Modern Next Level Progress Card */}
                {program.pointsNeededForNextLevel !== null && program.pointsNeededForNextLevel > 0 ? (
                    <motion.div 
                        className="bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 rounded-2xl p-8 border border-white/50 shadow-lg"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                {t('dashboard.next_level', { level: program.highestUnlockedLevel + 1 })}
                            </h4>
                            <motion.div 
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-3 rounded-xl shadow-lg"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Target className="w-6 h-6 text-white" />
                            </motion.div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-700">{t('dashboard.progress_label')}:</span>
                                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                    {program.quizPoints || 0} / {program.pointsForNextLevel || 0}
                                </span>
                            </div>
                            <div className="relative">
                                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                                    <motion.div
                                        className="h-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-lg"
                                        initial={{ width: 0 }}
                                        animate={{ 
                                            width: `${Math.min(100, ((program.quizPoints || 0) / (program.pointsForNextLevel || 1)) * 100)}%` 
                                        }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse opacity-50 rounded-full" />
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50 text-center">
                                <p className="text-lg font-bold text-gray-800 mb-1">
                                    {t('dashboard.more_points_needed', { points: program.pointsNeededForNextLevel })}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {t('dashboard.complete_quizzes_unlock', { level: program.highestUnlockedLevel + 1 })}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    // Show congratulations only if student actually has points and unlocked levels
                    program.quizPoints > 0 && program.highestUnlockedLevel >= program.totalLevels ? (
                        <motion.div 
                            className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 border border-white/50 shadow-lg"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {t('dashboard.all_levels_unlocked')}
                                </h4>
                                <motion.div 
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Trophy className="w-6 h-6 text-white" />
                                </motion.div>
                            </div>
                            <div className="text-center">
                                <motion.div 
                                    className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                                >
                                    {t('dashboard.congratulations_all_unlocked')}
                                </motion.div>
                                <p className="text-lg font-semibold text-gray-700 mb-2">
                                    {t('dashboard.unlocked_all_levels')}
                                </p>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-200/50">
                                    <p className="text-sm text-gray-600">
                                        {t('dashboard.keep_completing_quizzes')}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        // Show getting started message for students with 0 points
                        <motion.div 
                            className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-white/50 shadow-lg"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {t('dashboard.ready_to_start_learning')}
                                </h4>
                                <motion.div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl shadow-lg"
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Zap className="w-6 h-6 text-white" />
                                </motion.div>
                            </div>
                            <div className="text-center space-y-4">
                                <motion.div 
                                    className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                                >
                                    {t('dashboard.lets_begin')}
                                </motion.div>
                                <p className="text-lg font-semibold text-gray-700">
                                    {t('dashboard.start_with_level_1')}
                                </p>
                                <p className="text-gray-600">
                                    {t('dashboard.you_need_points_unlock', { points: program.levelRequirements?.['2'] || 10, level: 2 })}
                                </p>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
                                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                                        <Sparkles size={16} />
                                        <p className="text-sm font-medium">
                                            {t('dashboard.complete_quizzes_earn_points')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                )}
            </div>

            {/* Modern Next Lesson Card */}
            {program.nextLesson && (
                <motion.div 
                    className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-8 border border-white/50 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center mb-4">
                                <motion.div 
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg mr-4"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Play className="w-6 h-6 text-white" />
                                </motion.div>
                                <div>
                                    <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        {t('dashboard.continue_your_learning')}
                                    </h4>
                                    <p className="text-gray-600">{t('dashboard.pick_up_where_left_off')}</p>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
                                <p className="text-lg font-bold text-gray-800 mb-1">
                                    {program.nextLesson.translated_title || program.nextLesson.title}
                                </p>
                                <div className="flex items-center text-gray-600">
                                    <Target size={16} className="mr-2" />
                                    <span className="font-medium">{t('dashboard.level')} {program.nextLesson.level}</span>
                                </div>
                            </div>
                        </div>
                        <motion.button
                            onClick={() => handleLessonClick(program.nextLesson, "start")}
                            className="ml-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="flex items-center space-x-2">
                                <span>{t('dashboard.continue')}</span>
                                <ChevronRight size={20} />
                            </div>
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Modern Lessons by Level */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <motion.div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl shadow-lg"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <BookOpen className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h4 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {t('dashboard.your_learning_path')}
                            </h4>
                            <p className="text-gray-600">{t('dashboard.explore_lessons_by_level')}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.entries(program.lessons || {}).map(
                        ([level, lessons]) => {
                            const levelData = program.levelProgress?.find(
                                (l) => l.level === parseInt(level)
                            );
                            const levelStatus = getLevelStatus(levelData, parseInt(level));
                            const isExpanded = expandedLevels.has(
                                parseInt(level)
                            );

                            return (
                                <div
                                    key={level}
                                    className="bg-white border rounded-lg overflow-hidden"
                                >
                                    {/* Level Header */}
                                    <div
                                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() =>
                                            toggleLevel(parseInt(level))
                                        }
                                    >
                                        <div className="flex items-center">
                                            {isExpanded ? (
                                                <ChevronDown
                                                    size={20}
                                                    className="mr-2 text-gray-500"
                                                />
                                            ) : (
                                                <ChevronRight
                                                    size={20}
                                                    className="mr-2 text-gray-500"
                                                />
                                            )}
                                            <h5 className="text-lg font-semibold">
                                                {t('dashboard.level')} {level}
                                            </h5>
                                            <span
                                                className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeClass(
                                                    levelStatus.status
                                                )}`}
                                            >
                                                {levelStatus.text}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            {levelData && (
                                                <div className="text-sm text-gray-600 mr-4">
                                                    {levelData.completed}/
                                                    {levelData.total} {t('dashboard.lessons')}
                                                </div>
                                            )}
                                            {levelData &&
                                                levelData.isUnlocked && (
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${program.theme.color}`}
                                                            style={{
                                                                width: `${levelData.progress}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* Level Lessons */}
                                    {isExpanded && (
                                        <div className="p-4 space-y-3">
                                            {lessons.map((lesson) => {
                                                const buttonConfig =
                                                    getLessonButtonConfig(
                                                        lesson
                                                    );
                                                const isLessonExpanded =
                                                    expandedLessons.has(
                                                        lesson.id
                                                    );
                                                const hasResources =
                                                    lesson.resources &&
                                                    lesson.resources.length > 0;

                                                return (
                                                    <div
                                                        key={lesson.id}
                                                        className={`bg-gray-50 border rounded-lg transition-all ${
                                                            lesson.is_unlocked && lesson.level <= (program.highestUnlockedLevel || 1)
                                                                ? "hover:shadow-md hover:bg-white"
                                                                : "opacity-60"
                                                        }`}
                                                    >
                                                        {/* Lesson Header */}
                                                        <div className="p-4 flex items-center justify-between">
                                                            <div className="flex items-center flex-1">
                                                                <div
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getStatusColor(
                                                                        lesson.status,
                                                                        lesson.is_unlocked && lesson.level <= (program.highestUnlockedLevel || 1)
                                                                    )}`}
                                                                >
                                                                    {getLessonIcon(
                                                                        lesson.status,
                                                                        lesson.is_unlocked,
                                                                        lesson.level <= (program.highestUnlockedLevel || 1)
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <h6 className="font-medium">
                                                                            {
                                                                                lesson.translated_title || lesson.title
                                                                            }
                                                                        </h6>
                                                                        {hasResources && (
                                                                            <button
                                                                                onClick={(
                                                                                    e
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    toggleLesson(
                                                                                        lesson.id
                                                                                    );
                                                                                }}
                                                                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                                                            >
                                                                                {isLessonExpanded ? (
                                                                                    <ChevronDown
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                    />
                                                                                ) : (
                                                                                    <ChevronRight
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                                        <Clock
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="mr-1"
                                                                        />
                                                                        <span>
                                                                            {
                                                                                lesson.duration
                                                                            }
                                                                        </span>
                                                                        <span className="mx-2">
                                                                            •
                                                                        </span>
                                                                        {getContentTypeIcon(
                                                                            lesson.content_type
                                                                        )}
                                                                        <span className="capitalize">
                                                                            {lesson.content_type_display ||
                                                                                lesson.content_type}
                                                                        </span>
                                                                        {hasResources && (
                                                                            <>
                                                                                <span className="mx-2">
                                                                                    •
                                                                                </span>
                                                                                <Eye
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                    className="mr-1"
                                                                                />
                                                                                <span>
                                                                                    {
                                                                                        lesson
                                                                                            .resources
                                                                                            .length
                                                                                    }{" "}
                                                                                    {lesson.resources.length === 1 ? t('dashboard.resource') : t('dashboard.resources')}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                        {lesson.status ===
                                                                            "completed" &&
                                                                            lesson.score && (
                                                                                <>
                                                                                    <span className="mx-2">
                                                                                        •
                                                                                    </span>
                                                                                    <Trophy
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                        className="mr-1 text-yellow-500"
                                                                                    />
                                                                                    <span className="text-yellow-600">
                                                                                        {
                                                                                            lesson.score
                                                                                        }

                                                                                        %
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={
                                                                    buttonConfig.onClick
                                                                }
                                                                disabled={
                                                                    buttonConfig.disabled
                                                                }
                                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${buttonConfig.className}`}
                                                            >
                                                                {
                                                                    buttonConfig.text
                                                                }
                                                            </button>
                                                        </div>

                                                        {/* Lesson Resources */}
                                                        {isLessonExpanded &&
                                                            hasResources && (
                                                                <div className="px-4 pb-4">
                                                                    <h6 className="text-sm font-semibold text-gray-700 mb-3">
                                                                        {t('dashboard.learning_resources')}:
                                                                    </h6>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                        {lesson.resources.map(
                                                                            (
                                                                                resource
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        resource.id
                                                                                    }
                                                                                    className={`border rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all ${getResourceTypeColor(
                                                                                        resource.type
                                                                                    )}`}
                                                                                    onClick={() =>
                                                                                        handleResourceClick(
                                                                                            resource
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <div className="flex items-start">
                                                                                        <div className="mr-2 mt-0.5">
                                                                                            {getResourceIcon(
                                                                                                resource.type
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <h6 className="text-sm font-medium truncate">
                                                                                                {
                                                                                                    resource.title
                                                                                                }
                                                                                            </h6>
                                                                                            {resource.description && (
                                                                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                                                                    {
                                                                                                        resource.description
                                                                                                    }
                                                                                                </p>
                                                                                            )}
                                                                                            <div className="flex items-center justify-between mt-2">
                                                                                                <span className="text-xs font-medium capitalize">
                                                                                                    {
                                                                                                        resource.type
                                                                                                    }
                                                                                                </span>
                                                                                                {resource.is_required && (
                                                                                                    <span className="text-xs bg-red-100 text-red-600 px-1 rounded">
                                                                                                        {t('dashboard.required')}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                    {!lesson.is_unlocked && (
                                                                        <div className="mt-3 text-center">
                                                                            <p className="text-sm text-gray-500">
                                                                                Complete
                                                                                previous
                                                                                lessons
                                                                                to
                                                                                unlock
                                                                                resources
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                        {/* Show "Coming Soon" message if no resources */}
                                                        {isLessonExpanded &&
                                                            !hasResources &&
                                                            lesson.is_unlocked && (
                                                                <div className="px-4 pb-4">
                                                                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                                                        <FileText
                                                                            size={
                                                                                24
                                                                            }
                                                                            className="mx-auto text-gray-400 mb-2"
                                                                        />
                                                                        <p className="text-sm text-gray-500">
                                                                            {t('dashboard.coming_soon')}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                            {t('dashboard.resources_being_prepared')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
