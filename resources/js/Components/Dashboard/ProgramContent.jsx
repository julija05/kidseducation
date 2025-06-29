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
} from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";

export default function ProgramContent({
    program,
    onStartLesson,
    onReviewLesson,
}) {
    const [expandedLevels, setExpandedLevels] = useState(
        new Set([program.currentLevel])
    );

    const toggleLevel = (level) => {
        const newExpanded = new Set(expandedLevels);
        if (newExpanded.has(level)) {
            newExpanded.delete(level);
        } else {
            newExpanded.add(level);
        }
        setExpandedLevels(newExpanded);
    };

    const getLessonIcon = (status, isUnlocked) => {
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
        if (!lesson.is_unlocked) {
            return {
                text: "Locked",
                className: "bg-gray-100 text-gray-400 cursor-not-allowed",
                onClick: () => {},
                disabled: true,
            };
        }

        switch (lesson.status) {
            case "completed":
                return {
                    text: "Review",
                    className: "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    onClick: () => handleLessonClick(lesson, "review"),
                    disabled: false,
                };
            case "in_progress":
                return {
                    text: "Continue",
                    className: `${program.theme.color} text-white hover:opacity-90`,
                    onClick: () => handleLessonClick(lesson, "continue"),
                    disabled: false,
                };
            default:
                return {
                    text: "Start",
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
                return "bg-yellow-500";
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

    const getLevelStatus = (levelData) => {
        if (!levelData) return { status: "locked", text: "Locked" };

        if (levelData.isCompleted) {
            return { status: "completed", text: "Completed" };
        } else if (levelData.isUnlocked) {
            return { status: "current", text: "In Progress" };
        } else {
            return { status: "locked", text: "Locked" };
        }
    };

    const getLevelBadgeClass = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "current":
                return "bg-blue-100 text-blue-800";
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
                className={`${program.theme.lightColor} border ${program.theme.borderColor} rounded-lg p-6`}
            >
                <h3
                    className={`text-xl font-semibold ${program.theme.textColor} mb-3`}
                >
                    Welcome to {program.name}!
                </h3>
                <p className={program.theme.textColor}>{program.description}</p>
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        <span>Enrolled on {program.enrolledAt}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <BookOpen size={16} className="mr-2" />
                        <span>
                            Level {program.currentLevel} of{" "}
                            {program.totalLevels}
                        </span>
                    </div>
                </div>
            </div>

            {/* Next Lesson Card */}
            {program.nextLesson && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">
                        Continue Your Learning
                    </h4>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-800 font-medium">
                                {program.nextLesson.title}
                            </p>
                            <p className="text-blue-600 text-sm">
                                Level {program.nextLesson.level}
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                handleLessonClick(program.nextLesson, "start")
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Lessons by Level */}
            <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <BookOpen className="mr-2" size={20} />
                    Your Learning Path
                </h4>

                <div className="space-y-4">
                    {Object.entries(program.lessons || {}).map(
                        ([level, lessons]) => {
                            const levelData = program.levelProgress?.find(
                                (l) => l.level === parseInt(level)
                            );
                            const levelStatus = getLevelStatus(levelData);
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
                                                Level {level}
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
                                                    {levelData.total} lessons
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

                                                return (
                                                    <div
                                                        key={lesson.id}
                                                        className={`bg-gray-50 border rounded-lg p-4 flex items-center justify-between transition-all ${
                                                            lesson.is_unlocked
                                                                ? "hover:shadow-md hover:bg-white"
                                                                : "opacity-60"
                                                        }`}
                                                    >
                                                        <div className="flex items-center">
                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getStatusColor(
                                                                    lesson.status,
                                                                    lesson.is_unlocked
                                                                )}`}
                                                            >
                                                                {getLessonIcon(
                                                                    lesson.status,
                                                                    lesson.is_unlocked
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h6 className="font-medium">
                                                                    {
                                                                        lesson.title
                                                                    }
                                                                </h6>
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
                                                            {buttonConfig.text}
                                                        </button>
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

            {/* Learning Resources */}
            <div>
                <h4 className="text-lg font-semibold mb-4">
                    Learning Resources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            id: 1,
                            title: "Practice Workbook",
                            type: "PDF",
                            icon: "FileText",
                            url: "#",
                            description: "Download practice exercises",
                        },
                        {
                            id: 2,
                            title: "Video Tutorials",
                            type: "Video",
                            icon: "Play",
                            url: "#",
                            description: "Watch supplementary videos",
                        },
                        {
                            id: 3,
                            title: "Interactive Tools",
                            type: "Interactive",
                            icon: "Calculator",
                            url: "#",
                            description: "Access online tools",
                        },
                    ].map((resource) => {
                        const ResourceIcon =
                            iconMap[resource.icon] || iconMap.FileText;

                        return (
                            <a
                                key={resource.id}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="flex items-center mb-2">
                                    <ResourceIcon
                                        className={
                                            program.theme.textColor + " mr-2"
                                        }
                                        size={20}
                                    />
                                    <span className="text-sm text-gray-500">
                                        {resource.type}
                                    </span>
                                </div>
                                <h5 className="font-medium">
                                    {resource.title}
                                </h5>
                                {resource.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {resource.description}
                                    </p>
                                )}
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
