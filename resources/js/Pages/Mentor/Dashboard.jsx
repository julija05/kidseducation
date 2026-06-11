import AbacusSimulator from "@/Components/AbacusSimulator";
import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Calculator,
    CheckCircle2,
    Clock,
    Copy,
    FileText,
    Link as LinkIcon,
    Plus,
    Search,
    TrendingUp,
    Users,
} from "lucide-react";

const formatDateTime = (value) => {
    if (!value) return "Not scheduled";

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
};

const progressTone = (progress) => {
    if (progress >= 75) return "bg-emerald-500";
    if (progress >= 40) return "bg-blue-500";
    return "bg-amber-500";
};

export default function Dashboard({
    user,
    availablePrograms = [],
    enrollments = [],
    pendingEnrollments = [],
    allStudents = [],
    invitationUrl,
    referralCode,
    referredStudentsCount = 0,
    upcomingMeetings = [],
    canUseAbacus = false,
}) {
    const [copied, setCopied] = useState(false);
    const [studentSearch, setStudentSearch] = useState("");
    const [showAbacus, setShowAbacus] = useState(false);

    const totalStudents = enrollments.reduce((sum, enrollment) => sum + (enrollment.students_count || 0), 0);
    const averageProgress = enrollments.length
        ? Math.round(enrollments.reduce((sum, enrollment) => sum + (enrollment.average_progress || 0), 0) / enrollments.length)
        : 0;

    const filteredStudents = useMemo(() => {
        const query = studentSearch.trim().toLowerCase();
        if (!query) return allStudents;

        return allStudents.filter((student) =>
            student.name?.toLowerCase().includes(query) ||
            student.email?.toLowerCase().includes(query) ||
            student.program_name?.toLowerCase().includes(query)
        );
    }, [allStudents, studentSearch]);

    const nextMeeting = upcomingMeetings[0] || null;

    const copyInvitationLink = () => {
        if (!invitationUrl) return;

        navigator.clipboard.writeText(invitationUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const handleApplyToTeach = (programSlug) => {
        router.post(route("mentor.apply", programSlug), {}, { preserveScroll: true });
    };

    const handleCancelApplication = (enrollmentId) => {
        if (confirm("Cancel this teaching application?")) {
            router.post(route("mentor.applications.cancel", enrollmentId), {}, { preserveScroll: true });
        }
    };

    return (
        <MentorLayout>
            <Head title="Mentor Dashboard" />

            <div className="space-y-6">
                <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Mentor workspace</p>
                                <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                                    Welcome back, {user.name}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                    Review student progress, schedule classes, and manage the programs you teach from one place.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href={route("mentor.meetings.create")}
                                    className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Schedule meeting
                                </Link>
                                <Link
                                    href={route("mentor.proposals.programs.create")}
                                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                >
                                    <Plus className="h-4 w-4" />
                                    New program
                                </Link>
                                {canUseAbacus && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAbacus(true)}
                                        className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                                    >
                                        <Calculator className="h-4 w-4" />
                                        Open abacus
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Metric icon={BookOpen} label="Teaching programs" value={enrollments.length} />
                            <Metric icon={Users} label="Assigned students" value={totalStudents} tone="blue" />
                            <Metric icon={TrendingUp} label="Average progress" value={`${averageProgress}%`} tone="emerald" />
                            <Metric icon={Clock} label="Pending applications" value={pendingEnrollments.length} tone="amber" />
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Next meeting</p>
                                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                                    {nextMeeting ? nextMeeting.title : "Nothing scheduled"}
                                </h2>
                            </div>
                            <Calendar className="h-5 w-5 text-slate-400" />
                        </div>

                        {nextMeeting ? (
                            <div className="mt-4 space-y-3">
                                <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                                    <p className="font-medium text-slate-950">{formatDateTime(nextMeeting.scheduled_at)}</p>
                                    <p className="mt-1">
                                        {nextMeeting.duration_minutes} min with {nextMeeting.participants_count} student
                                        {nextMeeting.participants_count === 1 ? "" : "s"}
                                    </p>
                                </div>
                                <Link
                                    href={route("mentor.meetings.show", nextMeeting.id)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                >
                                    Open meeting
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <p className="text-sm text-slate-600">Create a class time for one student or a small group.</p>
                                <Link
                                    href={route("mentor.meetings.create")}
                                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Schedule now
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <Panel
                            title="Teaching programs"
                            subtitle="Open a program to manage lessons, resources, and assigned students."
                            action={
                                <Link
                                    href={route("mentor.proposals.programs.my-programs")}
                                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                >
                                    <FileText className="h-4 w-4" />
                                    Proposed programs
                                </Link>
                            }
                        >
                            {enrollments.length ? (
                                <div className="divide-y divide-slate-200">
                                    {enrollments.map((enrollment) => (
                                        <Link
                                            key={enrollment.id}
                                            href={route("mentor.programs.show", enrollment.program.slug)}
                                            className="grid gap-4 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1fr_140px_140px_120px]"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-950">{enrollment.program.name}</p>
                                                <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                                                    {enrollment.program.description || "No description added yet."}
                                                </p>
                                            </div>
                                            <ProgramStat icon={Users} label="Students" value={enrollment.students_count || 0} />
                                            <ProgramStat icon={TrendingUp} label="Progress" value={`${enrollment.average_progress || 0}%`} />
                                            <div className="flex items-center justify-start md:justify-end">
                                                <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                                                    Open
                                                    <ArrowRight className="h-4 w-4" />
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={BookOpen}
                                    title="No active teaching programs"
                                    text="Apply to teach an available program or submit a new program proposal."
                                />
                            )}
                        </Panel>

                        <Panel
                            title="My students"
                            subtitle="Students are filtered to your mentorship assignments."
                            action={
                                <div className="relative w-full sm:w-72">
                                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="search"
                                        value={studentSearch}
                                        onChange={(event) => setStudentSearch(event.target.value)}
                                        placeholder="Search students"
                                        className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-slate-500 focus:ring-slate-500"
                                    />
                                </div>
                            }
                        >
                            {filteredStudents.length ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Program</TableHead>
                                                <TableHead>Progress</TableHead>
                                                <TableHead>Points</TableHead>
                                                <TableHead>Level</TableHead>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {filteredStudents.slice(0, 12).map((student) => (
                                                <tr key={`${student.id}-${student.program_slug}`} className="hover:bg-slate-50">
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
                                                                {student.name?.charAt(0)?.toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-950">{student.name}</p>
                                                                <p className="text-xs text-slate-500">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{student.program_name}</td>
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <div className="flex min-w-36 items-center gap-3">
                                                            <div className="h-2 flex-1 rounded-full bg-slate-200">
                                                                <div
                                                                    className={`h-2 rounded-full ${progressTone(student.progress || 0)}`}
                                                                    style={{ width: `${Math.min(student.progress || 0, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="w-10 text-right text-sm font-semibold text-slate-800">
                                                                {Math.round(student.progress || 0)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                                                        {student.quiz_points || 0}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                                                        {student.highest_unlocked_level || 1}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredStudents.length > 12 && (
                                        <p className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
                                            Showing 12 of {filteredStudents.length} students. Use search to narrow the list.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Users}
                                    title="No students found"
                                    text={studentSearch ? "Try a different search term." : "Assigned students will appear here after enrollments are approved."}
                                />
                            )}
                        </Panel>
                    </div>

                    <aside className="space-y-6">
                        {invitationUrl && (
                            <Panel title="Invitation link" subtitle="Share this with families to enroll under your mentorship.">
                                <div className="space-y-4 p-5">
                                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                                            <LinkIcon className="h-3.5 w-3.5" />
                                            Link
                                        </div>
                                        <p className="break-all font-mono text-xs text-slate-700">{invitationUrl}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={copyInvitationLink}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                    >
                                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? "Copied" : "Copy invitation"}
                                    </button>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <InfoPill label="Code" value={referralCode || "-"} />
                                        <InfoPill label="Referrals" value={referredStudentsCount} />
                                    </div>
                                </div>
                            </Panel>
                        )}

                        {pendingEnrollments.length > 0 && (
                            <Panel title="Pending applications" subtitle="Waiting for admin review.">
                                <div className="divide-y divide-slate-200">
                                    {pendingEnrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="p-5">
                                            <p className="font-semibold text-slate-950">{enrollment.program.name}</p>
                                            <p className="mt-1 text-sm text-slate-500">Submitted for approval</p>
                                            <button
                                                type="button"
                                                onClick={() => handleCancelApplication(enrollment.id)}
                                                className="mt-3 text-sm font-semibold text-red-700 hover:text-red-800"
                                            >
                                                Cancel application
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        )}

                        {canUseAbacus && (
                            <Panel title="Mental arithmetic" subtitle="Use the simulator during live instruction.">
                                <div className="p-5">
                                    <button
                                        type="button"
                                        onClick={() => setShowAbacus(true)}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                                    >
                                        <Calculator className="h-4 w-4" />
                                        Open abacus simulator
                                    </button>
                                </div>
                            </Panel>
                        )}
                    </aside>
                </section>

                <Panel title="Explore programs" subtitle="Apply to teach more subjects when your schedule allows.">
                    {availablePrograms.length ? (
                        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                            {availablePrograms.map((program) => {
                                const isEnrolled = enrollments.some((enrollment) => enrollment.program.id === program.id);
                                const isPending = pendingEnrollments.some((enrollment) => enrollment.program.id === program.id);

                                return (
                                    <div key={program.id} className="rounded-lg border border-slate-200 bg-white p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-slate-950">{program.name}</p>
                                                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{program.description}</p>
                                                <p className="mt-2 text-xs font-medium text-slate-500">{program.lessons_count} lessons</p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            {isEnrolled ? (
                                                <Link
                                                    href={route("mentor.programs.show", program.slug)}
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                                >
                                                    Open dashboard
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            ) : isPending ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700"
                                                >
                                                    <Clock className="h-4 w-4" />
                                                    Pending approval
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleApplyToTeach(program.slug)}
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                                >
                                                    Apply to teach
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState icon={BookOpen} title="No programs available" text="Available programs will appear here." />
                    )}
                </Panel>
            </div>

            <AbacusSimulator isOpen={showAbacus} onClose={() => setShowAbacus(false)} />
        </MentorLayout>
    );
}

function Metric({ icon: Icon, label, value, tone = "slate" }) {
    const tones = {
        slate: "bg-slate-50 text-slate-700",
        blue: "bg-blue-50 text-blue-700",
        emerald: "bg-emerald-50 text-emerald-700",
        amber: "bg-amber-50 text-amber-700",
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function Panel({ title, subtitle, action, children }) {
    return (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-950">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function ProgramStat({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-slate-400" />
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-semibold text-slate-900">{value}</p>
            </div>
        </div>
    );
}

function TableHead({ children }) {
    return (
        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            {children}
        </th>
    );
}

function InfoPill({ label, value }) {
    return (
        <div className="rounded-md border border-slate-200 bg-white p-3">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 truncate font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function EmptyState({ icon: Icon, title, text }) {
    return (
        <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{text}</p>
        </div>
    );
}
