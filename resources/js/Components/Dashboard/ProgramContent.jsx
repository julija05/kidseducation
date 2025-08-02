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
} from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme, useThemeClasses } from "@/hooks/useTheme.jsx";

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
        <div className="space-y-6">
            {/* Program Overview */}
            <div
                className="border rounded-lg p-6"
                style={{ 
                    backgroundColor: 'rgb(var(--primary-50, 239 246 255))',
                    borderColor: 'rgb(var(--primary-200, 191 219 254))'
                }}
            >
                <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: 'rgb(var(--primary-800, 30 64 175))' }}
                >
                    {t('dashboard.welcome_to_program', { program: program.translated_name || program.name })}
                </h3>
                <p style={{ color: 'rgb(var(--primary-700, 29 78 216))' }}>
                    {program.translated_description || program.description}
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        <span>{t('dashboard.enrolled_on', { date: program.enrolledAt })}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <BookOpen size={16} className="mr-2" />
                        <span>
                            {t('dashboard.level_of', { current: program.currentLevel, total: program.totalLevels })}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Star size={16} className="mr-2 text-yellow-500" />
                        <span className="font-semibold text-yellow-600">
                            {program.quizPoints || 0} {t('dashboard.points')}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Points & Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Points Card */}
                <div 
                    className="border rounded-lg p-6"
                    style={{ 
                        backgroundColor: 'rgb(var(--primary-50, 239 246 255))',
                        borderColor: 'rgb(var(--primary-200, 191 219 254))'
                    }}
                >
                    <h4 
                        className="text-lg font-semibold mb-3 flex items-center"
                        style={{ color: 'rgb(var(--primary-800, 30 64 175))' }}
                    >
                        <Star className="mr-2 text-yellow-500" size={20} />
                        {t('dashboard.your_points')}
                    </h4>
                    <div className="text-center">
                        <div 
                            className="text-4xl font-bold mb-2"
                            style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                        >
                            {program.quizPoints || 0}
                        </div>
                        <p 
                            className="font-medium"
                            style={{ color: 'rgb(var(--primary-700, 29 78 216))' }}
                        >
                            {t('dashboard.total_points_earned')}
                        </p>
                        <p 
                            className="text-sm mt-1"
                            style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                        >
                            {t('dashboard.from_completing_quizzes')}
                        </p>
                    </div>
                </div>

                {/* Next Level Progress Card */}
                {program.pointsNeededForNextLevel !== null && program.pointsNeededForNextLevel > 0 ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                            <Target className="mr-2" size={20} />
                            {t('dashboard.next_level', { level: program.highestUnlockedLevel + 1 })}
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-yellow-800 font-medium">{t('dashboard.progress_label')}:</span>
                                <span className="text-yellow-700 font-bold">
                                    {program.quizPoints || 0} / {program.pointsForNextLevel || 0}
                                </span>
                            </div>
                            <div className="w-full bg-yellow-200 rounded-full h-3">
                                <div
                                    className="h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                                    style={{ 
                                        width: `${Math.min(100, ((program.quizPoints || 0) / (program.pointsForNextLevel || 1)) * 100)}%` 
                                    }}
                                ></div>
                            </div>
                            <div className="text-center">
                                <p className="text-yellow-800 font-semibold">
                                    {t('dashboard.more_points_needed', { points: program.pointsNeededForNextLevel })}
                                </p>
                                <p className="text-yellow-600 text-sm">
                                    {t('dashboard.complete_quizzes_unlock', { level: program.highestUnlockedLevel + 1 })}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Show congratulations only if student actually has points and unlocked levels
                    program.quizPoints > 0 && program.highestUnlockedLevel >= program.totalLevels ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                                <Trophy className="mr-2 text-green-600" size={20} />
                                {t('dashboard.all_levels_unlocked')}
                            </h4>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 mb-2">
                                    {t('dashboard.congratulations_all_unlocked')}
                                </div>
                                <p className="text-green-700 font-medium">
                                    {t('dashboard.unlocked_all_levels')}
                                </p>
                                <p className="text-green-600 text-sm mt-1">
                                    {t('dashboard.keep_completing_quizzes')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Show getting started message for students with 0 points
                        <div 
                            className="border rounded-lg p-6"
                            style={{ 
                                backgroundColor: 'rgb(var(--primary-50, 239 246 255))',
                                borderColor: 'rgb(var(--primary-200, 191 219 254))'
                            }}
                        >
                            <h4 
                                className="text-lg font-semibold mb-3 flex items-center"
                                style={{ color: 'rgb(var(--primary-800, 30 64 175))' }}
                            >
                                <Zap 
                                    className="mr-2" 
                                    size={20} 
                                    style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                                />
                                {t('dashboard.ready_to_start_learning')}
                            </h4>
                            <div className="text-center">
                                <div 
                                    className="text-2xl font-bold mb-2"
                                    style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                                >
                                    {t('dashboard.lets_begin')}
                                </div>
                                <p 
                                    className="font-medium"
                                    style={{ color: 'rgb(var(--primary-700, 29 78 216))' }}
                                >
                                    {t('dashboard.start_with_level_1')}
                                </p>
                                <p className="text-blue-600 text-sm mt-1">
                                    {t('dashboard.you_need_points_unlock', { points: program.levelRequirements?.['2'] || 10, level: 2 })}
                                </p>
                                <div 
                                    className="mt-3 rounded-lg p-3 border"
                                    style={{ backgroundColor: 'rgb(var(--primary-100, 219 234 254))' }}
                                >
                                    <p 
                                        className="text-sm font-medium"
                                        style={{ color: 'rgb(var(--primary-700, 29 78 216))' }}
                                    >
                                        {t('dashboard.complete_quizzes_earn_points')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Next Lesson Card */}
            {program.nextLesson && (
                <div 
                    className="border rounded-lg p-6"
                    style={{ 
                        backgroundColor: 'rgb(var(--primary-50, 239 246 255))',
                        borderColor: 'rgb(var(--primary-200, 191 219 254))'
                    }}
                >
                    <h4 
                        className="text-lg font-semibold mb-2"
                        style={{ color: 'rgb(var(--primary-800, 30 64 175))' }}
                    >
                        {t('dashboard.continue_your_learning')}
                    </h4>
                    <div className="flex items-center justify-between">
                        <div>
                            <p 
                                className="font-medium"
                                style={{ color: 'rgb(var(--primary-700, 29 78 216))' }}
                            >
                                {program.nextLesson.translated_title || program.nextLesson.title}
                            </p>
                            <p 
                                className="text-sm"
                                style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                            >
                                {t('dashboard.level')} {program.nextLesson.level}
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                handleLessonClick(program.nextLesson, "start")
                            }
                            className="text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: 'rgb(var(--primary-600, 37 99 235))' }}
                        >
                            {t('dashboard.continue')}
                        </button>
                    </div>
                </div>
            )}

            {/* Lessons by Level */}
            <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <BookOpen className="mr-2" size={20} />
                    {t('dashboard.your_learning_path')}
                </h4>

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
            </div>
        </div>
    );
}
