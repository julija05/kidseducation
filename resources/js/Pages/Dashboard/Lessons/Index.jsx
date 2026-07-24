import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock,
    Lock,
    Play,
    Sparkles,
    Star,
    Trophy,
} from "lucide-react";
import { Card, Chip, BeadRod, StudentShell, STUDENT_NAV_KEYS } from "@/Components/StudentDashboard";
import { ABACODING_COLORS } from "@/constants/abacodingTheme";

// Bead color for the abacus-style progress rods, matching the dashboard.
const BEAD_ROD_COLOR = ABACODING_COLORS["aba-blue"];

// Program identifiers that unlock the abacus simulator practice tool.
const MENTAL_ARITHMETIC_PROGRAM_NAMES = ["Mental Arithmetic Mastery", "Ментална Аритметика"];

// Lesson progress statuses shared with the backend LessonProgress model.
const LESSON_STATUS_COMPLETED = "completed";
const LESSON_STATUS_IN_PROGRESS = "in_progress";

/**
 * LessonsIndex - "Learning path" overview page.
 *
 * Shows every level and lesson of the student's active program grouped by
 * level, with a prominent button at the top that jumps straight into the
 * lesson the student is currently on. Locked lessons stay visible but are not
 * clickable until their level is unlocked.
 *
 * @param {Object} enrolledProgram - Formatted program data (levels, lessons, progress).
 */
export default function LessonsIndex({ enrolledProgram }) {
    const { auth } = usePage().props;
    const student = auth?.user;

    if (!enrolledProgram) {
        return (
            <AuthenticatedLayout>
                <Head title="Lessons" />
                <EmptyState />
            </AuthenticatedLayout>
        );
    }

    const programName =
        enrolledProgram.translated_name || enrolledProgram.name || "Your program";
    const progress = clampPercent(enrolledProgram.progress);
    const nextLesson = enrolledProgram.nextLesson || null;
    const levels = buildLevels(enrolledProgram);
    const totalLessons = countTotalLessons(levels);
    const completedLessons = countCompletedLessons(levels);
    const isMentalArithmetic = isMentalArithmeticProgram(enrolledProgram);

    // Navigate to a lesson only when it is unlocked for the student.
    const openLesson = (lesson) => {
        if (!lesson?.is_unlocked) {
            return;
        }
        router.visit(route("lessons.show", lesson.id));
    };

    return (
        <AuthenticatedLayout
            programConfig={enrolledProgram.theme}
            abacusPlacement="dashboard"
            hideHeader
        >
            <Head title={`${programName} · Lessons`} />

            <StudentShell
                student={student}
                progress={progress}
                isMentalArithmetic={isMentalArithmetic}
                active={STUDENT_NAV_KEYS.LESSONS}
            >
                <LearningPathHero
                    programName={programName}
                    progress={progress}
                    completedLessons={completedLessons}
                    totalLessons={totalLessons}
                    nextLesson={nextLesson}
                    onContinue={openLesson}
                />

                <div className="space-y-5">
                    {levels.map((level) => (
                        <LevelSection
                            key={level.level}
                            level={level}
                            nextLessonId={nextLesson?.id ?? null}
                            onOpenLesson={openLesson}
                        />
                    ))}
                </div>
            </StudentShell>
        </AuthenticatedLayout>
    );
}

/**
 * Determines whether the program unlocks the abacus simulator practice tool.
 *
 * @param {Object} program - Formatted enrolled program data.
 * @returns {boolean} True for Mental Arithmetic programs.
 */
function isMentalArithmeticProgram(program) {
    if (!program) {
        return false;
    }

    return (
        MENTAL_ARITHMETIC_PROGRAM_NAMES.includes(program.name) ||
        MENTAL_ARITHMETIC_PROGRAM_NAMES.includes(program.translated_name)
    );
}

/**
 * LearningPathHero - Top card with program title, overall progress and the
 * "Continue" button that opens the lesson the student is currently on.
 */
function LearningPathHero({
    programName,
    progress,
    completedLessons,
    totalLessons,
    nextLesson,
    onContinue,
}) {
    return (
        <Card as="section" surface="alt" className="mt-4 overflow-hidden p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aba-surface text-aba-blue shadow-aba-sm">
                            <BookOpen className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-xs font-black uppercase tracking-wide text-aba-blue">
                                Learning path
                            </p>
                            <h1 className="font-display text-2xl font-black leading-tight text-aba-ink">
                                {programName}
                            </h1>
                        </div>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-aba-ink-soft">
                        {totalLessons > 0
                            ? `${completedLessons} of ${totalLessons} lessons completed`
                            : "Your lessons will appear here soon."}
                    </p>

                    <div className="mt-4 max-w-md">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-aba-ink-soft">
                            <span>Adventure progress</span>
                            <span className="text-aba-blue">{progress}%</span>
                        </div>
                        <div className="mt-2 flex">
                            <BeadRod percent={progress} color={BEAD_ROD_COLOR} />
                        </div>
                    </div>
                </div>

                <div className="shrink-0">
                    {nextLesson ? (
                        <div className="rounded-aba-md border border-aba-line bg-aba-surface p-4 shadow-aba-sm">
                            <p className="text-xs font-black uppercase tracking-wide text-aba-coral">
                                {progress > 0 ? "Continue where you left off" : "Start learning"}
                            </p>
                            <p className="mt-1 max-w-[16rem] break-words font-display text-lg font-black leading-tight text-aba-ink">
                                {nextLesson.translated_title || nextLesson.title}
                            </p>
                            {nextLesson.level ? (
                                <p className="mt-0.5 text-xs font-bold text-aba-ink-soft">
                                    Level {nextLesson.level}
                                </p>
                            ) : null}
                            <button
                                type="button"
                                onClick={() => onContinue(nextLesson)}
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-aba-sm bg-aba-coral px-5 py-3 text-sm font-black text-white shadow-aba-coral transition hover:bg-aba-coral-dark focus:outline-none focus:ring-2 focus:ring-aba-coral focus:ring-offset-2"
                            >
                                <Play className="h-4 w-4 fill-current" />
                                {progress > 0 ? "Continue Lesson" : "Start Lesson"}
                            </button>
                        </div>
                    ) : (
                        <div className="rounded-aba-md border border-aba-line bg-aba-surface p-5 text-center shadow-aba-sm">
                            <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-aba-green-soft text-aba-green">
                                <Trophy className="h-5 w-5" />
                            </span>
                            <p className="text-sm font-black text-aba-ink">
                                All lessons complete!
                            </p>
                            <p className="mt-1 text-xs font-semibold text-aba-ink-soft">
                                Great job finishing your adventure.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

/**
 * LevelSection - One level with its header (progress, lock/complete state) and
 * the list of lessons that belong to it.
 */
function LevelSection({ level, nextLessonId, onOpenLesson }) {
    const isLocked = !level.isUnlocked;
    const badge = getLevelBadge(level);

    return (
        <Card
            as="section"
            className={`p-5 ${isLocked ? "opacity-80" : ""}`}
            aria-label={`Level ${level.level}`}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-aba-sm text-sm font-black ${
                            isLocked
                                ? "bg-aba-surface-alt text-aba-ink-faint"
                                : level.isCompleted
                                  ? "bg-aba-green-soft text-aba-green"
                                  : "bg-aba-blue-soft text-aba-blue"
                        }`}
                    >
                        {isLocked ? (
                            <Lock className="h-5 w-5" />
                        ) : level.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                        ) : (
                            `L${level.level}`
                        )}
                    </span>
                    <div>
                        <h2 className="font-display text-lg font-black text-aba-ink">
                            Level {level.level}
                        </h2>
                        <p className="text-xs font-bold text-aba-ink-soft">
                            {level.completed} of {level.total} lessons done
                        </p>
                    </div>
                </div>

                <Chip variant={badge.variant}>{badge.label}</Chip>
            </div>

            {!isLocked && level.total > 0 && (
                <div className="mt-3 flex">
                    <BeadRod percent={clampPercent(level.progress)} color={BEAD_ROD_COLOR} />
                </div>
            )}

            {isLocked ? (
                <p className="mt-4 rounded-aba-sm bg-aba-surface-alt px-4 py-3 text-sm font-semibold text-aba-ink-soft">
                    Complete the previous level to unlock these lessons.
                </p>
            ) : (
                <ul className="mt-4 space-y-2">
                    {level.lessons.map((lesson) => (
                        <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            isCurrent={lesson.id === nextLessonId}
                            onOpen={onOpenLesson}
                        />
                    ))}
                </ul>
            )}
        </Card>
    );
}

/**
 * LessonRow - A single lesson entry. Unlocked lessons are clickable and route
 * to the lesson page; locked lessons are shown but disabled.
 */
function LessonRow({ lesson, isCurrent, onOpen }) {
    const title = lesson.translated_title || lesson.title;
    const isCompleted = lesson.status === LESSON_STATUS_COMPLETED;
    const isInProgress = lesson.status === LESSON_STATUS_IN_PROGRESS;
    const isLocked = !lesson.is_unlocked;
    const StatusIcon = getLessonStatusIcon({ isCompleted, isInProgress, isLocked });

    const baseClasses =
        "flex w-full items-center gap-3 rounded-aba-sm border px-4 py-3 text-left transition";
    const stateClasses = isLocked
        ? "cursor-not-allowed border-aba-line bg-aba-surface-alt text-aba-ink-faint"
        : isCurrent
          ? "border-aba-coral bg-aba-coral-soft hover:brightness-[0.98]"
          : "border-aba-line bg-aba-surface hover:border-aba-blue hover:bg-aba-blue-soft";

    return (
        <li>
            <button
                type="button"
                onClick={() => onOpen(lesson)}
                disabled={isLocked}
                aria-current={isCurrent ? "step" : undefined}
                className={`${baseClasses} ${stateClasses}`}
            >
                <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        isLocked
                            ? "bg-aba-surface text-aba-ink-faint"
                            : isCompleted
                              ? "bg-aba-green-soft text-aba-green"
                              : "bg-aba-surface text-aba-blue shadow-aba-sm"
                    }`}
                >
                    <StatusIcon className={`h-4 w-4 ${isInProgress && !isLocked ? "fill-current" : ""}`} />
                </span>

                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-black text-aba-ink">{title}</span>
                        {isCurrent && !isLocked && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-aba-coral px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                                <Sparkles className="h-3 w-3" /> Current
                            </span>
                        )}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-aba-ink-soft">
                        {lesson.duration && (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> {lesson.duration}
                            </span>
                        )}
                        {isCompleted && lesson.score != null && (
                            <span className="inline-flex items-center gap-1 text-aba-green">
                                <Star className="h-3.5 w-3.5" /> {Math.round(lesson.score)}%
                            </span>
                        )}
                        <span>{getLessonStatusLabel({ isCompleted, isInProgress, isLocked })}</span>
                    </span>
                </span>

                {!isLocked && <ArrowRight className="h-4 w-4 shrink-0 text-aba-ink-soft" />}
            </button>
        </li>
    );
}

/**
 * EmptyState - Shown when the student has no active program to browse.
 */
function EmptyState() {
    return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-aba-blue-soft text-aba-blue">
                <BookOpen className="h-7 w-7" />
            </span>
            <h1 className="font-display text-2xl font-black text-aba-ink">
                No lessons yet
            </h1>
            <p className="mt-2 text-sm font-semibold text-aba-ink-soft">
                Enroll in a program to start your learning adventure.
            </p>
            <Link
                href={route("dashboard")}
                className="mt-6 inline-flex items-center gap-2 rounded-aba-sm bg-aba-blue px-5 py-2.5 text-sm font-black text-white shadow-aba-sm transition hover:brightness-95"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
        </div>
    );
}

/**
 * Builds a sorted list of levels, each with its lessons and progress metadata,
 * by merging the level-progress summary with the lessons grouped by level.
 *
 * @param {Object} program - Formatted enrolled program data.
 * @returns {Array} Sorted level objects with attached lessons.
 */
function buildLevels(program) {
    const lessonsByLevel = program.lessons || {};
    const levelProgress = Array.isArray(program.levelProgress)
        ? program.levelProgress
        : [];

    // Collect every level number present in either source.
    const levelNumbers = new Set();
    levelProgress.forEach((entry) => levelNumbers.add(Number(entry.level)));
    Object.keys(lessonsByLevel).forEach((key) => levelNumbers.add(Number(key)));

    return Array.from(levelNumbers)
        .sort((a, b) => a - b)
        .map((levelNumber) => {
            const summary =
                levelProgress.find((entry) => Number(entry.level) === levelNumber) || {};
            const lessons = getLessonsForLevel(lessonsByLevel, levelNumber);

            return {
                level: levelNumber,
                lessons,
                completed: summary.completed ?? countCompletedInList(lessons),
                total: summary.total ?? lessons.length,
                progress: summary.progress ?? 0,
                isUnlocked:
                    summary.isUnlocked ??
                    lessons.some((lesson) => lesson.is_unlocked),
                isCompleted: summary.isCompleted ?? false,
            };
        });
}

/**
 * Returns the lessons for a level from the level-keyed lessons map, tolerating
 * both numeric and string keys produced by JSON serialization.
 */
function getLessonsForLevel(lessonsByLevel, levelNumber) {
    const lessons =
        lessonsByLevel[levelNumber] ?? lessonsByLevel[String(levelNumber)] ?? [];
    return Array.isArray(lessons) ? lessons : [];
}

/**
 * Returns the total number of lessons across all levels.
 */
function countTotalLessons(levels) {
    return levels.reduce((total, level) => total + level.lessons.length, 0);
}

/**
 * Returns the total number of completed lessons across all levels.
 */
function countCompletedLessons(levels) {
    return levels.reduce(
        (total, level) => total + countCompletedInList(level.lessons),
        0
    );
}

/**
 * Counts completed lessons within a single list.
 */
function countCompletedInList(lessons) {
    return lessons.filter((lesson) => lesson.status === LESSON_STATUS_COMPLETED)
        .length;
}

/**
 * Picks the status chip variant and label for a level header.
 */
function getLevelBadge(level) {
    if (!level.isUnlocked) {
        return { variant: "neutral", label: "Locked" };
    }
    if (level.isCompleted) {
        return { variant: "green", label: "Completed" };
    }
    if (level.completed > 0) {
        return { variant: "blue", label: "In progress" };
    }
    return { variant: "yellow", label: "Ready" };
}

/**
 * Returns the icon component representing a lesson's current state.
 */
function getLessonStatusIcon({ isCompleted, isInProgress, isLocked }) {
    if (isLocked) {
        return Lock;
    }
    if (isCompleted) {
        return CheckCircle2;
    }
    if (isInProgress) {
        return Play;
    }
    return Play;
}

/**
 * Returns a short human-readable label for a lesson's current state.
 */
function getLessonStatusLabel({ isCompleted, isInProgress, isLocked }) {
    if (isLocked) {
        return "Locked";
    }
    if (isCompleted) {
        return "Completed";
    }
    if (isInProgress) {
        return "In progress";
    }
    return "Not started";
}

/**
 * Clamps a numeric value into the 0-100 percentage range.
 */
function clampPercent(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}
