import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function LessonActions({
    currentProgress,
    isLoading,
    onUpdateProgress,
    onCompleteLesson,
}) {
    const { t } = useTranslation();
    
    return (
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">
                    {t('lessons.progress_complete', { progress: Math.round(currentProgress) })}
                </p>
            </div>
            <div className="space-x-4">
                {currentProgress < 100 && (
                    <>
                        <button
                            onClick={() => onUpdateProgress(75)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                            {t('lessons.mark_75_complete')}
                        </button>
                        <button
                            onClick={() => onCompleteLesson()}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            disabled={isLoading}
                        >
                            {isLoading ? t('lessons.completing') : t('lessons.complete_lesson')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
