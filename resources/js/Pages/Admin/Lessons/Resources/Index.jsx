import React, { useState } from "react";
import { Link, Head, usePage, router } from "@inertiajs/react";
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
    Upload,
    BookOpen,
    Info,
} from "lucide-react";

export default function LessonResourcesIndex() {
    const { lesson = {} } = usePage().props;
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

    const handleDeleteResource = (lessonId, resourceId, resourceTitle) => {
        if (confirm(`Are you sure you want to delete "${resourceTitle}"? This action cannot be undone.`)) {
            router.delete(route("admin.lessons.resources.destroy", [lessonId, resourceId]), {
                preserveScroll: true,
                onError: (errors) => {
                    alert('Failed to delete resource. Please try again.');
                },
            });
        }
    };

    const hasNoResources = !lesson.resources || lesson.resources.length === 0;

    return (
        <AdminLayout>
            <Head title={`Resources - ${lesson.title || "Lesson"}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={route("admin.programs.index")}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Programs
                    </Link>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {lesson.title || "Lesson"} Resources
                            </h1>
                            <p className="mt-1 text-gray-600">
                                Manage all learning resources for this lesson
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
                                href={route("admin.lessons.resources.create", lesson.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Plus size={16} className="mr-2" />
                                Add Resource
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Language Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                <h3 className="text-lg font-medium text-gray-900">English Resources</h3>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">
                                {lesson.resources?.filter(r => r.language === 'en').length || 0}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Videos:</span>
                                <span>{lesson.resources?.filter(r => r.language === 'en' && r.type === 'video').length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Documents:</span>
                                <span>{lesson.resources?.filter(r => r.language === 'en' && r.type === 'document').length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Other:</span>
                                <span>{lesson.resources?.filter(r => r.language === 'en' && !['video', 'document'].includes(r.type)).length || 0}</span>
                            </div>
                        </div>
                        <Link
                            href={route("admin.lessons.resources.create", lesson.id) + "?lang=en"}
                            className="mt-4 block w-full text-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                            Add English Resource
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                                <h3 className="text-lg font-medium text-gray-900">Macedonian Resources</h3>
                            </div>
                            <span className="text-2xl font-bold text-orange-600">
                                {lesson.resources?.filter(r => r.language === 'mk').length || 0}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Videos:</span>
                                <span>{lesson.resources?.filter(r => r.language === 'mk' && r.type === 'video').length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Documents:</span>
                                <span>{lesson.resources?.filter(r => r.language === 'mk' && r.type === 'document').length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Other:</span>
                                <span>{lesson.resources?.filter(r => r.language === 'mk' && !['video', 'document'].includes(r.type)).length || 0}</span>
                            </div>
                        </div>
                        <Link
                            href={route("admin.lessons.resources.create", lesson.id) + "?lang=mk"}
                            className="mt-4 block w-full text-center px-3 py-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors text-sm font-medium"
                        >
                            Add Macedonian Resource
                        </Link>
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

                {/* Resources List */}
                <div className="space-y-6">
                    {hasNoResources ? (
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-8 text-center">
                                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Resources Yet
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    This lesson doesn't have any resources. Add some learning materials to get started.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <Link
                                        href={route("admin.lessons.resources.create", lesson.id) + "?lang=en"}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Add English Resource
                                    </Link>
                                    <Link
                                        href={route("admin.lessons.resources.create", lesson.id) + "?lang=mk"}
                                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Add Macedonian Resource
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* English Resources */}
                            {lesson.resources?.filter(r => r.language === 'en').length > 0 && (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="p-4 border-b border-gray-200 bg-blue-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                                <h3 className="text-lg font-semibold text-gray-900">English Resources</h3>
                                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                    {lesson.resources?.filter(r => r.language === 'en').length}
                                                </span>
                                            </div>
                                            <Link
                                                href={route("admin.lessons.resources.create", lesson.id) + "?lang=en"}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                + Add English
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {lesson.resources?.filter(r => r.language === 'en').map((resource) => {
                                            const Icon = resourceTypeIcons[resource.type];
                                            const colorClass = resourceTypeColors[resource.type];

                                            return (
                                                <div
                                                    key={resource.id}
                                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center">
                                                        <GripVertical
                                                            className="text-gray-400 mr-3"
                                                            size={16}
                                                        />
                                                        <div
                                                            className={`p-2 rounded ${colorClass} mr-3`}
                                                        >
                                                            <Icon size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {resource.title}
                                                            </p>
                                                            {resource.description && (
                                                                <p className="text-sm text-gray-600">
                                                                    {resource.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                                <span className="capitalize">
                                                                    {resource.type}
                                                                </span>
                                                                <span>Order: {resource.order}</span>
                                                                {resource.is_required && (
                                                                    <span className="text-green-600 font-medium">
                                                                        Required
                                                                    </span>
                                                                )}
                                                                {resource.is_downloadable && (
                                                                    <span className="text-blue-600 font-medium">
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
                                                                    resource: resource.id,
                                                                }
                                                            )}
                                                            className="p-2 text-gray-600 hover:text-blue-600 rounded-md hover:bg-blue-50"
                                                        >
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleDeleteResource(lesson.id, resource.id, resource.title);
                                                            }}
                                                            className="p-2 text-gray-600 hover:text-red-600 rounded-md hover:bg-red-50"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Macedonian Resources */}
                            {lesson.resources?.filter(r => r.language === 'mk').length > 0 && (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="p-4 border-b border-gray-200 bg-orange-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                                                <h3 className="text-lg font-semibold text-gray-900">Macedonian Resources</h3>
                                                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                    {lesson.resources?.filter(r => r.language === 'mk').length}
                                                </span>
                                            </div>
                                            <Link
                                                href={route("admin.lessons.resources.create", lesson.id) + "?lang=mk"}
                                                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                                            >
                                                + Add Macedonian
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {lesson.resources?.filter(r => r.language === 'mk').map((resource) => {
                                            const Icon = resourceTypeIcons[resource.type];
                                            const colorClass = resourceTypeColors[resource.type];

                                            return (
                                                <div
                                                    key={resource.id}
                                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center">
                                                        <GripVertical
                                                            className="text-gray-400 mr-3"
                                                            size={16}
                                                        />
                                                        <div
                                                            className={`p-2 rounded ${colorClass} mr-3`}
                                                        >
                                                            <Icon size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {resource.title}
                                                            </p>
                                                            {resource.description && (
                                                                <p className="text-sm text-gray-600">
                                                                    {resource.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                                <span className="capitalize">
                                                                    {resource.type}
                                                                </span>
                                                                <span>Order: {resource.order}</span>
                                                                {resource.is_required && (
                                                                    <span className="text-green-600 font-medium">
                                                                        Required
                                                                    </span>
                                                                )}
                                                                {resource.is_downloadable && (
                                                                    <span className="text-blue-600 font-medium">
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
                                                                    resource: resource.id,
                                                                }
                                                            )}
                                                            className="p-2 text-gray-600 hover:text-blue-600 rounded-md hover:bg-blue-50"
                                                        >
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleDeleteResource(lesson.id, resource.id, resource.title);
                                                            }}
                                                            className="p-2 text-gray-600 hover:text-red-600 rounded-md hover:bg-red-50"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Show helper text if resources exist but some languages are missing */}
                            {(lesson.resources?.filter(r => r.language === 'en').length === 0 || 
                              lesson.resources?.filter(r => r.language === 'mk').length === 0) && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                                        <div className="text-sm">
                                            <h4 className="text-yellow-800 font-medium mb-1">Complete Your Multilingual Content</h4>
                                            <p className="text-yellow-700">
                                                {lesson.resources?.filter(r => r.language === 'en').length === 0 && 
                                                 lesson.resources?.filter(r => r.language === 'mk').length === 0 
                                                    ? "Add resources in both English and Macedonian to provide a complete learning experience for all students."
                                                    : lesson.resources?.filter(r => r.language === 'en').length === 0
                                                    ? "Consider adding English resources so English-speaking students can access this content."
                                                    : "Consider adding Macedonian resources so Macedonian-speaking students can access this content."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}