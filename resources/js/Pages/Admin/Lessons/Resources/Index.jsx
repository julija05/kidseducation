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
            console.log('Attempting to delete resource:', resourceId, 'from lesson:', lessonId);
            console.log('Route URL:', route("admin.lessons.resources.destroy", [lessonId, resourceId]));
            
            router.delete(route("admin.lessons.resources.destroy", [lessonId, resourceId]), {
                preserveScroll: true,
                onStart: () => console.log('Delete request started'),
                onSuccess: () => console.log('Delete successful'),
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    alert('Failed to delete resource. Please try again.');
                },
                onFinish: () => console.log('Delete request finished'),
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

                {/* Resource Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Resources
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {lesson.resources?.length || 0}
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
                                    {lesson.resources?.filter(r => r.type === 'video').length || 0}
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
                                    {lesson.resources?.filter(r => r.type === 'document').length || 0}
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
                                    {lesson.resources?.filter(r => r.type === 'quiz').length || 0}
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

                {/* Resources List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Lesson Resources
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {lesson.resources?.length || 0} resource{lesson.resources?.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {hasNoResources ? (
                            <div className="p-8 text-center">
                                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Resources Yet
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    This lesson doesn't have any resources. Add some learning materials to get started.
                                </p>
                                <Link
                                    href={route("admin.lessons.resources.create", lesson.id)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Add First Resource
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2 p-4">
                                {lesson.resources.map((resource) => {
                                    const Icon = resourceTypeIcons[resource.type];
                                    const colorClass = resourceTypeColors[resource.type];

                                    return (
                                        <div
                                            key={resource.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                                        >
                                            <div className="flex items-center">
                                                <GripVertical
                                                    className="text-gray-400 mr-2"
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
                                                            resource: resource.id,
                                                        }
                                                    )}
                                                    className="p-1 text-gray-600 hover:text-blue-600"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeleteResource(lesson.id, resource.id, resource.title);
                                                    }}
                                                    className="p-1 text-gray-600 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}