import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { BookOpen } from "lucide-react";
import LessonHeader from "@/Components/Lessons/LessonHeader";
import StudentNavBar from "@/Components/StudentNavBar";
import StartLessonPrompt from "@/Components/Lessons/StartLessonPrompt";
import LessonContent from "@/Components/Lessons/LessonContent";
import LessonActions from "@/Components/Lessons/LessonActions";
import LessonNavigation from "@/Components/Lessons/LessonNavigation";
import LessonCompletionModal from "@/Components/Lessons/LessonCompletionModal";
import LessonHomeworkDrawer, { HomeworkTrigger } from "@/Components/Lessons/LessonHomeworkDrawer";
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
    homeworkAssignments = [],
}) {
    if (!lesson) {
        return (
            <AuthenticatedLayout>
                <Head title="Lesson Not Found" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-black text-aba-ink mb-4 font-display">
                            Lesson Not Found
                        </h1>
                        <p className="text-aba-ink-soft font-semibold mb-6">
                            The lesson you're looking for doesn't exist or
                            couldn't be loaded.
                        </p>
                        <button
                            onClick={() => router.visit(route("dashboard"))}
                            className="bg-aba-coral text-white px-6 py-2.5 rounded-aba-sm font-black shadow-aba-coral hover:bg-aba-coral-dark transition"
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
    const [showHomeworkDrawer, setShowHomeworkDrawer] = useState(false);

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

    // A lesson only shows its working area and progress footer once started.
    const isLessonStarted = progress?.status !== "not_started";

    const customHeader = (
        <StudentNavBar
            panelType="lesson"
            program={program}
            icon={BookOpen}
            showBackButton
        />
    );

    const headerActions = (
        <HomeworkTrigger
            count={homeworkAssignments.length}
            onClick={() => setShowHomeworkDrawer(true)}
        />
    );

    return (
        <AuthenticatedLayout customHeader={customHeader} headerActions={headerActions}>
            <Head title={`${lesson.translated_title || lesson.title} - ${program?.translated_name || program?.name || "Program"}`} />

            <div className="min-h-screen bg-aba-bg">
                <div className="mx-auto max-w-7xl space-y-4 px-4 pb-8 pt-8 sm:px-6 lg:px-8">
                    <LessonHeader
                        lesson={lesson}
                        program={program}
                        progress={currentProgress}
                        hasResources={hasResources}
                    />

                    {isLessonStarted ? (
                        <LessonContent
                            lesson={lesson}
                            selectedResource={selectedResource}
                            onResourceSelect={handleResourceSelect}
                            onResourceDownload={handleResourceDownload}
                        />
                    ) : (
                        <StartLessonPrompt
                            onStart={startLesson}
                            isLoading={isLoading}
                        />
                    )}

                    <LessonNavigation
                        previousLesson={previousLesson}
                        nextLesson={nextLesson}
                        currentProgress={currentProgress}
                    />
                </div>

                {isLessonStarted && (
                    <LessonActions
                        currentProgress={currentProgress}
                        isLoading={isLoading}
                        onUpdateProgress={updateProgress}
                        onCompleteLesson={handleCompleteLesson}
                    />
                )}
            </div>

            <LessonHomeworkDrawer
                assignments={homeworkAssignments}
                isOpen={showHomeworkDrawer}
                onClose={() => setShowHomeworkDrawer(false)}
            />

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
