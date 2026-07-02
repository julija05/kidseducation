import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link } from "@inertiajs/react";
import { useMemo } from "react";
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    LayoutDashboard,
    TrendingUp,
    UserCheck,
    UserX,
    Users,
} from "lucide-react";

const formatTime = (value) => {
    if (!value) return "Not scheduled";

    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
};

const formatSessionDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    }

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
    }).format(date);
};

const todayLabel = () => new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
}).format(new Date());

const numericProgress = (value) => {
    if (value === null || value === undefined || value === "") return null;

    const progress = Number(value);
    return Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : null;
};

const studentInitials = (name) => String(name || "Student")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const attendanceActivityStyle = (status) => {
    const normalizedStatus = String(status || "").toLowerCase().replaceAll(" ", "_");

    if (["attended", "present"].includes(normalizedStatus)) {
        return { icon: UserCheck, classes: "bg-emerald-100 text-emerald-600" };
    }

    if (normalizedStatus === "late") {
        return { icon: Clock, classes: "bg-amber-100 text-amber-600" };
    }

    if (["excused", "caught_up", "caught_up_later"].includes(normalizedStatus)) {
        return { icon: CheckCircle2, classes: "bg-blue-100 text-blue-600" };
    }

    return { icon: UserX, classes: "bg-red-100 text-red-600" };
};

export default function Dashboard({
    user,
    enrollments = [],
    pendingEnrollments = [],
    allStudents = [],
    upcomingMeetings = [],
    activeGroups = [],
    attendanceSummary = {},
}) {
    const activeStudents = useMemo(() => allStudents.filter((student) =>
        !student.status || student.status === "active"
    ), [allStudents]);

    // TODO: Replace these presentation thresholds with backend-defined intervention rules when available.
    const attentionStudents = useMemo(() => activeStudents
        .map((student) => {
            const progress = numericProgress(student.progress);
            const attendanceRate = student.meeting_attendance?.attendance_rate;
            const reasons = [];

            if (attendanceRate !== null && attendanceRate !== undefined && Number(attendanceRate) < 75) {
                reasons.push(`Attendance is ${attendanceRate}%`);
            }

            if (progress !== null && progress < 40) {
                reasons.push(`Progress is ${Math.round(progress)}%`);
            }

            return {
                ...student,
                reasons,
                severity: (attendanceRate !== null && attendanceRate !== undefined && Number(attendanceRate) < 50)
                    || (progress !== null && progress < 20)
                    ? "danger"
                    : "warning",
            };
        })
        .filter((student) => student.reasons.length > 0)
        .sort((a, b) => (a.severity === "danger" ? -1 : 1) - (b.severity === "danger" ? -1 : 1)), [activeStudents]);

    const groupRows = useMemo(() => activeGroups.map((group) => {
        const groupStudents = activeStudents.filter((student) =>
            student.groups?.some((studentGroup) => String(studentGroup.id) === String(group.id))
        );
        const trackedProgress = groupStudents
            .map((student) => numericProgress(student.progress))
            .filter((progress) => progress !== null);
        const averageProgress = trackedProgress.length
            ? Math.round(trackedProgress.reduce((sum, progress) => sum + progress, 0) / trackedProgress.length)
            : null;

        return { ...group, averageProgress };
    }), [activeGroups, activeStudents]);

    const recentAttendance = attendanceSummary.recent_records || [];
    const visibleRecentAttendance = recentAttendance.slice(0, 6);

    return (
        <MentorLayout>
            <Head title="Mentor Dashboard" />

            <div className="-mx-4 -my-6 bg-slate-50 sm:-mx-6 lg:-mx-8">
                <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-blue-600">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                </span>
                                Mentor overview
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                                Welcome back, {user.name} 👋
                            </h1>
                            <p className="mt-2 text-sm text-slate-600 sm:text-base">
                                Here is what needs your attention today.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span>{todayLabel()}</span>
                            </div>
                            <Link
                                href={route("mentor.meetings.create")}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Calendar className="h-4 w-4" />
                                Schedule session
                            </Link>
                        </div>
                    </header>

                    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4" aria-label="Mentor dashboard metrics">
                        <Metric icon={Users} label="Active Students" value={activeStudents.length} description="Across assigned programs" tone="blue" />
                        <Metric icon={Calendar} label="Upcoming Sessions" value={upcomingMeetings.length} description="Scheduled mentor meetings" tone="emerald" />
                        <Metric icon={AlertTriangle} label="Students Needing Attention" value={attentionStudents.length} description="Progress or attendance flags" tone="red" />
                        <Metric icon={FileText} label="Pending Reviews" value={pendingEnrollments.length} description="Teaching applications awaiting review" tone="amber" />
                    </section>

                    <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <Panel
                            icon={Calendar}
                            title="Today's Sessions"
                            subtitle="Your next scheduled mentor meetings."
                            action={(
                                <Link
                                    href={route("mentor.meetings.index")}
                                    className="inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                    View schedule
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        >
                            {upcomingMeetings.length > 0 ? (
                                <div className="max-h-[340px] divide-y divide-slate-100 overflow-y-auto px-3">
                                    {upcomingMeetings.map((meeting) => (
                                        <div key={meeting.id} className="grid gap-4 px-2 py-3 transition hover:bg-slate-50/80 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center">
                                            <div className="rounded-xl bg-blue-50 px-3 py-2.5 text-center">
                                                <p className="text-lg font-bold text-blue-700">{formatTime(meeting.scheduled_at)}</p>
                                                <p className="mt-0.5 text-xs font-semibold text-blue-600">{formatSessionDate(meeting.scheduled_at)}</p>
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900">{meeting.title}</p>
                                                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Users className="h-4 w-4" />
                                                        {meeting.participants_count || 0} student{meeting.participants_count === 1 ? "" : "s"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4" />
                                                        {meeting.duration_minutes} min
                                                    </span>
                                                    <span className="capitalize">{meeting.meeting_type || "Session"}</span>
                                                </div>
                                            </div>

                                            <Link
                                                href={route("mentor.meetings.show", meeting.id)}
                                                className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                            >
                                                View session
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Calendar}
                                    title="No upcoming sessions"
                                    text="Schedule a mentor meeting when you are ready to meet with students."
                                    actionHref={route("mentor.meetings.create")}
                                    actionLabel="Schedule session"
                                />
                            )}
                        </Panel>

                        <Panel
                            icon={AlertTriangle}
                            title="Students Needing Attention"
                            subtitle="Based on current progress and attendance."
                        >
                            {attentionStudents.length > 0 ? (
                                <div className="max-h-[340px] divide-y divide-slate-100 overflow-y-auto">
                                    {attentionStudents.slice(0, 6).map((student) => (
                                        <div key={student.id} className="px-5 py-3.5 transition hover:bg-slate-50/80">
                                            <div className="flex items-center gap-3.5">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 ring-1 ring-slate-200">
                                                    {studentInitials(student.name)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-semibold text-slate-900">{student.name}</p>
                                                    <p className="mt-1 truncate text-xs text-slate-500">
                                                        {student.program_name || "Program not assigned"}
                                                    </p>
                                                    <GroupChips groups={student.groups || []} />
                                                    <p className={`mt-2 text-xs font-medium leading-5 ${student.severity === "danger" ? "text-red-500" : "text-amber-600"}`}>
                                                        {student.reasons.join(" · ")}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${student.severity === "danger" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}
                                                    title="Support needed"
                                                >
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={CheckCircle2}
                                    title="No attention alerts"
                                    text="All tracked students are currently above the dashboard attention thresholds."
                                />
                            )}
                        </Panel>
                    </section>

                    <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <Panel
                            icon={Users}
                            title="Group Overview"
                            subtitle="Active teaching groups and their current progress."
                            action={(
                                <Link
                                    href={route("mentor.learning-groups.index")}
                                    className="inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                    View all groups
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        >
                            {groupRows.length > 0 ? (
                                <div className="overflow-x-auto overscroll-x-contain">
                                    <table className="w-full min-w-[760px] table-fixed divide-y divide-slate-200 lg:min-w-0">
                                        <colgroup>
                                            <col className="w-[18%]" />
                                            <col className="w-[16%]" />
                                            <col className="w-[10%]" />
                                            <col className="w-[16%]" />
                                            <col className="w-[18%]" />
                                            <col className="w-[11%]" />
                                            <col className="w-[11%]" />
                                        </colgroup>
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <TableHead>Group</TableHead>
                                                <TableHead>Program</TableHead>
                                                <TableHead>Students</TableHead>
                                                <TableHead>Current lesson</TableHead>
                                                <TableHead>Avg. progress</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead><span className="sr-only">Action</span></TableHead>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {groupRows.map((group) => (
                                                <tr key={group.id} className="transition hover:bg-blue-50/40">
                                                    <td className="px-3 py-4">
                                                        <p className="break-words font-semibold text-slate-900">{group.name}</p>
                                                        {group.next_live_class && (
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Next: {group.next_live_class.date} at {group.next_live_class.time}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="break-words px-3 py-4 text-sm text-slate-600">
                                                        {group.program?.name || "Not assigned"}
                                                    </td>
                                                    <td className="px-3 py-4 text-sm font-medium text-slate-700">
                                                        {group.students_count}/{group.max_students}
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-slate-500">Not tracked yet</td>
                                                    <td className="px-3 py-4">
                                                        {group.averageProgress === null ? (
                                                            <span className="text-sm text-slate-500">Not tracked yet</span>
                                                        ) : (
                                                            <div className="w-full min-w-20 max-w-32">
                                                                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                                                                    <span>Progress</span>
                                                                    <span>{group.averageProgress}%</span>
                                                                </div>
                                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/60">
                                                                    <div
                                                                        className="h-full rounded-full bg-blue-600"
                                                                        style={{ width: `${group.averageProgress}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            Active
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-4 text-right">
                                                        <Link
                                                            href={route("mentor.learning-groups.show", group.id)}
                                                            className="inline-flex min-h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                                                        >
                                                            Open
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Users}
                                    title="No active groups"
                                    text="Active learning groups will appear here once they are created."
                                    actionHref={route("mentor.learning-groups.index")}
                                    actionLabel="View groups"
                                />
                            )}
                        </Panel>

                        <Panel
                            icon={Activity}
                            title="Recent Activity"
                            subtitle="Latest recorded attendance across your students."
                            action={(
                                <Link
                                    href={route("mentor.meetings.index")}
                                    className="inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                    View all
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        >
                            {visibleRecentAttendance.length > 0 ? (
                                <div className="p-5">
                                    {visibleRecentAttendance.map((record, index) => {
                                        const activityStyle = attendanceActivityStyle(record.status);
                                        const ActivityIcon = activityStyle.icon;

                                        return (
                                            <div key={record.id} className="relative flex gap-4 pb-5 last:pb-0">
                                                <div className="relative flex w-10 shrink-0 justify-center">
                                                    {index < visibleRecentAttendance.length - 1 && (
                                                        <span className="absolute bottom-[-1.25rem] top-9 w-px bg-slate-200" />
                                                    )}
                                                    <div className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white shadow-sm ${activityStyle.classes}`}>
                                                        <ActivityIcon className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-0.5">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                                {record.student_name} was marked {record.status_label?.toLowerCase() || record.status}
                                                            </p>
                                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                                {record.meeting_title}{record.group_name ? ` · ${record.group_name}` : ""}
                                                            </p>
                                                        </div>
                                                        <span className="shrink-0 text-xs font-medium text-slate-400">{record.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <>
                                    {/* TODO: Replace this empty state when a general mentor activity feed is available. */}
                                    <EmptyState
                                        icon={Activity}
                                        title="No recent activity yet"
                                        text="Student progress and submissions will appear here."
                                    />
                                </>
                            )}
                        </Panel>
                    </section>

                    <section className="border-t border-slate-200 pt-6" aria-label="Additional mentor insights">
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-400">ADDITIONAL INSIGHTS</p>
                        </div>
                        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                            <Panel secondary icon={UserCheck} title="Attendance Snapshot" subtitle="Recorded meeting attendance.">
                                <div className="grid grid-cols-2 gap-3 p-5">
                                    <AttendanceStat
                                        label="Attendance rate"
                                        value={attendanceSummary.attendance_rate == null ? "—" : `${attendanceSummary.attendance_rate}%`}
                                        tone="blue"
                                    />
                                    <AttendanceStat label="Records" value={attendanceSummary.total_records || 0} />
                                    <AttendanceStat label="Present" value={attendanceSummary.attended_count || 0} tone="emerald" />
                                    <AttendanceStat label="Absent" value={attendanceSummary.missed_count || 0} tone="red" />
                                </div>
                            </Panel>

                            <Panel secondary icon={BookOpen} title="Teaching Programs" subtitle="Programs currently assigned to your mentor account.">
                                {enrollments.length > 0 ? (
                                    <div className="grid gap-3 p-5 sm:grid-cols-2">
                                        {enrollments.map((enrollment) => (
                                            <Link
                                                key={enrollment.id}
                                                href={route("mentor.programs.show", enrollment.program.slug)}
                                                className="group rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-slate-200">
                                                        <BookOpen className="h-4 w-4" />
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-blue-600" />
                                                </div>
                                                <h3 className="mt-3 truncate text-sm font-semibold text-slate-900">{enrollment.program.name}</h3>
                                                <div className="mt-3 flex items-center gap-5">
                                                    <ProgramStat icon={Users} label="Students" value={enrollment.students_count || 0} />
                                                    <ProgramStat icon={TrendingUp} label="Progress" value={`${enrollment.average_progress || 0}%`} />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={BookOpen}
                                        title="No teaching programs"
                                        text="Approved teaching programs will appear here."
                                        actionHref={route("mentor.proposals.programs.my-programs")}
                                        actionLabel="View programs"
                                    />
                                )}
                            </Panel>
                        </div>
                    </section>
                </div>
            </div>
        </MentorLayout>
    );
}

function AttendanceStat({ label, value, tone = "slate" }) {
    const tones = {
        slate: "bg-slate-50 text-slate-900",
        blue: "bg-blue-50 text-blue-700",
        emerald: "bg-emerald-50 text-emerald-700",
        red: "bg-red-50 text-red-700",
    };

    return (
        <div className={`rounded-xl p-3 ${tones[tone] || tones.slate}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs font-semibold opacity-70">{label}</p>
        </div>
    );
}

function Metric({ icon: Icon, label, value, description, tone = "slate" }) {
    const tones = {
        slate: "bg-slate-100 text-slate-700 ring-slate-50",
        blue: "bg-blue-100 text-blue-600 ring-blue-50",
        emerald: "bg-emerald-100 text-emerald-600 ring-emerald-50",
        amber: "bg-amber-100 text-amber-600 ring-amber-50",
        red: "bg-red-100 text-red-600 ring-red-50",
    };

    return (
        <div className="h-full min-h-[140px] rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.4)]">
            <div className="flex h-full items-center justify-between gap-5">
                <div className="min-w-0 flex-1">
                    <p className="min-h-10 text-sm font-semibold leading-5 text-slate-600">{label}</p>
                    <p className="text-[40px] font-bold leading-none text-slate-900">{value}</p>
                    {description && <p className="mt-2 text-xs font-medium text-slate-400">{description}</p>}
                </div>
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-8 ${tones[tone] || tones.slate}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

function Panel({ icon: Icon, title, subtitle, action, children, secondary = false }) {
    return (
        <section className={`overflow-hidden rounded-2xl border border-slate-200 ${secondary ? "bg-white/80 shadow-sm" : "bg-white shadow-[0_16px_36px_-28px_rgba(15,23,42,0.4)]"}`}>
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    {Icon && (
                        <span className={`flex shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ${secondary ? "h-9 w-9" : "h-10 w-10"}`}>
                            <Icon className={secondary ? "h-4 w-4" : "h-5 w-5"} />
                        </span>
                    )}
                    <div className="min-w-0">
                        <h2 className={`${secondary ? "text-base" : "text-lg"} font-bold text-slate-900`}>{title}</h2>
                        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                    </div>
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
        <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold text-slate-500 lg:whitespace-normal">
            {children}
        </th>
    );
}

function GroupChips({ groups }) {
    if (!groups.length) {
        return <p className="mt-1 text-xs text-slate-400">No active group</p>;
    }

    return (
        <div className="mt-2 flex flex-wrap gap-1">
            {groups.slice(0, 2).map((group) => (
                <span
                    key={group.id}
                    className="inline-flex max-w-full rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                >
                    <span className="truncate">{group.name}</span>
                </span>
            ))}
        </div>
    );
}

function EmptyState({ icon: Icon, title, text, actionHref, actionLabel }) {
    return (
        <div className="px-6 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{text}</p>
            {actionHref && actionLabel && (
                <Link
                    href={actionHref}
                    className="mt-4 inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                    {actionLabel}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}
