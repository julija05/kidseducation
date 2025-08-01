import React from "react";
import { router } from "@inertiajs/react";
import { ArrowLeft, BookOpen, Clock, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function LessonHeader({
    lesson,
    program,
    progress,
    hasResources,
}) {
    const { t } = useTranslation();
    
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() =>
                        router.visit(
                            route(
                                "dashboard.programs.show",
                                program?.slug || "dashboard"
                            )
                        )
                    }
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    {t('lessons.back_to_program')}
                </button>

                <div className="text-sm text-gray-500">
                    Level {lesson.level} • Lesson {lesson.order_in_level}
                </div>
            </div>

            <div className="flex items-center mb-2">
                <BookOpen size={20} className="mr-2" />
                <h1 className="text-2xl font-bold">{lesson.translated_title || lesson.title}</h1>
            </div>

            {(lesson.translated_description || lesson.description) && (
                <p className="text-gray-600 mb-4">{lesson.translated_description || lesson.description}</p>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                    <Clock size={16} className="mr-2" />
                    <span>
                        {lesson.formatted_duration ||
                            `${lesson.duration_minutes || 30} min`}
                    </span>
                    {hasResources && (
                        <>
                            <span className="mx-2">•</span>
                            <Eye size={16} className="mr-1" />
                            <span>
                                {lesson.resources.length} resource
                                {lesson.resources.length !== 1 ? "s" : ""}
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-sm font-medium">
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>
        </div>
    );
}
