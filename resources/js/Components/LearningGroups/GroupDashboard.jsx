import { Link, useForm } from "@inertiajs/react";
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
    not_started: "bg-slate-100 text-slate-700",
    needs_help: "bg-amber-100 text-amber-800",
};

const statusBorderStyles = {
    completed: "border-emerald-200 bg-emerald-50 text-emerald-900",
    needs_help: "border-amber-200 bg-amber-50 text-amber-900",
    not_started: "border-slate-200 bg-slate-50 text-slate-800",
};

const label = (value) => {
    if (!value) {
        return "Not set";
    }

    return String(value).charAt(0).toUpperCase() + String(value).slice(1).replaceAll("_", " ");
};

const display = (value, fallback = "Not available") => value || fallback;

export default function GroupDashboard({ group, homeworkOptions, backHref, backLabel = "Groups", theme = "mentor" }) {
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

            {homeworkOptions && (
                <HomeworkAssignmentForm
                    group={group}
                    options={homeworkOptions}
                    primaryButton={primaryButton}
                />
            )}

            <HomeworkStatusTable assignments={homework.assignments || []} summary={homework} />

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

function HomeworkStatusTable({ assignments, summary }) {
    const latestAssignment = assignments[0] || null;
    const statuses = latestAssignment?.student_statuses || [];
    const completed = statuses.filter((status) => status.status === "completed");
    const needsHelp = statuses.filter((status) => status.status === "needs_help");
    const notCompleted = statuses.filter((status) => status.status !== "completed");

    return (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-950">Homework completion</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {latestAssignment ? latestAssignment.current : "Current assignment status for each student."}
                    </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
            </div>

            {assignments.length === 0 ? (
                <div className="px-5 py-10">
                    <EmptyLine text="No assigned homework has student status yet." />
                </div>
            ) : (
                <div className="space-y-5 p-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <HomeworkCount label="Completed" value={latestAssignment?.completed_count ?? summary.completed_count ?? 0} tone="completed" />
                        <HomeworkCount label="Not completed" value={latestAssignment?.not_completed_count ?? summary.not_completed_count ?? 0} tone="not_started" />
                        <HomeworkCount label="Needs help" value={latestAssignment?.needs_help_count ?? summary.needs_help_count ?? 0} tone="needs_help" />
                    </div>

                    {latestAssignment && (
                        <div className="grid gap-4 xl:grid-cols-3">
                            <StudentStatusList title="Completed" students={completed} emptyText="No completed homework yet." tone="completed" />
                            <StudentStatusList title="Needs help" students={needsHelp} emptyText="No help requests for this homework." tone="needs_help" />
                            <StudentStatusList title="Not completed" students={notCompleted} emptyText="Everyone completed this homework." tone="not_started" />
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <TableHeader>Homework</TableHeader>
                                    <TableHeader>Student</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Updated</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {assignments.flatMap((assignment) => (
                                    (assignment.student_statuses || []).map((studentStatus) => (
                                        <tr key={`${assignment.id}-${studentStatus.student_id}`}>
                                            <td className="px-5 py-4 text-sm">
                                                <p className="font-semibold text-slate-950">{assignment.current}</p>
                                                <p className="mt-1 text-xs text-slate-500">{display(assignment.lesson_title, assignment.class_title)}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                <p className="font-semibold text-slate-950">{studentStatus.student_name}</p>
                                                <p className="mt-1 text-xs text-slate-500">{studentStatus.student_email}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[studentStatus.status] || statusStyles.draft}`}>
                                                    {studentStatus.status_label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatStatusTime(studentStatus)}
                                            </td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}

function HomeworkCount({ label: countLabel, value, tone }) {
    return (
        <div className={`rounded-lg border p-4 ${statusBorderStyles[tone] || statusBorderStyles.not_started}`}>
            <p className="text-xs font-semibold uppercase">{countLabel}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
    );
}

function StudentStatusList({ title, students, emptyText, tone }) {
    return (
        <div className={`rounded-lg border p-4 ${statusBorderStyles[tone] || statusBorderStyles.not_started}`}>
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold">{title}</h3>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">{students.length}</span>
            </div>
            {students.length > 0 ? (
                <ul className="mt-3 space-y-2">
                    {students.map((student) => (
                        <li key={student.student_id} className="rounded-md bg-white/70 px-3 py-2">
                            <p className="text-sm font-semibold">{student.student_name}</p>
                            <p className="mt-0.5 text-xs opacity-80">{formatStatusTime(student)}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3 text-sm opacity-80">{emptyText}</p>
            )}
        </div>
    );
}

function formatStatusTime(studentStatus) {
    if (studentStatus.completed_at) {
        return `Completed ${formatDateTime(studentStatus.completed_at)}`;
    }

    if (studentStatus.help_requested_at) {
        return `Requested help ${formatDateTime(studentStatus.help_requested_at)}`;
    }

    return "Not updated";
}

function formatDateTime(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function HomeworkAssignmentForm({ group, options, primaryButton }) {
    const lessons = options.lessons || [];
    const liveSessions = options.liveSessions || [];
    const statuses = options.statuses || ["assigned"];
    const defaultStatus = statuses.includes("assigned") ? "assigned" : statuses[0] || "assigned";
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        instructions: "",
        lesson_id: lessons[0]?.id || "",
        live_session_id: "",
        due_date: "",
        estimated_practice_minutes: 15,
        status: defaultStatus,
    });

    const submit = (event) => {
        event.preventDefault();

        post(route("mentor.learning-groups.homework.store", group.id), {
            preserveScroll: true,
            onSuccess: () => reset("title", "instructions", "live_session_id", "due_date", "estimated_practice_minutes"),
        });
    };

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-950">Create homework</h2>
                    <p className="mt-1 text-sm text-slate-500">Attach practice to a lesson so students and parents can see it in the right place.</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
            </div>

            <form onSubmit={submit} className="mt-5 grid gap-4">
                <div className="grid gap-4 lg:grid-cols-2">
                    <FormField label="Title" error={errors.title}>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(event) => setData("title", event.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            placeholder="Practice addition worksheet"
                        />
                    </FormField>

                    <FormField label="Attach to lesson" error={errors.lesson_id}>
                        <select
                            value={data.lesson_id}
                            onChange={(event) => setData("lesson_id", event.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <option value="">Select lesson</option>
                            {lessons.map((lesson) => (
                                <option key={lesson.id} value={lesson.id}>
                                    {lesson.level ? `Level ${lesson.level} - ` : ""}{lesson.title}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>

                <FormField label="Instructions" error={errors.instructions}>
                    <textarea
                        value={data.instructions}
                        onChange={(event) => setData("instructions", event.target.value)}
                        rows={4}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        placeholder="Complete the exercises before the next class."
                    />
                </FormField>

                <div className="grid gap-4 lg:grid-cols-4">
                    <FormField label="Live session" error={errors.live_session_id}>
                        <select
                            value={data.live_session_id}
                            onChange={(event) => setData("live_session_id", event.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <option value="">No linked session</option>
                            {liveSessions.map((session) => (
                                <option key={session.id} value={session.id}>
                                    {session.date || "Unscheduled"} - {session.title}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label="Due date" error={errors.due_date}>
                        <input
                            type="date"
                            value={data.due_date}
                            onChange={(event) => setData("due_date", event.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                    </FormField>

                    <FormField label="Practice minutes" error={errors.estimated_practice_minutes}>
                        <input
                            type="number"
                            min="1"
                            max="600"
                            value={data.estimated_practice_minutes}
                            onChange={(event) => setData("estimated_practice_minutes", event.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                    </FormField>

                    <FormField label="Status" error={errors.status}>
                        <select
                            value={data.status}
                            onChange={(event) => setData("status", event.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm capitalize focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {label(status)}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing || lessons.length === 0}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${primaryButton}`}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Create homework
                    </button>
                </div>
            </form>
        </section>
    );
}

function FormField({ label: fieldLabel, error, children }) {
    return (
        <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-500">{fieldLabel}</span>
            <span className="mt-1 block">{children}</span>
            {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
        </label>
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
