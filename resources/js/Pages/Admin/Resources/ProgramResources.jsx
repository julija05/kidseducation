import React, { useState } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    ArrowLeft,
    Plus,
    Video,
    FileText,
    Link2,
    Download,
    Puzzle,
    HelpCircle,
    Edit,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronRight,
    Upload,
    AlertCircle,
    BookOpen,
} from "lucide-react";

export default function ProgramResources() {
    const { program = {}, resourceStats = {} } = usePage().props;
    const [expandedLessons, setExpandedLessons] = useState(new Set());
    const [showBulkImport, setShowBulkImport] = useState(false);

    const resourceTypeIcons = {
        video: Video,
        document: FileText,
        link: Link2,
        download: Download,
        interactive: Puzzle,
        quiz: HelpCircle,
    };

    const resourceTypeColors = {
        video: "text-red-600 bg-red-50",
        document: "text-blue-600 bg-blue-50",
        link: "text-green-600 bg-green-50",
        download: "text-purple-600 bg-purple-50",
        interactive: "text-yellow-600 bg-yellow-50",
        quiz: "text-indigo-600 bg-indigo-50",
    };

    // if (!program.lessons) {
    //     lessons = [];
    // }

    const toggleLesson = (lessonId) => {
        const newExpanded = new Set(expandedLessons);
        if (newExpanded.has(lessonId)) {
            newExpanded.delete(lessonId);
        } else {
            newExpanded.add(lessonId);
        }
        setExpandedLessons(newExpanded);
    };

    const getLessonsByLevel = () => {
        const levels = {};

        program.lessons.forEach((lesson) => {
            if (!levels[lesson.level]) {
                levels[lesson.level] = [];
            }
            levels[lesson.level].push(lesson);
        });
        return levels;
    };

    const lessonsByLevel = getLessonsByLevel();
    console.log("Lessons by Level:", lessonsByLevel);

    return (
        <AdminLayout>
            <Head title={`Resources - ${program.name}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={route("admin.resources.index")}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to All Programs
                    </Link>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {program.name} Resources
                            </h1>
                            <p className="mt-1 text-gray-600">
                                Manage all learning resources for this program
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() =>
                                    setShowBulkImport(!showBulkImport)
                                }
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                            >
                                <Upload size={16} className="mr-2" />
                                Bulk Import
                            </button>
                            <Link
                                href={route(
                                    "admin.resources.program.quickAdd",
                                    program.slug
                                )}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Plus size={16} className="mr-2" />
                                Quick Add Resource
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Resource Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Resources
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {resourceStats.totalResources || 0}
                                </p>
                            </div>
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Videos
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {resourceStats.videoCount || 0}
                                </p>
                            </div>
                            <Video className="h-8 w-8 text-red-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Documents
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {resourceStats.documentCount || 0}
                                </p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Quizzes
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {resourceStats.quizCount || 0}
                                </p>
                            </div>
                            <HelpCircle className="h-8 w-8 text-indigo-500" />
                        </div>
                    </div>
                </div>

                {/* Bulk Import Panel */}
                {showBulkImport && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Bulk Import Resources
                        </h3>
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Upload a CSV or Excel file with resource
                                    information
                                </p>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Choose File
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <a
                                    href="#"
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Download template file
                                </a>
                                <button
                                    onClick={() => setShowBulkImport(false)}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lessons by Level */}
                <div className="space-y-6">
                    {Object.entries(lessonsByLevel).map(([level, lessons]) => (
                        <div key={level} className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Level {level}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {lessons.length} lesson
                                    {lessons.length !== 1 ? "s" : ""}
                                </p>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {lessons.map((lesson) => {
                                    const isExpanded = expandedLessons.has(
                                        lesson.id
                                    );
                                    const hasNoResources =
                                        lesson.resources.length === 0;

                                    return (
                                        <div key={lesson.id}>
                                            <div
                                                className="p-4 hover:bg-gray-50 cursor-pointer"
                                                onClick={() =>
                                                    toggleLesson(lesson.id)
                                                }
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center flex-1">
                                                        <button className="mr-3 text-gray-400 hover:text-gray-600">
                                                            {isExpanded ? (
                                                                <ChevronDown
                                                                    size={20}
                                                                />
                                                            ) : (
                                                                <ChevronRight
                                                                    size={20}
                                                                />
                                                            )}
                                                        </button>
                                                        <div className="flex-1">
                                                            <h3 className="font-medium text-gray-900">
                                                                {lesson.title}
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                                <span>
                                                                    {
                                                                        lesson
                                                                            .resources
                                                                            .length
                                                                    }{" "}
                                                                    resources
                                                                </span>
                                                                {hasNoResources && (
                                                                    <span className="flex items-center text-yellow-600">
                                                                        <AlertCircle
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="mr-1"
                                                                        />
                                                                        No
                                                                        resources
                                                                        added
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route(
                                                                "admin.lessons.resources.create",
                                                                lesson.id
                                                            )}
                                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
                                                            <Plus
                                                                size={14}
                                                                className="inline mr-1"
                                                            />
                                                            Add Resource
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="px-4 pb-4">
                                                    {lesson.resources.length >
                                                    0 ? (
                                                        <div className="ml-8 space-y-2 mt-3">
                                                            {lesson.resources.map(
                                                                (resource) => {
                                                                    const Icon =
                                                                        resourceTypeIcons[
                                                                            resource
                                                                                .type
                                                                        ];
                                                                    const colorClass =
                                                                        resourceTypeColors[
                                                                            resource
                                                                                .type
                                                                        ];

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                resource.id
                                                                            }
                                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                                                                        >
                                                                            <div className="flex items-center">
                                                                                <GripVertical
                                                                                    className="text-gray-400 mr-2"
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                                <div
                                                                                    className={`p-2 rounded ${colorClass} mr-3`}
                                                                                >
                                                                                    <Icon
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-medium text-gray-900">
                                                                                        {
                                                                                            resource.title
                                                                                        }
                                                                                    </p>
                                                                                    {resource.description && (
                                                                                        <p className="text-sm text-gray-600">
                                                                                            {
                                                                                                resource.description
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                                                        <span className="capitalize">
                                                                                            {
                                                                                                resource.type
                                                                                            }
                                                                                        </span>
                                                                                        {resource.is_required && (
                                                                                            <span className="text-green-600">
                                                                                                Required
                                                                                            </span>
                                                                                        )}
                                                                                        {resource.is_downloadable && (
                                                                                            <span className="text-blue-600">
                                                                                                Downloadable
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Link
                                                                                    href={route(
                                                                                        "admin.lessons.resources.edit",
                                                                                        {
                                                                                            lesson: lesson.id,
                                                                                            resource:
                                                                                                resource.id,
                                                                                        }
                                                                                    )}
                                                                                    className="p-1 text-gray-600 hover:text-blue-600"
                                                                                >
                                                                                    <Edit
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                    />
                                                                                </Link>
                                                                                <button className="p-1 text-gray-600 hover:text-red-600">
                                                                                    <Trash2
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                    />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="ml-8 mt-3 p-4 bg-gray-50 rounded-lg text-center">
                                                            <p className="text-gray-500 text-sm">
                                                                No resources
                                                                added to this
                                                                lesson yet.
                                                            </p>
                                                            <Link
                                                                href={route(
                                                                    "admin.lessons.resources.create",
                                                                    lesson.id
                                                                )}
                                                                className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                                            >
                                                                <Plus
                                                                    size={14}
                                                                    className="mr-1"
                                                                />
                                                                Add your first
                                                                resource
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {program.lessons.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Lessons Yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                            This program doesn't have any lessons. Add lessons
                            first before adding resources.
                        </p>
                        <Link
                            href={route("admin.programs.edit", program.slug)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Manage Program
                        </Link>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
