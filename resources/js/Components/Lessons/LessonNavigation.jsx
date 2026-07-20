import React from "react";
import { router } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

// Progress percentage at which a lesson counts as finished.
const COMPLETED_PROGRESS_PERCENT = 100;

/**
 * LessonNavigation - Previous/next lesson controls and the completed indicator.
 *
 * @param {object} previousLesson - Lesson before this one, if any
 * @param {object} nextLesson - Lesson after this one, if any
 * @param {number} currentProgress - Lesson progress percentage (0-100)
 */
export default function LessonNavigation({
    previousLesson,
    nextLesson,
    currentProgress,
}) {
    const { t } = useTranslation();
    const isCompleted = currentProgress >= COMPLETED_PROGRESS_PERCENT;

    return (
        <div className="mt-4 flex items-center justify-between">
            <div>
                {previousLesson && (
                    <button
                        type="button"
                        onClick={() =>
                            router.visit(
                                route("lessons.show", previousLesson.id)
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-aba-sm bg-aba-surface px-4 py-2.5 text-sm font-black text-aba-ink-soft shadow-aba-sm transition hover:text-aba-blue"
                    >
                        <ArrowLeft size={16} />
                        {t('lessons.previous_lesson')}
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4">
                {isCompleted && (
                    <div className="inline-flex items-center gap-2 text-aba-green">
                        <CheckCircle size={20} />
                        <span className="font-black">{t('lessons.completed')}</span>
                    </div>
                )}

                {nextLesson && isCompleted && (
                    <button
                        type="button"
                        onClick={() =>
                            router.visit(route("lessons.show", nextLesson.id))
                        }
                        className="inline-flex items-center gap-2 rounded-aba-sm bg-aba-blue px-5 py-2.5 text-sm font-black text-white shadow-aba-sm transition hover:brightness-95"
                    >
                        {t('lessons.next_lesson')}
                        <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
