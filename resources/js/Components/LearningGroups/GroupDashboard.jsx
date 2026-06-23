import { Link } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    CalendarClock,
    CheckCircle2,
    Clock,
    ExternalLink,
    GraduationCap,
    HelpCircle,
    Mail,
    UserCheck,
    Users,
} from "lucide-react";

const statusStyles = {
    draft: "bg-slate-100 text-slate-700",
    active: "bg-emerald-100 text-emerald-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
};

const label = (value) => {
    if (!value) {
        return "Not set";
    }

    return String(value).charAt(0).toUpperCase() + String(value).slice(1).replaceAll("_", " ");
};

const display = (value, fallback = "Not available") => value || fallback;

export default function GroupDashboard({ group, backHref, backLabel = "Groups", theme = "mentor" }) {
    const primaryButton = theme === "admin"
        ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        : "bg-slate-900 hover:bg-slate-800 focus:ring-slate-900";

    const homework = group.homework_summary || {};
    const attendance = group.attendance_summary || {};
    const helpRequests = group.help_requests || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {backLabel}
                    </Link>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-950">{group.name}</h1>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[group.status] || statusStyles.draft}`}>
                            {label(group.status)}
                        </span>
                    </div>
                    {group.description && (
                        <p className="mt-2 max-w-3xl text-sm text-slate-600">{group.description}</p>
                    )}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-slate-500">Capacity</p>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                        {group.students.length}/{group.max_students} students
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <InfoPanel icon={BookOpen} label="Program" value={group.program?.name} />
                <InfoPanel icon={GraduationCap} label="Mentor" value={group.mentor?.name} detail={group.mentor?.email} />
                <InfoPanel icon={CalendarClock} label="Group dates" value={`${display(group.start_date, "Start not set")} to ${display(group.end_date, "End not set")}`} />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-950">Next live class</h2>
                            <p className="mt-1 text-sm text-slate-500">{display(group.next_live_class?.topic, "No upcoming class scheduled")}</p>
                        </div>
                        <Clock className="h-5 w-5 text-slate-400" />
                    </div>

                    {group.next_live_class ? (
                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <MetaItem label="Date" value={group.next_live_class.date} />
                            <MetaItem label="Time" value={group.next_live_class.time} />
                            <MetaItem label="Duration" value={group.next_live_class.duration} />
                            <MetaItem label="Status" value={label(group.next_live_class.status)} />
                            {group.next_live_class.meeting_link && (
                                <a
                                    href={group.next_live_class.meeting_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${primaryButton}`}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Open class
                                </a>
                            )}
                        </div>
                    ) : (
                        <EmptyLine text="No scheduled or confirmed class was found for this group." />
                    )}
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-slate-950">Current lesson</h2>
                        <BookOpen className="h-5 w-5 text-slate-400" />
                    </div>
                    {group.current_lesson ? (
                        <div className="mt-5 space-y-4">
                            <MetaItem label="Lesson" value={group.current_lesson.title} />
                            <MetaItem label="Level" value={group.current_lesson.level ? `Level ${group.current_lesson.level}` : "Not set"} />
                        </div>
                    ) : (
                        <EmptyLine text="No current lesson has been identified yet." />
                    )}
                </section>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <SummaryPanel
                    icon={CheckCircle2}
                    title="Homework summary"
                    stats={[
                        ["Assigned", homework.assigned_count ?? 0],
                        ["Completed", homework.completed_count ?? 0],
                        ["Needs help", homework.needs_help_count ?? 0],
                    ]}
                >
                    {homework.latest ? (
                        <div className="mt-4 rounded-lg bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase text-slate-500">Latest homework</p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">{display(homework.latest.current, homework.latest.status)}</p>
                            <p className="mt-2 text-xs text-slate-500">{display(homework.latest.class_title)} - {display(homework.latest.class_date)}</p>
                        </div>
                    ) : (
                        <EmptyLine text="No homework summary available." />
                    )}
                </SummaryPanel>

                <SummaryPanel
                    icon={UserCheck}
                    title="Attendance summary"
                    stats={[
                        ["Classes", attendance.classes_completed ?? 0],
                        ["Attended", attendance.attended_count ?? 0],
                        ["Missed", attendance.missed_count ?? 0],
                    ]}
                >
                    <div className="mt-4 rounded-lg bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase text-slate-500">Attendance rate</p>
                        <p className="mt-1 text-2xl font-bold text-slate-950">
                            {attendance.attendance_rate === null || attendance.attendance_rate === undefined
                                ? "N/A"
                                : `${attendance.attendance_rate}%`}
                        </p>
                    </div>
                </SummaryPanel>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-slate-950">Help requests</h2>
                        <HelpCircle className="h-5 w-5 text-slate-400" />
                    </div>
                    {helpRequests.length > 0 ? (
                        <div className="mt-4 space-y-3">
                            {helpRequests.slice(0, 4).map((request, index) => (
                                <div key={`${request.class_title}-${index}`} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-sm font-semibold text-amber-950">{display(request.student_name, "Group request")}</p>
                                    <p className="mt-1 text-sm text-amber-900">{request.message}</p>
                                    <p className="mt-2 text-xs text-amber-800">{request.class_title} - {request.class_date}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyLine text="No open help requests found." />
                    )}
                </section>
            </div>

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">Students</h2>
                        <p className="mt-1 text-sm text-slate-500">All students currently assigned to this group.</p>
                    </div>
                    <Users className="h-5 w-5 text-slate-400" />
                </div>

                {group.students.length === 0 ? (
                    <div className="px-5 py-10">
                        <EmptyLine text="No students have been added to this group yet." />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Email</TableHeader>
                                    <TableHeader>Progress</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {group.students.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-950">{student.name}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            <span className="inline-flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                {student.email}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {student.progress === null || student.progress === undefined ? "N/A" : `${student.progress}%`}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700">{label(student.enrollment_status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

function InfoPanel({ icon: Icon, label, value, detail }) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
                <span className="rounded-md bg-slate-100 p-2 text-slate-700">
                    <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                    <p className="mt-1 truncate text-base font-bold text-slate-950">{display(value)}</p>
                    {detail && <p className="mt-1 truncate text-sm text-slate-500">{detail}</p>}
                </div>
            </div>
        </section>
    );
}

function SummaryPanel({ icon: Icon, title, stats, children }) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                <Icon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
                {stats.map(([labelText, value]) => (
                    <div key={labelText} className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-500">{labelText}</p>
                        <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
                    </div>
                ))}
            </div>
            {children}
        </section>
    );
}

function MetaItem({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{display(value)}</p>
        </div>
    );
}

function EmptyLine({ text }) {
    return (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <AlertCircle className="h-4 w-4 shrink-0 text-slate-400" />
            {text}
        </div>
    );
}

function TableHeader({ children }) {
    return (
        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            {children}
        </th>
    );
}
