import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { BookOpen } from "lucide-react";
import LessonHeader from "@/Components/Lessons/LessonHeader";
import StartLessonPrompt from "@/Components/Lessons/StartLessonPrompt";
import LessonContent from "@/Components/Lessons/LessonContent";
import LessonNavigation from "@/Components/Lessons/LessonNavigation";
import LessonCompletionModal from "@/Components/Lessons/LessonCompletionModal";
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

    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionData, setCompletionData] = useState(null);

    const handleCompleteLesson = async (score = null) => {
        const result = await completeLesson(score);

        if (result) {
            // Show the completion modal instead of alert/confirm
            setCompletionData({ nextLesson, program });
            setShowCompletionModal(true);
        }
    };

    const handleProceedToNext = () => {
        setShowCompletionModal(false);
        if (completionData?.nextLesson) {
            router.visit(route("lessons.show", completionData.nextLesson.id));
        }
    };

    const handleStayHere = () => {
        setShowCompletionModal(false);
        // Stay on current lesson page
    };

    const handleCloseModal = () => {
        setShowCompletionModal(false);
        if (!completionData?.nextLesson) {
            // If no next lesson (all completed), go back to dashboard
            router.visit(route("dashboard"));
        }
    };

    const hasResources = lesson.resources && lesson.resources.length > 0;

    // Create a vibrant lesson theme
    const lessonTheme = program?.theme || {
        name: "Learning Session",
        color: "bg-gradient-to-r from-purple-600 to-blue-600",
        lightColor: "bg-gradient-to-br from-purple-50 to-blue-50",
        borderColor: "border-purple-300",
        textColor: "text-purple-700",
        icon: "BookOpen"
    };

    const customHeader = (
        <>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <BookOpen className="text-white" size={24} />
            </div>
            <button
                onClick={() => router.visit(route("dashboard"))}
                className="flex flex-col text-left hover:opacity-80 transition-opacity"
            >
                <span className="text-2xl font-bold">Learning Session</span>
                <span className="text-xs opacity-75 -mt-1">{program?.translated_name || program?.name || "lesson mode"}</span>
            </button>
        </>
    );

    return (
        <AuthenticatedLayout 
            programConfig={lessonTheme}
            customHeader={customHeader}
        >
            <Head title={`${lesson.translated_title || lesson.title} - ${program?.translated_name || program?.name || "Program"}`} />

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

            {/* Lesson Completion Modal */}
            <LessonCompletionModal
                show={showCompletionModal}
                nextLesson={completionData?.nextLesson}
                onProceed={handleProceedToNext}
                onStay={handleStayHere}
                onClose={handleCloseModal}
            />
        </AuthenticatedLayout>
    );
}
