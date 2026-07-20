import React from "react";
import ResourceViewer from "./Resources/Viewers/ResourceViewer";
import ResourcesSidebar from "./Resources/ResourcesSidebar";
import QuizList from "./QuizList";
import { Card } from "@/Components/StudentDashboard";

/**
 * LessonContent - Main lesson working area: resource viewer, quizzes and the
 * resources sidebar.
 *
 * Progress actions live in the sticky LessonActions footer, which the page
 * renders outside this grid so it can span the full viewport width.
 *
 * @param {object} lesson - Lesson being viewed
 * @param {object} selectedResource - Resource currently being viewed
 * @param {function} onResourceSelect - Called with the resource to view
 * @param {function} onResourceDownload - Called with (resource, event) to download
 */
export default function LessonContent({
    lesson,
    selectedResource,
    onResourceSelect,
    onResourceDownload,
}) {
    const hasResources = (lesson.resources?.length || 0) > 0;

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="space-y-4 lg:col-span-3">
                <Card as="section" className="flex min-h-[420px] flex-col p-5">
                    <ResourceViewer
                        selectedResource={selectedResource}
                        onDownload={onResourceDownload}
                        hasResources={hasResources}
                    />
                </Card>

                <QuizList quizzes={lesson.quizzes} />
            </div>

            <div className="lg:col-span-1">
                <div className="sticky top-6">
                    <ResourcesSidebar
                        resources={lesson.resources}
                        selectedResource={selectedResource}
                        onResourceSelect={onResourceSelect}
                        onResourceDownload={onResourceDownload}
                    />
                </div>
            </div>
        </div>
    );
}
