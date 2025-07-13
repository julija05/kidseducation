import React from "react";

export default function LessonActions({
    currentProgress,
    isLoading,
    onUpdateProgress,
    onCompleteLesson,
}) {
    return (
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">
                    Progress: {Math.round(currentProgress)}% complete
                </p>
            </div>
            <div className="space-x-4">
                {currentProgress < 100 && (
                    <>
                        <button
                            onClick={() => onUpdateProgress(75)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                            Mark 75% Complete
                        </button>
                        <button
                            onClick={() => onCompleteLesson()}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            disabled={isLoading}
                        >
                            {isLoading ? "Completing..." : "Complete Lesson"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
