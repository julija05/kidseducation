// resources/js/Components/Dashboard/ProgramContent.jsx
import React from "react";
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    CircleDot,
} from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";

export default function ProgramContent({
    program,
    onStartLesson,
    onReviewLesson,
}) {
    // TODO: Replace dummy data with real lessons from backend
    // This is temporary placeholder data
    const dummyLessons = [
        {
            id: 1,
            title: "Introduction to " + program.name,
            duration: "30 min",
            type: "video",
            status: "completed",
        },
        {
            id: 2,
            title: "Getting Started with Basics",
            duration: "45 min",
            type: "text",
            status: "completed",
        },
        {
            id: 3,
            title: "Fundamental Concepts",
            duration: "60 min",
            type: "interactive",
            status: "in_progress",
        },
        {
            id: 4,
            title: "Advanced Techniques",
            duration: "45 min",
            type: "video",
            status: "not_started",
        },
        {
            id: 5,
            title: "Practice Exercises",
            duration: "90 min",
            type: "interactive",
            status: "not_started",
        },
    ];

    // TODO: Replace dummy data with real resources from backend
    // This is temporary placeholder data
    const dummyResources = [
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
    ];

    const getLessonIcon = (status) => {
        switch (status) {
            case "completed":
                return <CheckCircle size={16} className="text-white" />;
            case "in_progress":
                return <CircleDot size={16} className="text-white" />;
            default:
                return null;
        }
    };

    const getLessonButtonConfig = (lesson) => {
        switch (lesson.status) {
            case "completed":
                return {
                    text: "Review",
                    className: "bg-gray-100 text-gray-500 hover:bg-gray-200",
                    onClick: () => onReviewLesson(lesson.id),
                };
            case "in_progress":
                return {
                    text: "Continue",
                    className: `${program.theme.color} text-white hover:opacity-90`,
                    onClick: () => onStartLesson(lesson.id),
                };
            default:
                return {
                    text: "Start",
                    className: `${program.theme.color} text-white hover:opacity-90`,
                    onClick: () => onStartLesson(lesson.id),
                };
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-500";
            case "in_progress":
                return "bg-yellow-500";
            default:
                return "bg-gray-300";
        }
    };

    return (
        <div className="space-y-6">
            <div
                className={`${program.theme.lightColor} border ${program.theme.borderColor} rounded-lg p-6`}
            >
                <h3
                    className={`text-xl font-semibold ${program.theme.textColor} mb-3`}
                >
                    Welcome to {program.name}!
                </h3>
                <p className={program.theme.textColor}>{program.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span>Enrolled on {program.enrolledAt}</span>
                </div>
            </div>

            <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <BookOpen className="mr-2" size={20} />
                    Your Lessons
                </h4>
                <div className="space-y-3">
                    {dummyLessons.map((lesson) => {
                        const buttonConfig = getLessonButtonConfig(lesson);

                        return (
                            <div
                                key={lesson.id}
                                className="bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getStatusColor(
                                            lesson.status
                                        )}`}
                                    >
                                        {getLessonIcon(lesson.status)}
                                    </div>
                                    <div>
                                        <h5 className="font-medium">
                                            {lesson.title}
                                        </h5>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <Clock size={14} className="mr-1" />
                                            <span>{lesson.duration}</span>
                                            {lesson.type !== "text" && (
                                                <>
                                                    <span className="mx-2">
                                                        •
                                                    </span>
                                                    <span className="capitalize">
                                                        {lesson.type}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={buttonConfig.onClick}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${buttonConfig.className}`}
                                >
                                    {buttonConfig.text}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <h4 className="text-lg font-semibold mb-4">
                    Learning Resources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dummyResources.map((resource) => {
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
