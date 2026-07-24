import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    Bell,
    Calculator,
    Calendar,
    Dumbbell,
    FileText,
    MessageSquare,
    Paperclip,
    Zap,
} from "lucide-react";
import { Card, StudentShell, STUDENT_NAV_KEYS, openAbacusSimulator } from "@/Components/StudentDashboard";
import MentalAccelerator from "@/Components/Practice/MentalAccelerator";

// Program identifiers that unlock the abacus simulator practice tool.
const MENTAL_ARITHMETIC_PROGRAM_NAMES = ["Mental Arithmetic Mastery", "Ментална Аритметика"];

/**
 * PracticeIndex - Student Practice hub.
 *
 * Hosts the Mental Accelerator (Flash Anzan) launcher when the program includes
 * it, the abacus simulator for Mental Arithmetic, and the practice resources a
 * mentor has shared with the student's learning groups.
 *
 * @param {Object} enrolledProgram - Formatted program data (incl. hasMentalAccelerator).
 * @param {Array} practiceResources - Mentor practice messages/files for the student.
 */
export default function PracticeIndex({ enrolledProgram, practiceResources = [] }) {
    const { auth, unreadNotificationCount = 0 } = usePage().props;
    const student = auth?.user;
    const [showAccelerator, setShowAccelerator] = useState(false);

    if (!enrolledProgram) {
        return (
            <AuthenticatedLayout>
                <Head title="Practice" />
                <EmptyState />
            </AuthenticatedLayout>
        );
    }

    const programName =
        enrolledProgram.translated_name || enrolledProgram.name || "Your program";
    const progress = clampPercent(enrolledProgram.progress);
    const hasMentalAccelerator = Boolean(enrolledProgram.hasMentalAccelerator);
    const isMentalArithmetic = isMentalArithmeticProgram(enrolledProgram);
    const hasAnyTool = hasMentalAccelerator || isMentalArithmetic;

    return (
        <AuthenticatedLayout
            programConfig={enrolledProgram.theme}
            abacusPlacement="dashboard"
            hideHeader
        >
            <Head title={`${programName} · Practice`} />

            <StudentShell
                student={student}
                progress={progress}
                isMentalArithmetic={isMentalArithmetic}
                active={STUDENT_NAV_KEYS.PRACTICE}
            >
                <PracticeHeader unreadNotificationCount={unreadNotificationCount} />

                <SectionHeading title="Practice tools" />
                {hasAnyTool ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {hasMentalAccelerator && (
                            <MentalAcceleratorCard onLaunch={() => setShowAccelerator(true)} />
                        )}
                        {isMentalArithmetic && <AbacusCard onLaunch={openAbacusSimulator} />}
                    </div>
                ) : (
                    <Card className="p-6 text-center text-sm font-semibold text-aba-ink-soft">
                        No practice tools are enabled for this program yet.
                    </Card>
                )}

                <SectionHeading title="From your mentor" count={practiceResources.length} />
                <PracticeResourceList resources={practiceResources} />
            </StudentShell>

            <MentalAccelerator isOpen={showAccelerator} onClose={() => setShowAccelerator(false)} />
        </AuthenticatedLayout>
    );
}

/**
 * PracticeHeader - Page title with date pill and notification indicator.
 */
function PracticeHeader({ unreadNotificationCount }) {
    const today = new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    }).format(new Date());

    return (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-sm font-black uppercase tracking-wide text-aba-blue">Practice</p>
                <h1 className="mt-1 font-display text-3xl font-black leading-tight text-aba-ink">
                    Practice Zone 🏆
                </h1>
                <p className="mt-1 text-sm font-medium text-aba-ink-soft">
                    Train your brain and finish what your mentor shared.
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
 * SectionHeading - Small heading with an optional item count.
 */
function SectionHeading({ title, count }) {
    return (
        <div className="flex items-baseline gap-2 pt-1">
            <h2 className="font-display text-lg font-black text-aba-ink">{title}</h2>
            {typeof count === "number" && (
                <span className="text-sm font-bold text-aba-ink-faint">
                    {count} {count === 1 ? "item" : "items"}
                </span>
            )}
        </div>
    );
}

/**
 * MentalAcceleratorCard - Launcher for the Flash Anzan practice tool.
 */
function MentalAcceleratorCard({ onLaunch }) {
    return (
        <Card surface="alt" className="flex flex-col p-5">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-aba-md bg-aba-coral text-white shadow-aba-coral">
                    <Zap className="h-6 w-6 fill-current" />
                </span>
                <div>
                    <h3 className="font-display text-xl font-black text-aba-ink">Mental Accelerator</h3>
                    <p className="text-xs font-black uppercase tracking-wide text-aba-coral">Flash Anzan</p>
                </div>
            </div>
            <p className="mt-3 flex-1 text-sm font-semibold text-aba-ink-soft">
                Numbers flash on the screen one at a time. Add and subtract them in your head, then type the total. Speed up your mental math!
            </p>
            <button
                type="button"
                onClick={onLaunch}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-aba-sm bg-aba-coral px-5 py-3 font-black text-white shadow-aba-coral transition hover:bg-aba-coral-dark focus:outline-none focus:ring-2 focus:ring-aba-coral focus:ring-offset-2"
            >
                <Zap className="h-4 w-4 fill-current" /> Start Practice
            </button>
        </Card>
    );
}

/**
 * AbacusCard - Launcher for the abacus simulator.
 */
function AbacusCard({ onLaunch }) {
    return (
        <Card className="flex flex-col p-5">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-aba-md bg-aba-blue-soft text-aba-blue">
                    <Calculator className="h-6 w-6" />
                </span>
                <div>
                    <h3 className="font-display text-xl font-black text-aba-ink">Abacus Simulator</h3>
                    <p className="text-xs font-black uppercase tracking-wide text-aba-blue">Practice tool</p>
                </div>
            </div>
            <p className="mt-3 flex-1 text-sm font-semibold text-aba-ink-soft">
                Slide the beads on a virtual abacus to practice your technique any time you want.
            </p>
            <button
                type="button"
                onClick={onLaunch}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-aba-sm bg-aba-blue px-5 py-3 font-black text-white shadow-aba-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-aba-blue focus:ring-offset-2"
            >
                <Calculator className="h-4 w-4" /> Open Abacus
            </button>
        </Card>
    );
}

/**
 * PracticeResourceList - Practice messages and files shared by the mentor.
 */
function PracticeResourceList({ resources }) {
    if (!resources.length) {
        return (
            <Card className="p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-aba-blue-soft text-aba-blue">
                        <MessageSquare className="h-6 w-6" />
                    </span>
                    <p className="text-lg font-black text-aba-ink">Nothing to practice yet</p>
                    <p className="text-sm font-semibold text-aba-ink-soft">
                        When your mentor shares practice tips or worksheets, they'll show up here.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {resources.map((resource) => (
                <Card key={resource.id} className="p-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-aba-sm bg-aba-coral-soft text-aba-coral">
                            <Dumbbell className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-display text-lg font-black text-aba-ink">{resource.title}</h3>
                            {resource.message && (
                                <p className="mt-1 whitespace-pre-line text-sm font-semibold text-aba-ink-soft">
                                    {resource.message}
                                </p>
                            )}
                            {resource.has_file && (
                                <a
                                    href={resource.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-2 rounded-aba-sm border border-aba-line bg-aba-surface px-4 py-2.5 text-sm font-black text-aba-blue transition hover:border-aba-blue"
                                >
                                    {resource.is_pdf ? <FileText className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
                                    {resource.file_name || "Open attachment"}
                                </a>
                            )}
                            <p className="mt-2 text-xs font-bold text-aba-ink-faint">
                                {resource.mentor_name ? `From ${resource.mentor_name}` : "From your mentor"} · {resource.created_at}
                            </p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

/**
 * EmptyState - Shown when the student has no active program.
 */
function EmptyState() {
    return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-aba-coral-soft text-aba-coral">
                <Zap className="h-7 w-7" />
            </span>
            <h1 className="font-display text-2xl font-black text-aba-ink">No practice yet</h1>
            <p className="mt-2 text-sm font-semibold text-aba-ink-soft">
                Enroll in a program to unlock practice tools.
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
