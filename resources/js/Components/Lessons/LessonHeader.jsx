import React from "react";
import { BookOpen, Clock, Eye, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, BeadRod, Chip, getChipForPercent } from "@/Components/StudentDashboard";
import { ABACODING_COLORS } from "@/constants/abacodingTheme";

// Bead color for the abacus-style progress rod, matching the student dashboard.
const BEAD_ROD_COLOR = ABACODING_COLORS["aba-blue"];

// Fallback duration shown when the lesson has no duration set.
const DEFAULT_LESSON_DURATION_MINUTES = 30;

/**
 * LessonHeader - Hero card introducing the lesson, its program and progress.
 *
 * @param {object} lesson - Lesson being viewed
 * @param {object} program - Program the lesson belongs to
 * @param {number} progress - Lesson progress percentage (0-100)
 * @param {boolean} hasResources - Whether the lesson has any resources
 */
export default function LessonHeader({
    lesson,
    program,
    progress,
    hasResources,
}) {
    const { t } = useTranslation();
    const roundedProgress = Math.round(progress);
    const { variant: chipVariant, label: chipLabel } = getChipForPercent(progress);

    return (
        <Card as="header" surface="alt" className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-wide text-aba-blue">
                        {t('lessons.level')} {lesson.level} • {t('lessons.lesson')} {lesson.order_in_level}
                    </p>
                    <div className="mt-2 flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-aba-sm bg-aba-surface text-aba-blue shadow-aba-sm">
                            <BookOpen className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="break-words font-display text-3xl font-black leading-tight text-aba-ink">
                                {lesson.translated_title || lesson.title}
                            </h1>
                            <p className="mt-1 text-sm font-semibold text-aba-ink-soft">
                                {program?.translated_name || program?.name}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-xs shrink-0 rounded-aba-md bg-aba-surface p-4 shadow-aba-sm">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-aba-ink-soft">
                        <span>{t('lessons.lesson_progress')}</span>
                        <span className="text-aba-blue">{roundedProgress}%</span>
                    </div>
                    <div className="mt-2 flex">
                        <BeadRod percent={progress} color={BEAD_ROD_COLOR} />
                    </div>
                    <div className="mt-3">
                        <Chip variant={chipVariant}>{chipLabel}</Chip>
                    </div>
                </div>
            </div>

            {(lesson.translated_description || lesson.description) && (
                <p className="mt-4 max-w-3xl text-sm font-medium leading-6 text-aba-ink-soft">
                    {lesson.translated_description || lesson.description}
                </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <LessonMeta
                    icon={Clock}
                    tone="bg-aba-blue-soft text-aba-blue"
                    label={t('lessons.duration')}
                    value={lesson.formatted_duration || `${lesson.duration_minutes || DEFAULT_LESSON_DURATION_MINUTES} min`}
                />

                {hasResources && (
                    <LessonMeta
                        icon={Eye}
                        tone="bg-aba-purple-soft text-aba-purple"
                        label={t('lessons.resources')}
                        value={`${lesson.resources.length} ${
                            lesson.resources.length !== 1
                                ? t('lessons.resources')
                                : t('lessons.resource')
                        }`}
                    />
                )}

                <LessonMeta
                    icon={Sparkles}
                    tone="bg-aba-yellow-soft text-aba-yellow"
                    label={t('lessons.difficulty')}
                    value={`${t('lessons.level')} ${lesson.level}`}
                />
            </div>
        </Card>
    );
}

/**
 * LessonMeta - Single labelled fact tile in the lesson header grid.
 *
 * @param {React.ElementType} icon - Lucide icon component
 * @param {string} tone - Background/text classes for the icon tile
 * @param {string} label - Fact label
 * @param {string} value - Fact value
 */
function LessonMeta({ icon: Icon, tone, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-aba-sm bg-aba-surface px-3 py-2.5 shadow-aba-sm">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-aba-ink-soft">
                    {label}
                </p>
                <p className="truncate text-base font-black text-aba-ink">{value}</p>
            </div>
        </div>
    );
}
