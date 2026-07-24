import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    Award,
    Bell,
    BookOpen,
    Calendar,
    CheckCircle2,
    Lock,
    Star,
    Trophy,
} from "lucide-react";
import { Card, Chip, BeadRod, StudentShell, STUDENT_NAV_KEYS } from "@/Components/StudentDashboard";
import { ABACODING_COLORS } from "@/constants/abacodingTheme";

// Program identifiers that unlock the abacus simulator practice tool.
const MENTAL_ARITHMETIC_PROGRAM_NAMES = ["Mental Arithmetic Mastery", "Ментална Аритметика"];

// Rotating accents so each level card gets a distinct, on-brand color, matching
// the "skills breakdown" look of the design mockup.
const LEVEL_ACCENTS = [
    { iconBg: "bg-aba-blue-soft", iconText: "text-aba-blue", pctText: "text-aba-blue", bead: ABACODING_COLORS["aba-blue"] },
    { iconBg: "bg-aba-coral-soft", iconText: "text-aba-coral-dark", pctText: "text-aba-coral-dark", bead: ABACODING_COLORS["aba-coral"] },
    { iconBg: "bg-aba-yellow-soft", iconText: "text-[#B9790A]", pctText: "text-[#B9790A]", bead: ABACODING_COLORS["aba-yellow"] },
    { iconBg: "bg-aba-green-soft", iconText: "text-aba-green", pctText: "text-aba-green", bead: ABACODING_COLORS["aba-green"] },
    { iconBg: "bg-aba-purple-soft", iconText: "text-aba-purple", pctText: "text-aba-purple", bead: ABACODING_COLORS["aba-purple"] },
];

// Neutral accent used for locked levels.
const LOCKED_ACCENT = {
    iconBg: "bg-aba-surface-alt",
    iconText: "text-aba-ink-faint",
    pctText: "text-aba-ink-faint",
    bead: ABACODING_COLORS["aba-rod"],
};

/**
 * ProgressIndex - "My Progress" page.
 *
 * Shows the student's overall progress, a per-level breakdown (replacing the
 * per-skill breakdown from the design mockup), and milestones derived from the
 * levels they have completed.
 *
 * @param {Object} enrolledProgram - Formatted program data (levels, progress, points).
 */
export default function ProgressIndex({ enrolledProgram }) {
    const { auth, unreadNotificationCount = 0 } = usePage().props;
    const student = auth?.user;

    if (!enrolledProgram) {
        return (
            <AuthenticatedLayout>
                <Head title="My Progress" />
                <EmptyState />
            </AuthenticatedLayout>
        );
    }

    const programName =
        enrolledProgram.translated_name || enrolledProgram.name || "Your program";
    const progress = clampPercent(enrolledProgram.progress);
    const levels = buildLevels(enrolledProgram);
    const currentLevel = enrolledProgram.currentLevel || 1;
    const totalLevels = enrolledProgram.totalLevels || levels.length;
    const points = Number(enrolledProgram.quizPoints) || 0;
    const isMentalArithmetic = isMentalArithmeticProgram(enrolledProgram);
    const milestones = buildMilestones(levels, progress);

    return (
        <AuthenticatedLayout
            programConfig={enrolledProgram.theme}
            abacusPlacement="dashboard"
            hideHeader
        >
            <Head title={`${programName} · My Progress`} />

            <StudentShell
                student={student}
                progress={progress}
                isMentalArithmetic={isMentalArithmetic}
                active={STUDENT_NAV_KEYS.PROGRESS}
            >
                <ProgressHeader unreadNotificationCount={unreadNotificationCount} />

                <SummaryStrip
                    progress={progress}
                    currentLevel={currentLevel}
                    totalLevels={totalLevels}
                    points={points}
                />

                <SectionHeading title="Levels Breakdown" count={levels.length} />

                {levels.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {levels.map((level, index) => (
                            <LevelCard
                                key={level.level}
                                level={level}
                                accent={level.isUnlocked ? LEVEL_ACCENTS[index % LEVEL_ACCENTS.length] : LOCKED_ACCENT}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="p-6 text-center text-sm font-semibold text-aba-ink-soft">
                        Your levels will appear here once your program has lessons.
                    </Card>
                )}

                <MilestonesCard milestones={milestones} />
            </StudentShell>
        </AuthenticatedLayout>
    );
}

/**
 * ProgressHeader - Page title with date pill and notification indicator.
 */
function ProgressHeader({ unreadNotificationCount }) {
    const today = new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    }).format(new Date());

    return (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-sm font-black uppercase tracking-wide text-aba-blue">Progress</p>
                <h1 className="mt-1 font-display text-3xl font-black leading-tight text-aba-ink">
                    My Progress 📈
                </h1>
                <p className="mt-1 text-sm font-medium text-aba-ink-soft">
                    See how far you've come in every level.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-aba-sm bg-aba-surface px-4 py-2.5 text-sm font-bold text-aba-ink-soft shadow-aba-sm">
                    <Calendar className="h-4 w-4 text-aba-blue" />
                    {today}
                </span>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-aba-sm bg-aba-surface text-aba-ink-soft shadow-aba-sm">
                    <Bell className="h-5 w-5" />
                    {unreadNotificationCount > 0 && (
                        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-aba-coral px-1.5 py-0.5 text-center text-xs font-black text-white">
                            {unreadNotificationCount}
                        </span>
                    )}
                </span>
            </div>
        </header>
    );
}

/**
 * SummaryStrip - Overall progress, current level and points earned.
 */
function SummaryStrip({ progress, currentLevel, totalLevels, points }) {
    return (
        <Card className="p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-aba-line">
                <div className="sm:pr-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-aba-ink-faint">
                        Overall progress
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                        <span className="font-display text-4xl font-black text-aba-green">{progress}%</span>
                        <div className="flex flex-1">
                            <BeadRod percent={progress} color={ABACODING_COLORS["aba-green"]} />
                        </div>
                    </div>
                </div>

                <div className="sm:px-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-aba-ink-faint">
                        Current level
                    </p>
                    <p className="mt-2 font-display text-xl font-black text-aba-ink">
                        Level {currentLevel}
                        <span className="text-sm font-bold text-aba-ink-soft"> / {totalLevels}</span>
                    </p>
                </div>

                <div className="sm:pl-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-aba-ink-faint">
                        Points earned
                    </p>
                    <p className="mt-2 flex items-center gap-2 font-display text-xl font-black text-aba-ink">
                        <Star className="h-5 w-5 text-aba-yellow" />
                        {points.toLocaleString()} pts
                    </p>
                </div>
            </div>
        </Card>
    );
}

/**
 * SectionHeading - Small heading with an item count, matching the mockup.
 */
function SectionHeading({ title, count }) {
    return (
        <div className="flex items-baseline gap-2 pt-1">
            <h2 className="font-display text-lg font-black text-aba-ink">{title}</h2>
            <span className="text-sm font-bold text-aba-ink-faint">
                {count} {count === 1 ? "level" : "levels"} tracked
            </span>
        </div>
    );
}

/**
 * LevelCard - A single level's progress, encouragement note and status chip.
 */
function LevelCard({ level, accent }) {
    const isLocked = !level.isUnlocked;
    const percent = clampPercent(level.progress);
    const badge = getLevelBadge(level);

    return (
        <Card className={`p-5 ${isLocked ? "opacity-80" : ""}`}>
            <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-aba-sm text-sm font-black ${accent.iconBg} ${accent.iconText}`}>
                    {isLocked ? (
                        <Lock className="h-5 w-5" />
                    ) : level.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                    ) : (
                        `L${level.level}`
                    )}
                </span>
                <p className="font-display text-base font-black text-aba-ink">Level {level.level}</p>
                <span className={`ml-auto font-display text-2xl font-black ${accent.pctText}`}>
                    {percent}%
                </span>
            </div>

            <div className="mt-4 flex">
                <BeadRod percent={percent} color={accent.bead} />
            </div>

            <p className="mt-4 text-sm font-semibold text-aba-ink-soft">
                {getLevelNote(level)}
            </p>

            <div className="mt-4 flex items-center justify-between">
                <Chip variant={badge.variant}>{badge.label}</Chip>
                {isLocked ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-aba-ink-faint">
                        <Lock className="h-3.5 w-3.5" /> Locked
                    </span>
                ) : (
                    <Link
                        href={route("lessons.index")}
                        className="inline-flex items-center gap-1.5 rounded-aba-sm border border-aba-line bg-aba-surface px-3 py-2 text-xs font-black text-aba-ink transition hover:border-aba-blue hover:text-aba-blue"
                    >
                        <BookOpen className="h-3.5 w-3.5" /> View lessons
                    </Link>
                )}
            </div>
        </Card>
    );
}

/**
 * MilestonesCard - Horizontal strip of achievement badges derived from levels.
 */
function MilestonesCard({ milestones }) {
    return (
        <Card className="p-5">
            <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-aba-sm bg-aba-purple-soft text-aba-purple">
                    <Trophy className="h-4 w-4" />
                </span>
                <h2 className="font-display text-lg font-black text-aba-ink">Milestones</h2>
            </div>

            <div className="mt-4 flex gap-5 overflow-x-auto pb-1">
                {milestones.map((milestone) => (
                    <div
                        key={milestone.key}
                        className={`flex min-w-[92px] flex-col items-center gap-2 ${milestone.unlocked ? "" : "opacity-45"}`}
                    >
                        <span
                            className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                                milestone.unlocked ? milestone.bg : "bg-aba-surface-alt grayscale"
                            }`}
                        >
                            {milestone.icon}
                        </span>
                        <span className="text-center text-xs font-black text-aba-ink-soft">
                            {milestone.label}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

/**
 * EmptyState - Shown when the student has no active program.
 */
function EmptyState() {
    return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-aba-blue-soft text-aba-blue">
                <Award className="h-7 w-7" />
            </span>
            <h1 className="font-display text-2xl font-black text-aba-ink">No progress yet</h1>
            <p className="mt-2 text-sm font-semibold text-aba-ink-soft">
                Enroll in a program to start tracking your progress.
            </p>
            <Link
                href={route("dashboard")}
                className="mt-6 inline-flex items-center gap-2 rounded-aba-sm bg-aba-blue px-5 py-2.5 text-sm font-black text-white shadow-aba-sm transition hover:brightness-95"
            >
                Back to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}

/**
 * Builds a sorted list of levels with progress metadata from the level-progress
 * summary returned by the backend.
 *
 * @param {Object} program - Formatted enrolled program data.
 * @returns {Array} Sorted level objects.
 */
function buildLevels(program) {
    const levelProgress = Array.isArray(program.levelProgress)
        ? program.levelProgress
        : [];

    return levelProgress
        .map((entry) => ({
            level: Number(entry.level),
            completed: Number(entry.completed) || 0,
            total: Number(entry.total) || 0,
            progress: Number(entry.progress) || 0,
            isUnlocked: Boolean(entry.isUnlocked),
            isCompleted: Boolean(entry.isCompleted),
        }))
        .sort((a, b) => a.level - b.level);
}

/**
 * Builds milestone badges from the student's level progress. Milestones are
 * derived from real progress data (no fabricated achievements).
 *
 * @param {Array} levels - Sorted level objects.
 * @param {number} overallProgress - Overall program progress percentage.
 * @returns {Array} Milestone descriptors.
 */
function buildMilestones(levels, overallProgress) {
    const completedLessons = levels.reduce((total, level) => total + level.completed, 0);

    const milestones = [
        {
            key: "first-lesson",
            label: "First Lesson",
            icon: "🎯",
            bg: "bg-aba-green-soft",
            unlocked: completedLessons >= 1,
        },
    ];

    // One badge per level, unlocked when that level is fully completed.
    levels.forEach((level) => {
        milestones.push({
            key: `level-${level.level}`,
            label: `Level ${level.level} Done`,
            icon: level.isCompleted ? "🏆" : "🔒",
            bg: "bg-aba-yellow-soft",
            unlocked: level.isCompleted,
        });
    });

    milestones.push({
        key: "program-master",
        label: "Program Master",
        icon: "⭐",
        bg: "bg-aba-purple-soft",
        unlocked: overallProgress >= 100,
    });

    return milestones;
}

/**
 * Picks a status chip variant and label for a level card.
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
 * Returns an encouraging note tailored to a level's progress state.
 */
function getLevelNote(level) {
    if (!level.isUnlocked) {
        return "Complete the previous level to unlock this one. 🔒";
    }
    if (level.isCompleted) {
        return "Level complete — amazing work! 🎉";
    }

    const percent = clampPercent(level.progress);
    if (percent >= 75) {
        return "Almost there! Just a little more to finish. 💪";
    }
    if (percent >= 25) {
        return "Good progress — keep the momentum going! 🌟";
    }
    if (percent > 0) {
        return "You've made a start — every lesson counts. 🌱";
    }
    return "Ready when you are — let's begin this level! 🚀";
}

/**
 * Determines whether the program unlocks the abacus simulator practice tool.
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
 * Clamps a numeric value into the 0-100 percentage range.
 */
function clampPercent(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}
