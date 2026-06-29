import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { BookOpen, Calendar, CheckCircle2, ClipboardCheck, Clock, HelpCircle } from "lucide-react";
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
    homeworkAssignments = [],
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

                <LessonHomeworkPanel assignments={homeworkAssignments} />

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

function LessonHomeworkPanel({ assignments }) {
    const updateHomeworkStatus = (assignment, status) => {
        router.patch(route("dashboard.homework.status", assignment.id), { status }, {
            preserveScroll: true,
        });
    };
    const markPracticeTaskDone = (task) => {
        router.patch(route("dashboard.homework.practice-tasks.done", task.id), {}, {
            preserveScroll: true,
        });
    };

    if (!assignments.length) {
        return null;
    }

    return (
        <section className="mb-8 rounded-2xl border border-emerald-200 bg-white/95 p-5 shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase text-emerald-700 ring-1 ring-emerald-200">
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            Lesson homework
                        </span>
                        {assignments.length > 1 && (
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {assignments.length} assigned
                            </span>
                        )}
                    </div>

                    <div className="mt-4 space-y-4">
                        {assignments.map((assignment) => (
                            <article key={assignment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950">{assignment.title}</h2>
                                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                                            {shortInstruction(assignment.instructions)}
                                        </p>
                                    </div>
                                    <span className="inline-flex w-fit rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                                        {assignment.student_status_label || assignment.status}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <HomeworkMeta icon={Clock} label="Practice time" value={assignment.estimated_practice_time} />
                                    <HomeworkMeta icon={Calendar} label="Due date" value={assignment.due_date} />
                                    <HomeworkMeta icon={BookOpen} label="Group" value={assignment.group?.name} />
                                </div>

                                <PracticeTaskList tasks={assignment.practice_tasks || []} onDone={markPracticeTaskDone} />

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => updateHomeworkStatus(assignment, "completed")}
                                        disabled={assignment.student_status === "completed"}
                                        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Completed
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateHomeworkStatus(assignment, "needs_help")}
                                        disabled={assignment.student_status === "needs_help"}
                                        className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <HelpCircle className="h-4 w-4" />
                                        I need help
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function PracticeTaskList({ tasks, onDone }) {
    if (!tasks.length) {
        return null;
    }

    return (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Practice tasks</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                        <span className={`text-sm font-medium ${task.is_done ? "text-slate-500 line-through" : "text-slate-900"}`}>
                            {task.prompt}
                        </span>
                        <button
                            type="button"
                            onClick={() => onDone(task)}
                            disabled={task.is_done}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Done
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HomeworkMeta({ icon: Icon, label, value }) {
    return (
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">{value || "Not set"}</p>
        </div>
    );
}

function shortInstruction(value) {
    if (!value) {
        return "No instructions added yet.";
    }

    const text = String(value).trim();
    return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}
