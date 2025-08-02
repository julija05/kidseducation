import React from "react";
import { CheckCircle, ArrowRight, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function LessonCompletionModal({
    show,
    nextLesson,
    onProceed,
    onStay,
    onClose,
}) {
    const { t } = useTranslation();

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-xl p-6 text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {t('lessons.lesson_completed_title')}
                    </h2>
                    <p className="text-green-100">
                        {t('lessons.lesson_completed_message')}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {nextLesson ? (
                        <>
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-600 mb-2">
                                    {t('lessons.next_lesson_title')}
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900">
                                        {nextLesson.translated_title || nextLesson.title}
                                    </h3>
                                    <p className="text-sm text-blue-600 mt-1">
                                        {t('lessons.level')} {nextLesson.level}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onProceed}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {t('lessons.proceed_to_next')}
                                    <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={onStay}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                                >
                                    {t('lessons.stay_here')}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* All lessons completed */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-yellow-600" />
                                </div>
                                <p className="text-gray-700">
                                    {t('lessons.all_lessons_completed')}
                                </p>
                            </div>
                            
                            <button
                                onClick={onClose}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                {t('actions.back')}
                            </button>
                        </>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}