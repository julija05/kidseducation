// resources/js/Pages/Dashboard/Lessons/Show.jsx - Simplified Version
import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    Play,
    CheckCircle,
    Clock,
    BookOpen,
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

    // Helper function to get CSRF token
    const getCsrfToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute("content") : "";
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
                    // Refresh the page to get updated progress
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

                // Show success message and redirect option
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

    const renderLessonContent = () => {
        switch (lesson.content_type) {
            case "video":
                return (
                    <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                        <div className="text-white text-center">
                            <Play size={48} className="mx-auto mb-4" />
                            <p className="mb-4">Video Lesson</p>
                            <p className="text-sm text-gray-300">
                                {lesson.content_url
                                    ? "Video content available"
                                    : "Video coming soon"}
                            </p>
                        </div>
                    </div>
                );

            case "text":
                return (
                    <div className="prose prose-lg max-w-none bg-gray-50 p-6 rounded-lg">
                        <h3>Reading Material</h3>
                        {lesson.content_body ? (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: lesson.content_body,
                                }}
                            />
                        ) : (
                            <p>
                                Reading content for this lesson will be
                                available soon.
                            </p>
                        )}
                    </div>
                );

            case "interactive":
                return (
                    <div className="text-center py-12 bg-blue-50 rounded-lg">
                        <BookOpen
                            size={48}
                            className="mx-auto mb-4 text-blue-500"
                        />
                        <h3 className="text-xl font-semibold mb-4">
                            Interactive Content
                        </h3>
                        <p className="text-gray-600 mb-6">
                            This lesson contains interactive exercises and
                            activities.
                        </p>
                        <button
                            onClick={() => setCurrentProgress(50)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4"
                        >
                            Practice Activity
                        </button>
                    </div>
                );

            case "quiz":
                return (
                    <div className="text-center py-12 bg-yellow-50 rounded-lg">
                        <CheckCircle
                            size={48}
                            className="mx-auto mb-4 text-yellow-500"
                        />
                        <h3 className="text-xl font-semibold mb-4">
                            Quiz Assessment
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Test your knowledge with this lesson quiz.
                        </p>
                        <button
                            onClick={() => handleCompleteLesson(85)}
                            className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            disabled={isLoading}
                        >
                            {isLoading ? "Submitting..." : "Take Quiz"}
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-12">
                        <BookOpen
                            size={48}
                            className="mx-auto mb-4 text-gray-400"
                        />
                        <p className="text-gray-600">
                            Lesson content will be displayed here
                        </p>
                    </div>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${lesson.title} - ${program?.name || "Program"}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                    `${lesson.duration_minutes} min`}
                            </span>
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

                {/* Lesson Content */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    {progress?.status === "not_started" ? (
                        <div className="text-center py-12">
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
                        <>
                            {renderLessonContent()}

                            {/* Lesson Actions */}
                            <div className="mt-6 pt-6 border-t flex items-center justify-between">
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
                        </>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
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
