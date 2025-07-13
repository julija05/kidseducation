import React from "react";
import { router } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function LessonNavigation({
    previousLesson,
    nextLesson,
    currentProgress,
}) {
    return (
        <div className="mt-6 flex items-center justify-between">
            <div>
                {previousLesson && (
                    <button
                        onClick={() =>
                            router.visit(
                                route("lessons.show", previousLesson.id)
                            )
                        }
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Previous Lesson
                    </button>
                )}
            </div>

            <div className="flex items-center space-x-4">
                {currentProgress >= 100 && (
                    <div className="flex items-center text-green-600">
                        <CheckCircle size={20} className="mr-2" />
                        <span className="font-medium">Completed</span>
                    </div>
                )}

                {nextLesson && currentProgress >= 100 && (
                    <button
                        onClick={() =>
                            router.visit(route("lessons.show", nextLesson.id))
                        }
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Next Lesson
                        <ArrowRight size={16} className="ml-2" />
                    </button>
                )}
            </div>
        </div>
    );
}
