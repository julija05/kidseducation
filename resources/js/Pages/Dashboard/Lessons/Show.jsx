import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import LessonHeader from "@/Components/Lessons/LessonHeader";
import StartLessonPrompt from "@/Components/Lessons/StartLessonPrompt";
import LessonContent from "@/Components/Lessons/LessonContent";
import LessonNavigation from "@/Components/Lessons/LessonNavigation";
import useLessonProgress from "@/hooks/useLessonProgress";
import useResourceSelection from "@/hooks/useResourceSelection";

export default function LessonShow({
    lesson,
    program,
    progress,
    nextLesson,
    previousLesson,
    enrollment,
}) {
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

    const {
        currentProgress,
        isLoading,
        startLesson,
        updateProgress,
        completeLesson,
    } = useLessonProgress(lesson, progress);

    const { selectedResource, handleResourceSelect, handleResourceDownload } =
        useResourceSelection(lesson.resources);

    const handleCompleteLesson = async (score = null) => {
        const result = await completeLesson(score);

        if (result) {
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
                router.visit(route("dashboard.programs.show", program.slug));
            }
        }
    };

    const hasResources = lesson.resources && lesson.resources.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title={`${lesson.title} - ${program?.name || "Program"}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <LessonHeader
                    lesson={lesson}
                    program={program}
                    progress={currentProgress}
                    hasResources={hasResources}
                />

                {progress?.status === "not_started" ? (
                    <StartLessonPrompt
                        onStart={startLesson}
                        isLoading={isLoading}
                    />
                ) : (
                    <LessonContent
                        lesson={lesson}
                        selectedResource={selectedResource}
                        currentProgress={currentProgress}
                        isLoading={isLoading}
                        onResourceSelect={handleResourceSelect}
                        onResourceDownload={handleResourceDownload}
                        onUpdateProgress={updateProgress}
                        onCompleteLesson={handleCompleteLesson}
                    />
                )}

                <LessonNavigation
                    previousLesson={previousLesson}
                    nextLesson={nextLesson}
                    currentProgress={currentProgress}
                />
            </div>
        </AuthenticatedLayout>
    );
}
