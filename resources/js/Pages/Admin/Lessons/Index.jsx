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
    Eye,
    ExternalLink,
    AlertCircle,
} from "lucide-react";

export default function LessonResourcesIndex() {
    const { lesson, resources } = usePage().props;
    const [processing, setProcessing] = useState(false);

    const resourceTypeIcons = {
        video: Video,
        document: FileText,
        link: Link2,
        download: Download,
        interactive: Puzzle,
        quiz: HelpCircle,
    };

    const resourceTypeColors = {
        video: "text-red-600 bg-red-50 border-red-200",
        document: "text-blue-600 bg-blue-50 border-blue-200",
        link: "text-green-600 bg-green-50 border-green-200",
        download: "text-purple-600 bg-purple-50 border-purple-200",
        interactive: "text-yellow-600 bg-yellow-50 border-yellow-200",
        quiz: "text-indigo-600 bg-indigo-50 border-indigo-200",
    };

    const handleDelete = (resourceId) => {
        if (confirm("Are you sure you want to delete this resource?")) {
            setProcessing(true);
            router.delete(
                route("admin.lessons.resources.destroy", {
                    lesson: lesson.id,
                    resource: resourceId,
                }),
                {
                    onFinish: () => setProcessing(false),
                }
            );
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getResourceUrl = (resource) => {
        if (resource.resource_url) {
            return resource.resource_url;
        }
        if (resource.file_path) {
            return route("lesson-resources.stream", resource.id);
        }
        return null;
    };

    return (
        <AdminLayout>
            <Head title={`Resources - ${lesson.title}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={route(
                            "admin.resources.program.show",
                            lesson.program_id
                        )}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Program Resources
                    </Link>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {lesson.title} Resources
                            </h1>
                            <p className="mt-1 text-gray-600">
                                Manage learning resources for this lesson
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <span>Level {lesson.level || 1}</span>
                                <span className="mx-2">•</span>
                                <span>{resources.length} resources</span>
                            </div>
                        </div>
                        <Link
                            href={route(
                                "admin.lessons.resources.create",
                                lesson.id
                            )}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <Plus size={16} className="mr-2" />
                            Add Resource
                        </Link>
                    </div>
                </div>

                {/* Resources List */}
                {resources.length > 0 ? (
                    <div className="bg-white rounded-lg shadow">
                        <div className="divide-y divide-gray-200">
                            {resources.map((resource, index) => {
                                const Icon = resourceTypeIcons[resource.type];
                                const colorClass =
                                    resourceTypeColors[resource.type];
                                const resourceUrl = getResourceUrl(resource);

                                return (
                                    <div
                                        key={resource.id}
                                        className="p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start flex-1">
                                                {/* Drag Handle */}
                                                <div className="mr-4 mt-1">
                                                    <GripVertical className="h-5 w-5 text-gray-400" />
                                                </div>

                                                {/* Resource Icon */}
                                                <div
                                                    className={`p-3 rounded-lg border ${colorClass} mr-4 flex-shrink-0`}
                                                >
                                                    <Icon size={20} />
                                                </div>

                                                {/* Resource Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-medium text-gray-900 truncate">
                                                            {resource.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 ml-4">
                                                            <span className="text-sm text-gray-500">
                                                                Order:{" "}
                                                                {resource.order}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {resource.description && (
                                                        <p className="mt-1 text-gray-600 text-sm">
                                                            {
                                                                resource.description
                                                            }
                                                        </p>
                                                    )}

                                                    {/* Resource Metadata */}
                                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                                                        <span
                                                            className={`px-2 py-1 rounded-full capitalize ${colorClass}`}
                                                        >
                                                            {resource.type}
                                                        </span>

                                                        {resource.is_required && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                                Required
                                                            </span>
                                                        )}

                                                        {resource.is_downloadable && (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                                Downloadable
                                                            </span>
                                                        )}

                                                        {resource.file_name && (
                                                            <span className="text-gray-500">
                                                                {
                                                                    resource.file_name
                                                                }{" "}
                                                                (
                                                                {formatFileSize(
                                                                    resource.file_size ||
                                                                        0
                                                                )}
                                                                )
                                                            </span>
                                                        )}

                                                        {resource.mime_type && (
                                                            <span className="text-gray-500 uppercase">
                                                                {
                                                                    resource.mime_type.split(
                                                                        "/"
                                                                    )[1]
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Resource URL/Link */}
                                                    {resourceUrl && (
                                                        <div className="mt-2">
                                                            <a
                                                                href={
                                                                    resourceUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                                            >
                                                                {resource.type ===
                                                                "link" ? (
                                                                    <>
                                                                        <ExternalLink
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="mr-1"
                                                                        />
                                                                        Visit
                                                                        Link
                                                                    </>
                                                                ) : resource.file_path ? (
                                                                    <>
                                                                        <Eye
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="mr-1"
                                                                        />
                                                                        View
                                                                        File
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Eye
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="mr-1"
                                                                        />
                                                                        View
                                                                        Resource
                                                                    </>
                                                                )}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 ml-4">
                                                <Link
                                                    href={route(
                                                        "admin.lessons.resources.edit",
                                                        {
                                                            lesson: lesson.id,
                                                            resource:
                                                                resource.id,
                                                        }
                                                    )}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit resource"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            resource.id
                                                        )
                                                    }
                                                    disabled={processing}
                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete resource"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Quiz-specific info */}
                                        {resource.type === "quiz" &&
                                            resource.metadata && (
                                                <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                                                    <h4 className="text-sm font-medium text-indigo-900 mb-2">
                                                        Quiz Settings
                                                    </h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-indigo-800">
                                                        {resource.metadata
                                                            .quiz_type && (
                                                            <div>
                                                                <span className="font-medium">
                                                                    Type:
                                                                </span>
                                                                <br />
                                                                {resource.metadata.quiz_type.replace(
                                                                    "_",
                                                                    " "
                                                                )}
                                                            </div>
                                                        )}
                                                        {resource.metadata
                                                            .passing_score && (
                                                            <div>
                                                                <span className="font-medium">
                                                                    Passing
                                                                    Score:
                                                                </span>
                                                                <br />
                                                                {
                                                                    resource
                                                                        .metadata
                                                                        .passing_score
                                                                }
                                                                %
                                                            </div>
                                                        )}
                                                        {resource.metadata
                                                            .time_limit && (
                                                            <div>
                                                                <span className="font-medium">
                                                                    Time Limit:
                                                                </span>
                                                                <br />
                                                                {
                                                                    resource
                                                                        .metadata
                                                                        .time_limit
                                                                }{" "}
                                                                min
                                                            </div>
                                                        )}
                                                        {resource.metadata
                                                            .attempts_allowed && (
                                                            <div>
                                                                <span className="font-medium">
                                                                    Attempts:
                                                                </span>
                                                                <br />
                                                                {
                                                                    resource
                                                                        .metadata
                                                                        .attempts_allowed
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <FileText className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Resources Yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                            This lesson doesn't have any learning resources yet.
                            Add your first resource to get started.
                        </p>
                        <Link
                            href={route(
                                "admin.lessons.resources.create",
                                lesson.id
                            )}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} className="mr-2" />
                            Add First Resource
                        </Link>
                    </div>
                )}

                {/* Help Text */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                        <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">
                                Resource Management Tips
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>
                                    Use the drag handles to reorder resources
                                </li>
                                <li>
                                    Mark important resources as "Required" for
                                    lesson completion
                                </li>
                                <li>
                                    Enable downloads for documents students
                                    should keep
                                </li>
                                <li>
                                    Keep video titles descriptive and concise
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
