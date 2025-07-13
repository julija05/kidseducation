import React, { useState } from "react";
import { Link, Head, useForm, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    ArrowLeft,
    Video,
    FileText,
    Link2,
    Download,
    Puzzle,
    HelpCircle,
    Upload,
    X,
    Info,
    Save,
    AlertCircle,
} from "lucide-react";

export default function EditLessonResource() {
    const { lesson, resource } = usePage().props;
    const [selectedType, setSelectedType] = useState(resource.type);
    const [showYouTubeHelper, setShowYouTubeHelper] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        title: resource.title || "",
        description: resource.description || "",
        type: resource.type || "video",
        resource_url: resource.resource_url || "",
        file: null,
        order: resource.order || 1,
        is_required: resource.is_required || true,
        is_downloadable: resource.is_downloadable || false,
        // Quiz specific fields
        quiz_type: resource.metadata?.quiz_type || "multiple_choice",
        passing_score: resource.metadata?.passing_score || 70,
        time_limit: resource.metadata?.time_limit || null,
        attempts_allowed: resource.metadata?.attempts_allowed || 3,
    });

    const resourceTypes = {
        video: "Video (YouTube, Vimeo, etc.)",
        document: "Document (PDF, Word, etc.)",
        link: "External Link",
        download: "Downloadable File",
        interactive: "Interactive Content",
        quiz: "Quiz/Assessment",
    };

    const resourceTypeIcons = {
        video: Video,
        document: FileText,
        link: Link2,
        download: Download,
        interactive: Puzzle,
        quiz: HelpCircle,
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("admin.lessons.resources.update", [lesson.id, resource.id]), {
            preserveScroll: true,
        });
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        setData({
            ...data,
            type: type,
            resource_url: type === resource.type ? resource.resource_url : "",
            file: null,
        });
    };

    const extractYouTubeId = (url) => {
        const match = url.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );
        return match ? match[1] : null;
    };

    const renderTypeSpecificFields = () => {
        switch (selectedType) {
            case "video":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Video URL (YouTube, Vimeo, etc.) *
                            </label>
                            <input
                                type="url"
                                value={data.resource_url}
                                onChange={(e) =>
                                    setData("resource_url", e.target.value)
                                }
                                placeholder="https://www.youtube.com/watch?v=..."
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.resource_url
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.resource_url && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.resource_url}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={() =>
                                    setShowYouTubeHelper(!showYouTubeHelper)
                                }
                                className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                                Need help with YouTube URLs?
                            </button>
                            {showYouTubeHelper && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                                    <p className="font-medium mb-1">
                                        YouTube URL formats that work:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>
                                            https://www.youtube.com/watch?v=VIDEO_ID
                                        </li>
                                        <li>https://youtu.be/VIDEO_ID</li>
                                        <li>
                                            https://www.youtube.com/embed/VIDEO_ID
                                        </li>
                                    </ul>
                                    <p className="mt-2 text-gray-600">
                                        Make sure videos are set to "Unlisted"
                                        or "Public" for embedding to work.
                                    </p>
                                </div>
                            )}
                            {data.resource_url &&
                                extractYouTubeId(data.resource_url) && (
                                    <div className="mt-2 p-3 bg-green-50 rounded-md">
                                        <p className="text-sm text-green-800">
                                            ✓ Valid YouTube video detected
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>
                );

            case "document":
            case "download":
                return (
                    <div className="space-y-4">
                        {/* Show current file if exists */}
                        {resource.file_path && !data.file && (
                            <div className="p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>Current file:</strong> {resource.file_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Upload a new file below to replace the current one
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {resource.file_path ? "Replace File" : "Upload File"} 
                                {!resource.file_path && " *"}
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                onChange={(e) =>
                                                    setData(
                                                        "file",
                                                        e.target.files[0]
                                                    )
                                                }
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX up
                                        to 100MB
                                    </p>
                                </div>
                            </div>
                            {data.file && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md flex items-center justify-between">
                                    <span className="text-sm text-gray-700">
                                        {data.file.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setData("file", null)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            {errors.file && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.file}
                                </p>
                            )}
                        </div>
                        {selectedType === "download" && (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_downloadable"
                                    checked={data.is_downloadable}
                                    onChange={(e) =>
                                        setData(
                                            "is_downloadable",
                                            e.target.checked
                                        )
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="is_downloadable"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Allow students to download this file
                                </label>
                            </div>
                        )}
                    </div>
                );

            case "link":
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            External Link URL *
                        </label>
                        <input
                            type="url"
                            value={data.resource_url}
                            onChange={(e) =>
                                setData("resource_url", e.target.value)
                            }
                            placeholder="https://example.com/resource"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.resource_url
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {errors.resource_url && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.resource_url}
                            </p>
                        )}
                    </div>
                );

            case "quiz":
                return (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <div className="flex">
                                <Info className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                                <div className="text-sm text-yellow-700">
                                    <p className="font-medium">Quiz Editing</p>
                                    <p>
                                        After updating this quiz resource,
                                        you can manage questions in a
                                        separate step.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quiz Type
                                </label>
                                <select
                                    value={data.quiz_type}
                                    onChange={(e) =>
                                        setData("quiz_type", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="multiple_choice">
                                        Multiple Choice
                                    </option>
                                    <option value="true_false">
                                        True/False
                                    </option>
                                    <option value="mixed">
                                        Mixed Questions
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Passing Score (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.passing_score}
                                    onChange={(e) =>
                                        setData(
                                            "passing_score",
                                            parseInt(e.target.value)
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Time Limit (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.time_limit || ""}
                                    onChange={(e) =>
                                        setData(
                                            "time_limit",
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : null
                                        )
                                    }
                                    placeholder="No limit"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Attempts Allowed
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.attempts_allowed}
                                    onChange={(e) =>
                                        setData(
                                            "attempts_allowed",
                                            parseInt(e.target.value)
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                );

            case "interactive":
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Interactive Content URL or Embed Code *
                        </label>
                        <textarea
                            value={data.resource_url}
                            onChange={(e) =>
                                setData("resource_url", e.target.value)
                            }
                            placeholder="Paste embed code or URL here..."
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.resource_url
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {errors.resource_url && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.resource_url}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Supports H5P, CodePen, JSFiddle, and other
                            interactive content platforms
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AdminLayout>
            <Head title={`Edit Resource - ${resource.title}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={route("admin.lessons.resources.index", lesson.id)}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to {lesson.title} Resources
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Resource
                    </h1>
                    <p className="mt-1 text-gray-600">
                        Edit resource "{resource.title}" in "{lesson.title}"
                    </p>
                </div>

                {/* Show validation errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">
                                    Please fix the following errors:
                                </h3>
                                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                    {Object.values(errors).map(
                                        (error, index) => (
                                            <li key={index}>{error}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Resource Type Selection */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Resource Type
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(resourceTypes).map(
                                ([type, label]) => {
                                    const Icon = resourceTypeIcons[type];
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                handleTypeChange(type)
                                            }
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                selectedType === type
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <Icon
                                                className={`h-8 w-8 mx-auto mb-2 ${
                                                    selectedType === type
                                                        ? "text-blue-600"
                                                        : "text-gray-400"
                                                }`}
                                            />
                                            <p
                                                className={`text-sm font-medium ${
                                                    selectedType === type
                                                        ? "text-blue-900"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {label.split(" ")[0]}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {label
                                                    .split("(")[1]
                                                    ?.replace(")", "")}
                                            </p>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Resource Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData("title", e.target.value)
                                    }
                                    placeholder="Enter a descriptive title"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.title
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    placeholder="Brief description of the resource"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Order/Position *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.order}
                                        onChange={(e) =>
                                            setData(
                                                "order",
                                                parseInt(e.target.value)
                                            )
                                        }
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.order
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    {errors.order && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.order}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Order in which this resource appears
                                    </p>
                                </div>

                                <div className="flex flex-col justify-end">
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id="is_required"
                                            checked={data.is_required}
                                            onChange={(e) =>
                                                setData(
                                                    "is_required",
                                                    e.target.checked
                                                )
                                            }
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor="is_required"
                                            className="ml-2 block text-sm text-gray-700"
                                        >
                                            Required for lesson completion
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Type-Specific Fields */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            {selectedType.charAt(0).toUpperCase() +
                                selectedType.slice(1)}{" "}
                            Details
                        </h2>
                        {renderTypeSpecificFields()}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3">
                        <Link
                            href={route(
                                "admin.lessons.resources.index",
                                lesson.id
                            )}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {processing ? (
                                "Updating..."
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Update Resource
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}