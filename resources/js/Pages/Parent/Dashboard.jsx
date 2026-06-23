import ParentLayout from "@/Layouts/ParentLayout";
import { Head, Link } from "@inertiajs/react";
import {
    AlertTriangle,
    BarChart3,
    BookOpen,
    CalendarClock,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    ExternalLink,
    GraduationCap,
    FileText,
    ListChecks,
    MessageSquareText,
    Plus,
    RefreshCcw,
    Users,
} from "lucide-react";

const statusTone = (status) => {
    const tones = {
        pending: "bg-amber-50 text-amber-700 ring-amber-200",
        approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        rejected: "bg-red-50 text-red-700 ring-red-200",
        waitlist: "bg-blue-50 text-blue-700 ring-blue-200",
    };

    return tones[status] || "bg-slate-50 text-slate-700 ring-slate-200";
};

const statusLabel = (status) => {
    const labels = {
        pending: "Waiting for approval",
        approved: "Approved",
        active: "Active",
        rejected: "Rejected",
        waitlist: "Waitlist",
    };

    return labels[status] || status || "Waiting for approval";
};

const display = (value) => value || "Not available yet";

export default function Dashboard({ childCards = [], children = [], childProfiles = [] }) {
    const averageProgress = childCards.length
        ? Math.round(childCards.reduce((sum, child) => sum + (child.progress || 0), 0) / childCards.length)
        : 0;

    return (
        <ParentLayout>
            <Head title="Parent Dashboard" />

            <div className="space-y-6">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Parent dashboard</p>
                            <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                                Children overview
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                Track each child application, program access, live classes, homework, and mentor updates.
                            </p>
                        </div>
                        <Link
                            href={route("parent.child-profiles.create")}
                            className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <Plus className="h-4 w-4" />
                            Register child
                        </Link>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <Metric icon={Users} label="Children" value={childCards.length || children.length || childProfiles.length} />
                        <Metric icon={BookOpen} label="Applications" value={childProfiles.length} tone="blue" />
                        <Metric icon={BarChart3} label="Average progress" value={`${averageProgress}%`} tone="emerald" />
                    </div>
                </section>

                {childCards.length ? (
                    <section className="grid gap-4 xl:grid-cols-2">
                        {childCards.map((child) => (
                            <ChildCard key={`${child.id}-${child.child_id || "profile"}`} child={child} />
                        ))}
                    </section>
                ) : (
                    <section className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Users className="h-6 w-6" />
                        </div>
                        <h2 className="mt-4 text-base font-semibold text-slate-950">No children registered yet</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                            Register a child to create their learner account and start the approval process.
                        </p>
                    </section>
                )}
            </div>
        </ParentLayout>
    );
}

function ChildCard({ child }) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">Child</p>
                    <h2 className="mt-1 truncate text-xl font-semibold text-slate-950">{child.name}</h2>
                    {child.username && (
                        <p className="mt-1 font-mono text-xs text-slate-500">{child.username}</p>
                    )}
                </div>
                <span className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusTone(child.application_status)}`}>
                    {statusLabel(child.application_status)}
                </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoItem icon={BookOpen} label="Current program" value={child.current_program?.name} />
                <InfoItem icon={Users} label="Group name" value={child.group_name} />
            </div>

            <NextClassPanel nextClass={child.next_live_class} />
            <HomeworkPanel homework={child.homework} fallbackStatus={child.homework_status} />

            <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-600">Progress</span>
                    <span className="text-sm font-semibold text-slate-950">{Math.round(child.progress || 0)}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(Math.max(child.progress || 0, 0), 100)}%` }}
                    />
                </div>
            </div>

            <div className="mt-5 grid gap-3">
                {child.rejection_note && (
                    <RejectionNotice value={child.rejection_note} />
                )}
                <TextBlock icon={MessageSquareText} label="Latest mentor note" value={child.latest_mentor_note} />
                <WeeklyReportSummary
                    report={child.latest_weekly_learning_report}
                    legacyReport={child.latest_weekly_report}
                />
            </div>

            {(child.generated_password || child.username) && (
                <div className="mt-5 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-2">
                    <Credential label="Username" value={child.username} />
                    <Credential label="Password" value={child.generated_password} />
                </div>
            )}

            {child.detail_url_child_id && (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                    {child.learning_dashboard_child_id && (
                        <Link
                            href={route("parent.children.learning-dashboard", child.learning_dashboard_child_id)}
                            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <GraduationCap className="h-4 w-4" />
                            Learning dashboard
                        </Link>
                    )}
                    <Link
                        href={route("parent.children.show", child.detail_url_child_id)}
                        className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Open child details
                    </Link>
                </div>
            )}

            {child.reregister_profile_id && (
                <div className="mt-5 border-t border-slate-200 pt-4">
                    <Link
                        href={route("parent.child-profiles.create", { reregister: child.reregister_profile_id })}
                        className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Register again
                    </Link>
                </div>
            )}
        </article>
    );
}

function HomeworkPanel({ homework, fallbackStatus }) {
    if (!homework) {
        return (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ClipboardCheck className="h-4 w-4" />
                    Current homework
                </div>
                <p className="mt-2 text-sm text-slate-500">{display(fallbackStatus)}</p>
            </div>
        );
    }

    const completed = homework.is_completed === true;
    const notCompleted = homework.is_completed === false;
    const statusLabel = homework.status || (completed ? "Completed" : notCompleted ? "Not completed" : null);
    const statusClass = completed
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : notCompleted
            ? "bg-amber-50 text-amber-700 ring-amber-200"
            : "bg-slate-50 text-slate-700 ring-slate-200";

    return (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                        <ClipboardCheck className="h-4 w-4" />
                        Current homework
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-slate-950">
                        {display(homework.current)}
                    </h3>
                    {homework.instructions && (
                        <p className="mt-1 text-sm leading-5 text-slate-600">{homework.instructions}</p>
                    )}
                </div>

                {statusLabel && (
                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass}`}>
                        {completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
                        {statusLabel}
                    </span>
                )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <ClassMeta icon={Clock} label="Practice time" value={homework.estimated_practice_time} />
                <ClassMeta icon={CalendarClock} label="Due date" value={homework.due_date} />
                <ClassMeta icon={AlertTriangle} label="Needs help" value={homework.needs_help ? "Yes" : "No"} />
            </div>

            {(homework.group || homework.lesson || homework.live_session) && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <ClassMeta icon={Users} label="Group" value={homework.group?.name} />
                    <ClassMeta icon={BookOpen} label="Lesson" value={homework.lesson?.title} />
                    <ClassMeta icon={CalendarClock} label="Live session" value={homework.live_session?.date} />
                </div>
            )}

            {homework.needs_help && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
                    This child requested help with the current homework.
                </div>
            )}
        </div>
    );
}

function NextClassPanel({ nextClass }) {
    if (!nextClass) {
        return (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CalendarClock className="h-4 w-4" />
                    Next live class
                </div>
                <p className="mt-2 text-sm text-slate-500">No upcoming class scheduled yet.</p>
            </div>
        );
    }

    const checklist = nextClass.preparation_checklist || [];

    return (
        <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                        <CalendarClock className="h-4 w-4" />
                        Next live class
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-slate-950">
                        {display(nextClass.topic || nextClass.title)}
                    </h3>
                    {nextClass.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{nextClass.description}</p>
                    )}
                </div>

                {nextClass.meeting_link && (
                    <a
                        href={nextClass.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-fit items-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Join class
                    </a>
                )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <ClassMeta icon={CalendarClock} label="Date" value={nextClass.date} />
                <ClassMeta icon={Clock} label="Time" value={nextClass.time} />
                <ClassMeta icon={Users} label="Group" value={nextClass.group} />
            </div>

            <div className="mt-4 rounded-md border border-blue-100 bg-white p-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <ListChecks className="h-3.5 w-3.5" />
                    Preparation checklist
                </div>

                {checklist.length ? (
                    <ul className="mt-3 space-y-2">
                        {checklist.map((item, index) => (
                            <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-slate-700">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-2 text-sm text-slate-500">No preparation items added yet.</p>
                )}
            </div>
        </div>
    );
}

function ClassMeta({ icon: Icon, label, value }) {
    return (
        <div className="rounded-md border border-blue-100 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-950">{display(value)}</p>
        </div>
    );
}

function RejectionNotice({ value }) {
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm ring-1 ring-red-100">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                </span>
                <div>
                    <p className="text-sm font-semibold text-red-900">Rejection note</p>
                    <p className="mt-1 line-clamp-4 text-sm leading-6 text-red-800">{value}</p>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-950">{display(value)}</p>
        </div>
    );
}

function TextBlock({ icon: Icon, label, value }) {
    return (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className="mt-1 line-clamp-3 text-sm leading-5 text-slate-700">{display(value)}</p>
        </div>
    );
}

function WeeklyReportSummary({ report, legacyReport }) {
    if (!report) {
        return <TextBlock icon={FileText} label="Latest weekly report" value={legacyReport} />;
    }

    return (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <FileText className="h-3.5 w-3.5" />
                    Latest weekly report
                </div>
                <span className="inline-flex w-fit rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    Week {report.week_number}
                </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-950">
                {report.program?.name || report.group_name || report.week_range || "Weekly update"}
            </p>
            <div className="mt-3 grid gap-2 text-sm leading-5 text-slate-700">
                <ReportLine label="Learned" value={report.what_we_learned} />
                <ReportLine label="Practice" value={report.what_to_practice} />
                <ReportLine label="Next" value={report.next_focus} />
            </div>
            {report.individual_child_note && (
                <p className="mt-3 rounded-md border border-blue-100 bg-white p-2 text-sm leading-5 text-slate-700">
                    {report.individual_child_note}
                </p>
            )}
        </div>
    );
}

function ReportLine({ label, value }) {
    return (
        <p className="line-clamp-2">
            <span className="font-semibold text-slate-900">{label}: </span>
            {display(value)}
        </p>
    );
}

function Credential({ label, value }) {
    return (
        <div className="min-w-0">
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <span className="mt-0.5 block truncate rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-900">
                {display(value)}
            </span>
        </div>
    );
}

function Metric({ icon: Icon, label, value, tone = "slate" }) {
    const tones = {
        slate: "bg-slate-100 text-slate-700",
        blue: "bg-blue-50 text-blue-700",
        emerald: "bg-emerald-50 text-emerald-700",
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </div>
    );
}
