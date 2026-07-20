import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { CheckCircle, Target, Sparkles, Trophy } from "lucide-react";

// Progress percentage applied by the "mark mostly done" shortcut.
const PARTIAL_PROGRESS_PERCENT = 75;

// Progress percentage at which a lesson counts as finished.
const COMPLETED_PROGRESS_PERCENT = 100;

/**
 * LessonActions - Sticky footer bar holding the lesson progress summary and the
 * buttons that advance the lesson.
 *
 * Rendered as the last child of the scrolling page wrapper (not inside the
 * content grid) so it stays pinned to the bottom of the viewport while the
 * lesson content scrolls behind it.
 *
 * @param {number} currentProgress - Lesson progress percentage (0-100)
 * @param {boolean} isLoading - Whether a progress request is in flight
 * @param {function} onUpdateProgress - Called with a percentage to save partial progress
 * @param {function} onCompleteLesson - Called to mark the lesson complete
 */
export default function LessonActions({
    currentProgress,
    isLoading,
    onUpdateProgress,
    onCompleteLesson,
}) {
    const { t } = useTranslation();
    const isCompleted = currentProgress >= COMPLETED_PROGRESS_PERCENT;

    return (
        <section className="sticky bottom-0 z-10 border-t border-aba-line bg-aba-surface shadow-aba-card">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-aba-sm bg-aba-green-soft text-aba-green">
                        <Target className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wide text-aba-blue">
                            {t('lessons.lesson_progress')}
                        </p>
                        <h3 className="font-display text-xl font-black text-aba-ink">
                            {t('lessons.progress_complete', { progress: Math.round(currentProgress) })}
                        </h3>
                    </div>
                </div>

                {!isCompleted && (
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => onUpdateProgress(PARTIAL_PROGRESS_PERCENT)}
                            className="inline-flex items-center gap-2 rounded-aba-sm bg-aba-surface-alt px-5 py-3 text-sm font-black text-aba-ink-soft shadow-aba-sm transition hover:text-aba-blue"
                        >
                            <Sparkles size={18} />
                            {t('lessons.mark_75_complete')}
                        </button>

                        <button
                            type="button"
                            onClick={() => onCompleteLesson()}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-aba-sm bg-aba-coral px-5 py-3 text-sm font-black text-white shadow-aba-coral transition hover:bg-aba-coral-dark focus:outline-none focus:ring-2 focus:ring-aba-coral focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {t('lessons.completing')}
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    {t('lessons.complete_lesson')}
                                </>
                            )}
                        </button>
                    </div>
                )}

                {isCompleted && (
                    <div className="inline-flex items-center gap-2.5 rounded-aba-sm bg-aba-green-soft px-5 py-3">
                        <Trophy className="h-5 w-5 text-aba-green" />
                        <span className="text-sm font-black text-aba-green">
                            {t('lessons.lesson_completed')}
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
}
