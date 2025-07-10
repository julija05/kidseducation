// resources/js/Pages/Dashboard/Lessons/Show.jsx - Clean Version
import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    Play,
    CheckCircle,
    Clock,
    BookOpen,
    Download,
    ExternalLink,
    Video,
    FileText,
    Trophy,
    Calculator,
    Eye,
    File,
} from "lucide-react";

export default function LessonShow({
    lesson,
    program,
    progress,
    nextLesson,
    previousLesson,
    enrollment,
}) {
    // Add error boundary and null checks
    if (!lesson) {
        return (
            <AuthenticatedLayout>
                <Head title="Lesson Not Found" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Lesson Not Found
                        </h1>
                        <p className="text-gray-600 mb-6">
                            The lesson you're looking for doesn't exist or
                            couldn't be loaded.
                        </p>
                        <button
                            onClick={() => router.visit(route("dashboard"))}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const [currentProgress, setCurrentProgress] = useState(
        progress?.progress_percentage || 0
    );
    const [isLoading, setIsLoading] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);

    // Debug logging to see what resources we have
    console.log("Lesson data:", lesson);
    console.log("Lesson resources:", lesson.resources);

    // Set the first resource as selected by default when lesson loads
    useEffect(() => {
        if (
            lesson.resources &&
            lesson.resources.length > 0 &&
            !selectedResource
        ) {
            setSelectedResource(lesson.resources[0]);
        }
    }, [lesson.resources]);

    // Helper function to get CSRF token
    const getCsrfToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute("content") : "";
    };

    // Icon mapping function - using object instead of switch
    const getResourceIcon = (type) => {
        const icons = {
            video: <Video size={16} className="text-blue-600" />,
            document: <FileText size={16} className="text-green-600" />,
            link: <ExternalLink size={16} className="text-purple-600" />,
            download: <Download size={16} className="text-indigo-600" />,
            interactive: <Calculator size={16} className="text-orange-600" />,
            quiz: <Trophy size={16} className="text-yellow-600" />,
        };
        return icons[type] || <File size={16} className="text-gray-600" />;
    };

    // Color mapping function - using object instead of switch
    const getResourceTypeColor = (type, isSelected = false) => {
        const colorSchemes = {
            video: {
                base: "border-blue-200 text-blue-700",
                selected: "bg-blue-100 border-blue-400",
                hover: "hover:bg-blue-50",
            },
            document: {
                base: "border-green-200 text-green-700",
                selected: "bg-green-100 border-green-400",
                hover: "hover:bg-green-50",
            },
            link: {
                base: "border-purple-200 text-purple-700",
                selected: "bg-purple-100 border-purple-400",
                hover: "hover:bg-purple-50",
            },
            download: {
                base: "border-indigo-200 text-indigo-700",
                selected: "bg-indigo-100 border-indigo-400",
                hover: "hover:bg-indigo-50",
            },
            interactive: {
                base: "border-orange-200 text-orange-700",
                selected: "bg-orange-100 border-orange-400",
                hover: "hover:bg-orange-50",
            },
            quiz: {
                base: "border-yellow-200 text-yellow-700",
                selected: "bg-yellow-100 border-yellow-400",
                hover: "hover:bg-yellow-50",
            },
        };

        const defaultScheme = {
            base: "border-gray-200 text-gray-700",
            selected: "bg-gray-100 border-gray-400",
            hover: "hover:bg-gray-50",
        };

        const scheme = colorSchemes[type] || defaultScheme;
        const selectedClass = isSelected ? scheme.selected : "";

        return `${scheme.base} ${selectedClass} ${scheme.hover} transition-all cursor-pointer`;
    };

    const handleResourceSelect = async (resource) => {
        setSelectedResource(resource);

        // Debug logging to see resource data
        console.log("Selected resource:", resource);
        console.log("Resource URLs:", {
            resource_url: resource.resource_url,
            download_url: resource.download_url,
            stream_url: resource.stream_url,
            file_path: resource.file_path,
            file_name: resource.file_name,
        });

        // Mark resource as viewed using fetch instead of Inertia
        try {
            const response = await fetch(
                route("lesson-resources.mark-viewed", resource.id),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": getCsrfToken(),
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }
            );

            const data = await response.json();

            if (!data.success) {
                console.warn(
                    "Failed to mark resource as viewed:",
                    data.message
                );
            }
        } catch (error) {
            console.error("Error marking resource as viewed:", error);
        }
    };

    const handleResourceDownload = (resource, e) => {
        e.stopPropagation(); // Prevent selecting the resource

        console.log("Downloading resource:", resource);

        if (resource.download_url) {
            console.log("Using download_url:", resource.download_url);
            window.open(resource.download_url, "_blank");
        } else if (resource.resource_url) {
            console.log("Using resource_url:", resource.resource_url);
            // For direct downloads, try to force download
            const link = document.createElement("a");
            link.href = resource.resource_url;
            link.download = resource.file_name || resource.title || "download";
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.warn("No download URL available for resource:", resource);
            alert("Download not available for this resource");
        }
    };

    const renderMainContent = () => {
        if (!selectedResource) {
            return (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center">
                        <BookOpen
                            size={64}
                            className="mx-auto mb-4 text-gray-400"
                        />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Select a Resource
                        </h3>
                        <p className="text-gray-500">
                            Choose a learning resource from the list to begin
                        </p>
                    </div>
                </div>
            );
        }

        // Handle different resource types
        if (selectedResource.type === "video") {
            if (selectedResource.resource_url) {
                // Check if it's a YouTube video
                const isYouTube =
                    selectedResource.resource_url.includes("youtube.com") ||
                    selectedResource.resource_url.includes("youtu.be");

                if (isYouTube) {
                    // Extract YouTube video ID and create embed URL
                    const videoId = selectedResource.resource_url.match(
                        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
                    )?.[1];
                    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`;

                    return (
                        <div className="relative">
                            <iframe
                                src={embedUrl}
                                title={selectedResource.title}
                                className="w-full aspect-video rounded-lg"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">
                                    {selectedResource.title}
                                </h3>
                                {selectedResource.description && (
                                    <p className="text-gray-600 mt-2">
                                        {selectedResource.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                } else {
                    // Other video sources
                    return (
                        <div className="relative">
                            <video
                                src={selectedResource.resource_url}
                                controls
                                className="w-full aspect-video rounded-lg bg-black"
                                poster=""
                            >
                                Your browser does not support the video tag.
                            </video>
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">
                                    {selectedResource.title}
                                </h3>
                                {selectedResource.description && (
                                    <p className="text-gray-600 mt-2">
                                        {selectedResource.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                }
            } else {
                return (
                    <div className="flex items-center justify-center h-[400px] bg-black rounded-lg">
                        <div className="text-white text-center">
                            <Play size={64} className="mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {selectedResource.title}
                            </h3>
                            <p className="text-gray-300">
                                Video will be available soon
                            </p>
                        </div>
                    </div>
                );
            }
        }

        if (selectedResource.type === "document") {
            if (selectedResource.resource_url) {
                // Check if it's a PDF that can be embedded
                const isPDF =
                    selectedResource.resource_url
                        .toLowerCase()
                        .includes(".pdf") ||
                    selectedResource.mime_type === "application/pdf";

                if (isPDF) {
                    return (
                        <div className="space-y-4">
                            <div className="h-[600px] border rounded-lg overflow-hidden">
                                <iframe
                                    src={`${selectedResource.resource_url}#toolbar=1`}
                                    title={selectedResource.title}
                                    className="w-full h-full"
                                    frameBorder="0"
                                />
                            </div>
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {selectedResource.title}
                                    </h3>
                                    {selectedResource.description && (
                                        <p className="text-gray-600 mt-1">
                                            {selectedResource.description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) =>
                                        handleResourceDownload(
                                            selectedResource,
                                            e
                                        )
                                    }
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download size={16} className="mr-2" />
                                    Download
                                </button>
                            </div>
                        </div>
                    );
                } else {
                    // For other document types, try Google Docs viewer
                    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
                        selectedResource.resource_url
                    )}&embedded=true`;

                    return (
                        <div className="space-y-4">
                            <div className="h-[600px] border rounded-lg overflow-hidden">
                                <iframe
                                    src={viewerUrl}
                                    title={selectedResource.title}
                                    className="w-full h-full"
                                    frameBorder="0"
                                />
                            </div>
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {selectedResource.title}
                                    </h3>
                                    {selectedResource.description && (
                                        <p className="text-gray-600 mt-1">
                                            {selectedResource.description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) =>
                                        handleResourceDownload(
                                            selectedResource,
                                            e
                                        )
                                    }
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download size={16} className="mr-2" />
                                    Download
                                </button>
                            </div>
                        </div>
                    );
                }
            } else if (selectedResource.download_url) {
                // Has download URL but no preview URL
                return (
                    <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <FileText
                                size={64}
                                className="mx-auto mb-4 text-gray-400"
                            />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                {selectedResource.title}
                            </h3>
                            {selectedResource.description && (
                                <p className="text-gray-500 mb-4">
                                    {selectedResource.description}
                                </p>
                            )}
                            {selectedResource.file_name && (
                                <p className="text-sm text-gray-500 mb-4">
                                    File: {selectedResource.file_name}
                                </p>
                            )}
                            <button
                                onClick={(e) =>
                                    handleResourceDownload(selectedResource, e)
                                }
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download size={16} className="mr-2" />
                                Download Document
                            </button>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <FileText
                                size={64}
                                className="mx-auto mb-4 text-gray-400"
                            />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                {selectedResource.title}
                            </h3>
                            {selectedResource.description && (
                                <p className="text-gray-500 mb-4">
                                    {selectedResource.description}
                                </p>
                            )}
                            <p className="text-gray-500">
                                Document will be available soon
                            </p>
                        </div>
                    </div>
                );
            }
        }

        if (selectedResource.type === "download") {
            return (
                <div className="flex items-center justify-center h-[400px] bg-indigo-50 rounded-lg border-2 border-dashed border-indigo-300">
                    <div className="text-center">
                        <Download
                            size={64}
                            className="mx-auto mb-4 text-indigo-500"
                        />
                        <h3 className="text-xl font-semibold text-indigo-800 mb-2">
                            {selectedResource.title}
                        </h3>
                        {selectedResource.description && (
                            <p className="text-indigo-600 mb-4">
                                {selectedResource.description}
                            </p>
                        )}
                        {selectedResource.file_name && (
                            <p className="text-sm text-indigo-600 mb-4">
                                File: {selectedResource.file_name}
                            </p>
                        )}
                        <button
                            onClick={(e) =>
                                handleResourceDownload(selectedResource, e)
                            }
                            className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Download size={16} className="mr-2" />
                            Download File
                        </button>
                    </div>
                </div>
            );
        }

        if (selectedResource.type === "interactive") {
            if (selectedResource.resource_url) {
                return (
                    <div className="h-[600px] border rounded-lg overflow-hidden">
                        <iframe
                            src={selectedResource.resource_url}
                            title={selectedResource.title}
                            className="w-full h-full"
                            frameBorder="0"
                        />
                    </div>
                );
            } else {
                return (
                    <div className="flex items-center justify-center h-[400px] bg-orange-50 rounded-lg border-2 border-dashed border-orange-300">
                        <div className="text-center">
                            <Calculator
                                size={64}
                                className="mx-auto mb-4 text-orange-500"
                            />
                            <h3 className="text-xl font-semibold text-orange-800 mb-2">
                                {selectedResource.title}
                            </h3>
                            {selectedResource.description && (
                                <p className="text-orange-600 mb-4">
                                    {selectedResource.description}
                                </p>
                            )}
                            <p className="text-orange-600">
                                Interactive content coming soon
                            </p>
                        </div>
                    </div>
                );
            }
        }

        if (selectedResource.type === "quiz") {
            return (
                <div className="flex items-center justify-center h-[400px] bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300">
                    <div className="text-center">
                        <Trophy
                            size={64}
                            className="mx-auto mb-4 text-yellow-500"
                        />
                        <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                            {selectedResource.title}
                        </h3>
                        {selectedResource.description && (
                            <p className="text-yellow-600 mb-4">
                                {selectedResource.description}
                            </p>
                        )}
                        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors">
                            Start Quiz
                        </button>
                    </div>
                </div>
            );
        }

        if (selectedResource.type === "link") {
            return (
                <div className="flex items-center justify-center h-[400px] bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
                    <div className="text-center">
                        <ExternalLink
                            size={64}
                            className="mx-auto mb-4 text-purple-500"
                        />
                        <h3 className="text-xl font-semibold text-purple-800 mb-2">
                            {selectedResource.title}
                        </h3>
                        {selectedResource.description && (
                            <p className="text-purple-600 mb-4">
                                {selectedResource.description}
                            </p>
                        )}
                        <button
                            onClick={(e) =>
                                handleResourceDownload(selectedResource, e)
                            }
                            className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <ExternalLink size={16} className="mr-2" />
                            Open Link
                        </button>
                    </div>
                </div>
            );
        }

        // Default case
        return (
            <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <File size={64} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        {selectedResource.title}
                    </h3>
                    {selectedResource.description && (
                        <p className="text-gray-500 mb-4">
                            {selectedResource.description}
                        </p>
                    )}
                    <p className="text-gray-500">
                        Resource preview not available
                    </p>
                </div>
            </div>
        );
    };

    const handleStartLesson = async () => {
        if (progress?.status === "not_started") {
            setIsLoading(true);

            try {
                const response = await fetch(
                    route("lessons.start", lesson.id),
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": getCsrfToken(),
                            Accept: "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (data.success) {
                    setCurrentProgress(1);
                    router.reload({ only: ["progress"] });
                } else {
                    console.error("Error starting lesson:", data);
                    alert("Error starting lesson. Please try again.");
                }
            } catch (error) {
                console.error("Error starting lesson:", error);
                alert("Error starting lesson. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCompleteLesson = async (score = null) => {
        setIsLoading(true);

        try {
            const response = await fetch(route("lessons.complete", lesson.id), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    score: score,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setCurrentProgress(100);

                if (nextLesson) {
                    const confirmNext = confirm(
                        `Lesson completed! Would you like to proceed to the next lesson: "${nextLesson.title}"?`
                    );
                    if (confirmNext) {
                        router.visit(route("lessons.show", nextLesson.id));
                    }
                } else {
                    alert(
                        "Congratulations! You have completed all available lessons in this program."
                    );
                    router.visit(
                        route("dashboard.programs.show", program.slug)
                    );
                }
            } else {
                console.error("Error completing lesson:", data);
                alert("Error completing lesson. Please try again.");
            }
        } catch (error) {
            console.error("Error completing lesson:", error);
            alert("Error completing lesson. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const hasResources = lesson.resources && lesson.resources.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title={`${lesson.title} - ${program?.name || "Program"}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() =>
                                router.visit(
                                    route(
                                        "dashboard.programs.show",
                                        program?.slug || "dashboard"
                                    )
                                )
                            }
                            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back to Program
                        </button>

                        <div className="text-sm text-gray-500">
                            Level {lesson.level} • Lesson{" "}
                            {lesson.order_in_level}
                        </div>
                    </div>

                    <div className="flex items-center mb-2">
                        <BookOpen size={20} className="mr-2" />
                        <h1 className="text-2xl font-bold">{lesson.title}</h1>
                    </div>

                    {lesson.description && (
                        <p className="text-gray-600 mb-4">
                            {lesson.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                            <Clock size={16} className="mr-2" />
                            <span>
                                {lesson.formatted_duration ||
                                    `${lesson.duration_minutes || 30} min`}
                            </span>
                            {hasResources && (
                                <>
                                    <span className="mx-2">•</span>
                                    <Eye size={16} className="mr-1" />
                                    <span>
                                        {lesson.resources.length} resource
                                        {lesson.resources.length !== 1
                                            ? "s"
                                            : ""}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${currentProgress}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-medium">
                                {Math.round(currentProgress)}%
                            </span>
                        </div>
                    </div>
                </div>

                {progress?.status === "not_started" ? (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <h3 className="text-xl font-semibold mb-4">
                            Ready to start this lesson?
                        </h3>
                        <button
                            onClick={handleStartLesson}
                            disabled={isLoading}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "Starting..." : "Start Lesson"}
                            <Play size={16} className="ml-2" />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Main Content Area */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                                {renderMainContent()}
                            </div>

                            {/* Lesson Actions */}
                            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Progress: {Math.round(currentProgress)}%
                                        complete
                                    </p>
                                </div>
                                <div className="space-x-4">
                                    {currentProgress < 100 && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    setCurrentProgress(75)
                                                }
                                                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                            >
                                                Mark 75% Complete
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleCompleteLesson()
                                                }
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                disabled={isLoading}
                                            >
                                                {isLoading
                                                    ? "Completing..."
                                                    : "Complete Lesson"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Resources Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <BookOpen className="mr-2" size={18} />
                                    Resources
                                </h3>

                                {hasResources ? (
                                    <div className="space-y-2">
                                        {lesson.resources.map(
                                            (resource, index) => (
                                                <div
                                                    key={resource.id}
                                                    className={`border rounded-lg p-3 ${getResourceTypeColor(
                                                        resource.type,
                                                        selectedResource?.id ===
                                                            resource.id
                                                    )}`}
                                                    onClick={() =>
                                                        handleResourceSelect(
                                                            resource
                                                        )
                                                    }
                                                >
                                                    <div className="flex items-start">
                                                        <div className="mr-2 mt-1">
                                                            {getResourceIcon(
                                                                resource.type
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-sm truncate">
                                                                {resource.title}
                                                            </h4>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className="text-xs font-medium capitalize">
                                                                    {
                                                                        resource.type
                                                                    }
                                                                </span>
                                                                {resource.is_required && (
                                                                    <span className="text-xs bg-red-100 text-red-600 px-1 rounded">
                                                                        Required
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {(resource.type ===
                                                                "download" ||
                                                                resource.type ===
                                                                    "document") && (
                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        handleResourceDownload(
                                                                            resource,
                                                                            e
                                                                        )
                                                                    }
                                                                    className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center"
                                                                >
                                                                    <Download
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="mr-1"
                                                                    />
                                                                    Download
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText
                                            size={32}
                                            className="mx-auto mb-2 text-gray-400"
                                        />
                                        <p className="text-sm text-gray-500">
                                            No resources available yet
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-6 flex items-center justify-between">
                    <div>
                        {previousLesson && (
                            <button
                                onClick={() =>
                                    router.visit(
                                        route("lessons.show", previousLesson.id)
                                    )
                                }
                                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Previous Lesson
                            </button>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {currentProgress >= 100 && (
                            <div className="flex items-center text-green-600">
                                <CheckCircle size={20} className="mr-2" />
                                <span className="font-medium">Completed</span>
                            </div>
                        )}

                        {nextLesson && currentProgress >= 100 && (
                            <button
                                onClick={() =>
                                    router.visit(
                                        route("lessons.show", nextLesson.id)
                                    )
                                }
                                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Next Lesson
                                <ArrowRight size={16} className="ml-2" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
