import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { BookOpen } from "lucide-react";
import LessonHeader from "@/Components/Lessons/LessonHeader";
import StudentNavBar from "@/Components/StudentNavBar";
import StartLessonPrompt from "@/Components/Lessons/StartLessonPrompt";
import LessonContent from "@/Components/Lessons/LessonContent";
import LessonNavigation from "@/Components/Lessons/LessonNavigation";
import LessonCompletionModal from "@/Components/Lessons/LessonCompletionModal";
import ReviewPromptModal from "@/Components/ReviewPromptModal";
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
    const [showReviewPrompt, setShowReviewPrompt] = useState(false);

    const handleCompleteLesson = async (score = null) => {
        const result = await completeLesson(score);

        if (result) {
            // Check if we should show the review prompt
            if (result.shouldPromptReview === true) {
                setShowReviewPrompt(true);
            } else {
                // Show the normal completion modal
                setCompletionData({ nextLesson, program });
                setShowCompletionModal(true);
            }
        }
    };

    const handleReviewPromptClose = () => {
        setShowReviewPrompt(false);
        // After closing review prompt, show completion modal
        setCompletionData({ nextLesson, program });
        setShowCompletionModal(true);
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
        <StudentNavBar 
            panelType="lesson"
            program={program}
            icon={BookOpen}
        />
    );

    return (
        <AuthenticatedLayout 
            programConfig={lessonTheme}
            customHeader={customHeader}
        >
            <Head title={`${lesson.translated_title || lesson.title} - ${program?.translated_name || program?.name || "Program"}`} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-pink-200 to-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}} />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}} />
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            </div>

            {/* Review Prompt Modal */}
            <ReviewPromptModal
                program={{
                    id: program?.id,
                    name: program?.name || program?.translated_name,
                    slug: program?.slug
                }}
                isOpen={showReviewPrompt}
                onClose={handleReviewPromptClose}
            />

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
