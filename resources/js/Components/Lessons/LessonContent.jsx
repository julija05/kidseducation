import React from "react";
import ResourceViewer from "./Resources/Viewers/ResourceViewer";
import ResourcesSidebar from "./Resources/ResourcesSidebar";
import LessonActions from "./LessonActions";

export default function LessonContent({
    lesson,
    selectedResource,
    currentProgress,
    isLoading,
    onResourceSelect,
    onResourceDownload,
    onUpdateProgress,
    onCompleteLesson,
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <ResourceViewer
                        selectedResource={selectedResource}
                        onDownload={onResourceDownload}
                    />
                </div>

                <LessonActions
                    currentProgress={currentProgress}
                    isLoading={isLoading}
                    onUpdateProgress={onUpdateProgress}
                    onCompleteLesson={onCompleteLesson}
                />
            </div>

            {/* Resources Sidebar */}
            <div className="lg:col-span-1">
                <ResourcesSidebar
                    resources={lesson.resources}
                    selectedResource={selectedResource}
                    onResourceSelect={onResourceSelect}
                    onResourceDownload={onResourceDownload}
                />
            </div>
        </div>
    );
}
