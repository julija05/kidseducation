import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowRight, Award, Bell, Calendar, Lock } from "lucide-react";
import {
    BeadRod,
    Card,
    StudentShell,
    STUDENT_NAV_KEYS,
    isMentalArithmeticProgram,
} from "@/Components/StudentDashboard";

// Filled-bead colour for the summary progress rod (matches the "aba-yellow" token).
const SUMMARY_ROD_COLOR = "#FFAE1F";

// Maps a badge's soft-colour token to a literal Tailwind background class.
// Kept as literal strings so Tailwind's compiler can see every class name.
const BADGE_BG_CLASS = {
    "aba-blue-soft": "bg-aba-blue-soft",
    "aba-coral-soft": "bg-aba-coral-soft",
    "aba-green-soft": "bg-aba-green-soft",
    "aba-yellow-soft": "bg-aba-yellow-soft",
    "aba-purple-soft": "bg-aba-purple-soft",
};

/**
 * AchievementsIndex - Student Achievements page.
 *
 * Shows every badge the student can earn, grouped by category. Earned badges are
 * highlighted; locked ones show what's needed (and a progress rod when the goal
 * is measurable). The summary card reports how far along the whole collection is.
 *
 * @param {Object} enrolledProgram - Formatted program data (for theme + shell).
 * @param {Object} summary - { earned, total, percent, latest }.
 * @param {Array} categories - Badge groups: { key, title, subtitle, badges }.
 */
export default function AchievementsIndex({ enrolledProgram, summary, categories = [] }) {
    const { auth, unreadNotificationCount = 0 } = usePage().props;
    const student = auth?.user;

    if (!enrolledProgram) {
        return (
            <AuthenticatedLayout>
                <Head title="Achievements" />
                <EmptyState />
            </AuthenticatedLayout>
        );
    }

    const programName =
        enrolledProgram.translated_name || enrolledProgram.name || "Your program";
    const progress = clampPercent(enrolledProgram.progress);
    const isMentalArithmetic = isMentalArithmeticProgram(enrolledProgram);

    return (
        <AuthenticatedLayout
            programConfig={enrolledProgram.theme}
            abacusPlacement="dashboard"
            hideHeader
        >
            <Head title={`${programName} · Achievements`} />

            <StudentShell
                student={student}
                progress={progress}
                isMentalArithmetic={isMentalArithmetic}
                active={STUDENT_NAV_KEYS.ACHIEVEMENTS}
            >
                <AchievementsHeader unreadNotificationCount={unreadNotificationCount} />

                <SummaryCard summary={summary} />

                {categories.map((category) => (
                    <BadgeCategory key={category.key} category={category} />
                ))}
            </StudentShell>
        </AuthenticatedLayout>
    );
}

/**
 * AchievementsHeader - Page title with date pill and notification indicator.
 */
function AchievementsHeader({ unreadNotificationCount }) {
    const today = new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    }).format(new Date());

    return (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-sm font-black uppercase tracking-wide text-aba-blue">Achievements</p>
                <h1 className="mt-1 font-display text-3xl font-black leading-tight text-aba-ink">
                    Achievements 🏆
                </h1>
                <p className="mt-1 text-sm font-medium text-aba-ink-soft">
                    Every badge tells the story of how far you've come.
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
 * SummaryCard - Badges-earned count, progress rod and the most recent badge.
 */
function SummaryCard({ summary }) {
    const earned = summary?.earned ?? 0;
    const total = summary?.total ?? 0;
    const percent = clampPercent(summary?.percent);
    const latest = summary?.latest;

    return (
        <Card className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-aba-yellow text-2xl shadow-aba-sm">
                    🏅
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-wide text-aba-ink-faint">
                        Badges earned
                    </p>
                    <p className="font-display text-2xl font-black text-aba-ink">
                        {earned} of {total}
                    </p>
                    <div className="mt-2 max-w-xs">
                        <BeadRod percent={percent} color={SUMMARY_ROD_COLOR} />
                    </div>
                </div>
            </div>

            {latest && (
                <div className="flex items-center gap-3 rounded-aba-md bg-aba-surface-alt px-4 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aba-purple-soft text-lg">
                        {latest.icon}
                    </span>
                    <div>
                        <p className="text-[10.5px] font-black uppercase tracking-wide text-aba-ink-faint">
                            Latest badge
                        </p>
                        <p className="text-sm font-black text-aba-ink">
                            {latest.name}
                            {latest.earnedAt ? ` — ${latest.earnedAt}` : ""}
                        </p>
                    </div>
                </div>
            )}
        </Card>
    );
}

/**
 * BadgeCategory - A titled section with a responsive grid of badge cards.
 */
function BadgeCategory({ category }) {
    return (
        <section className="space-y-3">
            <div className="flex items-baseline gap-2 pt-1">
                <h2 className="font-display text-lg font-black text-aba-ink">{category.title}</h2>
                {category.subtitle && (
                    <span className="text-sm font-bold text-aba-ink-faint">{category.subtitle}</span>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {category.badges.map((badge) => (
                    <BadgeCard key={badge.key} badge={badge} />
                ))}
            </div>
        </section>
    );
}

/**
 * BadgeCard - A single badge, rendered earned or locked.
 *
 * Locked badges that link somewhere (e.g. practice badges pointing at the
 * Practice page) render as a link so the child can jump straight to earning it.
 */
function BadgeCard({ badge }) {
    const isLink = !badge.earned && Boolean(badge.href);
    const Container = isLink ? "a" : "div";
    const containerProps = isLink ? { href: badge.href } : {};

    return (
        <Container
            {...containerProps}
            className={`flex flex-col items-center rounded-aba-lg bg-aba-surface px-4 py-5 text-center shadow-aba-sm transition ${
                badge.earned ? "" : "opacity-80"
            } ${isLink ? "hover:-translate-y-0.5 hover:opacity-100 hover:shadow-aba-card" : ""}`}
        >
            <BadgeIcon badge={badge} />

            <p className="mt-3 text-[13px] font-black leading-tight text-aba-ink">{badge.name}</p>

            {badge.earned ? (
                <p className="mt-1 text-[11px] font-black text-aba-green">
                    {badge.earnedAt ? `Earned ${badge.earnedAt}` : "Earned"}
                </p>
            ) : (
                <>
                    <p className="mt-1 text-[11px] font-bold leading-snug text-aba-ink-faint">
                        {badge.hint}
                    </p>
                    {typeof badge.progress === "number" && badge.progress > 0 && (
                        <div className="mt-2 flex w-full items-center gap-2">
                            <BeadRod percent={badge.progress} size="sm" />
                            <span className="text-[10px] font-black text-aba-ink-faint">
                                {clampPercent(badge.progress)}%
                            </span>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
}

/**
 * BadgeIcon - The circular emblem, coloured when earned and greyed with a lock
 * pin when still locked.
 */
function BadgeIcon({ badge }) {
    if (badge.earned) {
        const bgClass = BADGE_BG_CLASS[badge.color] || "bg-aba-blue-soft";

        return (
            <span className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl ${bgClass}`}>
                {badge.icon}
            </span>
        );
    }

    return (
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-aba-surface-alt text-2xl grayscale">
            {badge.icon}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-aba-surface bg-aba-surface text-aba-ink-faint shadow-aba-sm">
                <Lock className="h-3 w-3" />
            </span>
        </span>
    );
}

/**
 * EmptyState - Shown when the student has no active program.
 */
function EmptyState() {
    return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-aba-yellow-soft text-aba-yellow">
                <Award className="h-7 w-7" />
            </span>
            <h1 className="font-display text-2xl font-black text-aba-ink">No achievements yet</h1>
            <p className="mt-2 text-sm font-semibold text-aba-ink-soft">
                Enroll in a program to start earning badges.
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
 * Clamps a numeric value into the 0-100 percentage range.
 */
function clampPercent(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}
