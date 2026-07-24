import { Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    CalendarClock,
    CheckCircle2,
    ChevronDown,
    Clock,
    ExternalLink,
    GraduationCap,
    HelpCircle,
    FileText,
    Mail,
    Paperclip,
    Trash2,
    UserCheck,
    Users,
    Zap,
} from "lucide-react";

const statusStyles = {
    draft: "bg-slate-100 text-slate-700",
    active: "bg-emerald-100 text-emerald-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    not_started: "bg-slate-100 text-slate-700",
    needs_help: "bg-amber-100 text-amber-800",
    present: "bg-emerald-100 text-emerald-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-amber-100 text-amber-800",
    excused: "bg-blue-100 text-blue-800",
    caught_up_later: "bg-violet-100 text-violet-800",
};

const statusBorderStyles = {
    completed: "border-emerald-200 bg-emerald-50 text-emerald-900",
    needs_help: "border-amber-200 bg-amber-50 text-amber-900",
    not_started: "border-slate-200 bg-slate-50 text-slate-800",
};

const attendanceButtonStyles = {
    present: {
        active: "border-emerald-600 bg-emerald-600 text-white",
        idle: "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50",
    },
    absent: {
        active: "border-red-600 bg-red-600 text-white",
        idle: "border-red-200 bg-white text-red-800 hover:bg-red-50",
    },
    late: {
        active: "border-amber-500 bg-amber-500 text-white",
        idle: "border-amber-200 bg-white text-amber-800 hover:bg-amber-50",
    },
    excused: {
        active: "border-blue-600 bg-blue-600 text-white",
        idle: "border-blue-200 bg-white text-blue-800 hover:bg-blue-50",
    },
    caught_up_later: {
        active: "border-violet-600 bg-violet-600 text-white",
        idle: "border-violet-200 bg-white text-violet-800 hover:bg-violet-50",
    },
};

const label = (value) => {
    if (!value) {
        return "Not set";
    }

    return String(value).charAt(0).toUpperCase() + String(value).slice(1).replaceAll("_", " ");
};

const display = (value, fallback = "Not available") => value || fallback;

export default function GroupDashboard({ group, homeworkOptions, attendanceOptions, weeklyReportOptions, practiceResources = [], backHref, backLabel = "Groups", theme = "mentor" }) {
    const primaryButton = theme === "admin"
        ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        : "bg-sky-600 hover:bg-sky-700 focus:ring-blue-500";

    const homework = group.homework_summary || {};
    const attendance = group.attendance_summary || {};
    const helpRequests = group.help_requests || [];

    return (
        <div className={`space-y-6 ${theme === "mentor" ? "[&_section]:rounded-2xl" : ""}`}>
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
                        <h1 className={`${theme === "mentor" ? "text-3xl sm:text-4xl" : "text-2xl"} font-bold text-slate-950`}>{group.name}</h1>
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

            {theme === "mentor" ? (
                <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <h2 className="text-lg font-bold text-slate-950">Group tools</h2>
                        <p className="mt-1 text-sm text-slate-500">Open a workspace when you need to manage attendance, homework, or students.</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {attendanceOptions && (
                            <DashboardDisclosure icon={UserCheck} title="Mark attendance" description="Record attendance for a live session.">
                                <AttendanceForm group={group} options={attendanceOptions} primaryButton={primaryButton} />
                            </DashboardDisclosure>
                        )}
                        <DashboardDisclosure icon={Clock} title="Attendance history" description="Review previous attendance records by student.">
                            <AttendanceHistory history={attendance.student_history || []} />
                        </DashboardDisclosure>
                        {homeworkOptions && (
                            <DashboardDisclosure icon={CheckCircle2} title="Create homework" description="Prepare and assign practice work.">
                                <HomeworkAssignmentForm group={group} options={homeworkOptions} primaryButton={primaryButton} />
                            </DashboardDisclosure>
                        )}
                        {weeklyReportOptions && (
                            <DashboardDisclosure icon={FileText} title="Weekly reports" description="Publish a report for the group or one student.">
                                <WeeklyReportForm group={group} options={weeklyReportOptions} primaryButton={primaryButton} />
                            </DashboardDisclosure>
                        )}
                        <DashboardDisclosure icon={Zap} title="Practice resources" description="Share a practice message or file with the whole group.">
                            <PracticeResourcesPanel group={group} resources={practiceResources} primaryButton={primaryButton} />
                        </DashboardDisclosure>
                        <DashboardDisclosure icon={BookOpen} title="Homework completion" description="Review completion and support status.">
                            <HomeworkStatusTable assignments={homework.assignments || []} summary={homework} />
                        </DashboardDisclosure>
                        <DashboardDisclosure icon={Users} title="Students" description={`${group.students.length} currently assigned to this group.`}>
                            <StudentsPanel students={group.students} group={group} theme={theme} />
                        </DashboardDisclosure>
                    </div>
                </section>
            ) : (
                <>
                    {attendanceOptions && <AttendanceForm group={group} options={attendanceOptions} primaryButton={primaryButton} />}
                    <AttendanceHistory history={attendance.student_history || []} />
                    {homeworkOptions && <HomeworkAssignmentForm group={group} options={homeworkOptions} primaryButton={primaryButton} />}
                    <HomeworkStatusTable assignments={homework.assignments || []} summary={homework} />
                    <StudentsPanel students={group.students} group={group} theme={theme} />
                </>
            )}
        </div>
    );
}

function WeeklyReportForm({ group, options, primaryButton }) {
    const students = options.students || [];
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        week_number: 1,
        child_user_id: "",
        what_we_learned: "",
        what_to_practice: "",
        next_focus: "",
        individual_notes: {},
    });

    const submit = (event) => {
        event.preventDefault();
        post(route("mentor.learning-groups.weekly-reports.store", group.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const setNote = (studentId, note) => setData("individual_notes", {
        ...data.individual_notes,
        [studentId]: note,
    });

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Week number" error={errors.week_number}>
                        <input type="number" min="1" max="53" value={data.week_number} onChange={(e) => setData("week_number", e.target.value)} className="w-full rounded-md border-slate-300" required />
                    </Field>
                    <Field label="Report for" error={errors.child_user_id}>
                        <select value={data.child_user_id} onChange={(e) => setData("child_user_id", e.target.value)} className="w-full rounded-md border-slate-300">
                            <option value="">Whole group</option>
                            {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
                        </select>
                    </Field>
                </div>
                <ReportTextarea label="What we learned" value={data.what_we_learned} onChange={(value) => setData("what_we_learned", value)} error={errors.what_we_learned} />
                <ReportTextarea label="What to practice" value={data.what_to_practice} onChange={(value) => setData("what_to_practice", value)} error={errors.what_to_practice} />
                <ReportTextarea label="Next week focus" value={data.next_focus} onChange={(value) => setData("next_focus", value)} error={errors.next_focus} />

                {data.child_user_id ? (
                    <ReportTextarea label="Optional individual note" value={data.individual_notes[data.child_user_id] || ""} onChange={(value) => setNote(data.child_user_id, value)} />
                ) : students.length > 0 && (
                    <details className="rounded-md border border-slate-200 p-4">
                        <summary className="cursor-pointer text-sm font-semibold text-slate-800">Optional individual notes per child</summary>
                        <div className="mt-4 space-y-4">
                            {students.map((student) => (
                                <ReportTextarea key={student.id} label={student.name} value={data.individual_notes[student.id] || ""} onChange={(value) => setNote(student.id, value)} error={errors[`individual_notes.${student.id}`]} />
                            ))}
                        </div>
                    </details>
                )}

                <div className="flex items-center gap-3">
                    <button disabled={processing} className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${primaryButton}`}>Publish report</button>
                    {recentlySuccessful && <span className="text-sm font-medium text-emerald-700">Report published.</span>}
                </div>
            </form>

            {(options.reports || []).length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                    <h3 className="text-sm font-semibold text-slate-900">Published reports</h3>
                    <div className="mt-2 space-y-2">
                        {options.reports.map((report) => <p key={report.id} className="text-sm text-slate-600">Week {report.week_number} · {report.audience} · {report.published_at}</p>)}
                    </div>
                </div>
            )}
        </section>
    );
}

function Field({ label: fieldLabel, error, children }) {
    return (
        <label className="block text-sm font-semibold text-slate-800">
            {fieldLabel}
            <div className="mt-1">{children}</div>
            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </label>
    );
}

function ReportTextarea({ label: fieldLabel, value, onChange, error }) {
    return (
        <Field label={fieldLabel} error={error}>
            <textarea rows="3" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border-slate-300" />
        </Field>
    );
}

function DashboardDisclosure({ icon: Icon, title, description, children }) {
    return (
        <details className="group/tool">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-blue-50/60 sm:px-6 [&::-webkit-details-marker]:hidden">
                <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900">{title}</span>
                        <span className="mt-0.5 block text-sm text-slate-500">{description}</span>
                    </span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open/tool:rotate-180" />
            </summary>
            <div className="border-t border-slate-100 bg-slate-50/50 p-3 sm:p-4 [&>section]:!rounded-xl [&>section]:!shadow-none">
                {children}
            </div>
        </details>
    );
}

function StudentsPanel({ students, group, theme }) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-950">Students</h2>
                    <p className="mt-1 text-sm text-slate-500">All students currently assigned to this group.</p>
                </div>
                <Users className="h-5 w-5 text-slate-400" />
            </div>

            {students.length === 0 ? (
                <div className="px-5 py-10"><EmptyLine text="No students have been added to this group yet." /></div>
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
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                                        {theme === "mentor" ? (
                                            <Link href={route("mentor.learning-groups.students.show", [group.id, student.id])} className="text-sky-700 hover:text-sky-900 hover:underline">{student.name}</Link>
                                        ) : student.name}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" />{student.email}</span>
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
    );
}

function AttendanceForm({ group, options, primaryButton }) {
    const sessions = options.liveSessions || [];
    const statuses = options.statuses || [];
    const firstSession = sessions[0] || null;
    const [selectedSessionId, setSelectedSessionId] = useState(firstSession?.id || "");
    const initialAttendance = (firstSession?.participants || []).map((student) => ({
        student_id: student.id,
        status: student.attendance_status || "",
    }));
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        attendance: initialAttendance,
    });
    const selectedSession = sessions.find((session) => String(session.id) === String(selectedSessionId));

    const selectSession = (sessionId) => {
        const session = sessions.find((item) => String(item.id) === String(sessionId));
        setSelectedSessionId(sessionId);
        setData("attendance", (session?.participants || []).map((student) => ({
            student_id: student.id,
            status: student.attendance_status || "",
        })));
    };

    const updateStatus = (studentId, status) => {
        setData("attendance", data.attendance.map((attendance) => (
            attendance.student_id === studentId ? { ...attendance, status } : attendance
        )));
    };

    const setAllStatuses = (status) => {
        setData("attendance", data.attendance.map((attendance) => ({ ...attendance, status })));
    };

    const markedCount = data.attendance.filter((attendance) => attendance.status).length;
    const unmarkedCount = data.attendance.length - markedCount;

    const submit = (event) => {
        event.preventDefault();
        if (!selectedSession) {
            return;
        }

        post(route("mentor.learning-groups.attendance.store", [group.id, selectedSession.id]), {
            preserveScroll: true,
        });
    };

    return (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-950">Mark attendance</h2>
                    <p className="mt-1 text-sm text-slate-500">Select a live session and record a status for each participating student.</p>
                </div>
                <UserCheck className="h-5 w-5 text-slate-400" />
            </div>

            {sessions.length === 0 ? (
                <div className="px-5 py-6">
                    <EmptyLine text="No live sessions with students were found for this group." />
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-5 p-5">
                    <FormField label="Live session">
                        <select
                            value={selectedSessionId}
                            onChange={(event) => selectSession(event.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            {sessions.map((session) => (
                                <option key={session.id} value={session.id}>
                                    {session.date} at {session.time} - {session.title} ({label(session.status)})
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-700">
                            {markedCount}/{data.attendance.length} students marked
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setAllStatuses("present")}
                                className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                All present
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllStatuses("absent")}
                                className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <AlertCircle className="h-4 w-4" />
                                All absent
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-[52rem] divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <TableHeader>Student</TableHeader>
                                    <TableHeader>Attendance status</TableHeader>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {(selectedSession?.participants || []).map((student, index) => {
                                    const attendance = data.attendance.find((item) => item.student_id === student.id);
                                    return (
                                        <tr key={student.id}>
                                            <td className="px-5 py-4 text-sm">
                                                <p className="font-semibold text-slate-950">{student.name}</p>
                                                <p className="mt-1 text-xs text-slate-500">{student.email}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm">
                                                <div className="flex flex-wrap gap-2" role="group" aria-label={`Attendance for ${student.name}`}>
                                                    {statuses.map((status) => {
                                                        const isActive = attendance?.status === status.value;
                                                        const styles = attendanceButtonStyles[status.value] || {
                                                            active: "border-slate-700 bg-slate-700 text-white",
                                                            idle: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                                                        };

                                                        return (
                                                            <button
                                                                key={status.value}
                                                                type="button"
                                                                aria-pressed={isActive}
                                                                onClick={() => updateStatus(student.id, status.value)}
                                                                className={`min-h-9 rounded-md border px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 ${isActive ? styles.active : styles.idle}`}
                                                            >
                                                                {status.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {errors[`attendance.${index}.status`] && (
                                                    <p className="mt-1 text-xs font-semibold text-red-600">{errors[`attendance.${index}.status`]}</p>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {errors.attendance && <p className="text-sm font-semibold text-red-600">{errors.attendance}</p>}
                    {unmarkedCount > 0 && (
                        <p className="text-sm font-semibold text-amber-700">
                            Mark {unmarkedCount} remaining {unmarkedCount === 1 ? "student" : "students"} before saving.
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        {recentlySuccessful && <span className="text-sm font-semibold text-emerald-700">Attendance saved.</span>}
                        <button
                            type="submit"
                            disabled={processing || !selectedSession || data.attendance.length === 0 || unmarkedCount > 0}
                            className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${primaryButton}`}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Save attendance
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}

function AttendanceHistory({ history }) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-950">Attendance history by student</h2>
                    <p className="mt-1 text-sm text-slate-500">Recorded attendance across this group&apos;s live sessions.</p>
                </div>
                <Users className="h-5 w-5 text-slate-400" />
            </div>

            {history.length === 0 ? (
                <div className="px-5 py-6">
                    <EmptyLine text="No students are available for attendance history." />
                </div>
            ) : (
                <div className="divide-y divide-slate-200">
                    {history.map((student) => (
                        <div key={student.student_id} className="p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-950">{student.student_name}</h3>
                                    <p className="mt-1 text-xs text-slate-500">{student.student_email}</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                    {student.records.length} {student.records.length === 1 ? "record" : "records"}
                                </span>
                            </div>

                            {student.records.length === 0 ? (
                                <p className="mt-3 text-sm text-slate-500">No attendance has been recorded yet.</p>
                            ) : (
                                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <TableHeader>Live session</TableHeader>
                                                <TableHeader>Date</TableHeader>
                                                <TableHeader>Status</TableHeader>
                                                <TableHeader>Marked</TableHeader>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {student.records.map((record) => (
                                                <tr key={`${record.class_id}-${student.student_id}`}>
                                                    <td className="px-5 py-3 text-sm font-semibold text-slate-950">{record.class_title}</td>
                                                    <td className="px-5 py-3 text-sm text-slate-600">{record.class_date}</td>
                                                    <td className="px-5 py-3 text-sm">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[record.status] || statusStyles.draft}`}>
                                                            {record.status_label || label(record.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-sm text-slate-600">
                                                        {record.marked_at ? formatDateTime(record.marked_at) : "Legacy record"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
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

function PracticeResourcesPanel({ group, resources, primaryButton }) {
    // Remount key lets us clear the native file input after a successful submit.
    const [fileInputKey, setFileInputKey] = useState(0);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        message: "",
        file: null,
    });

    const submit = (event) => {
        event.preventDefault();

        post(route("mentor.learning-groups.practice-resources.store", group.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setFileInputKey((key) => key + 1);
            },
        });
    };

    const remove = (resource) => {
        if (!window.confirm("Remove this practice resource?")) {
            return;
        }

        router.delete(route("mentor.learning-groups.practice-resources.destroy", [group.id, resource.id]), {
            preserveScroll: true,
        });
    };

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-950">Practice resources</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Share a short practice message (e.g. "Practice the Big Friend rule") and/or attach a PDF. Everyone in this group will see it in their Practice section.
                    </p>
                </div>
                <Zap className="h-5 w-5 text-slate-400" />
            </div>

            <form onSubmit={submit} className="mt-5 grid gap-4">
                <FormField label="Title" error={errors.title}>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(event) => setData("title", event.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        placeholder="Big Friend rule practice"
                    />
                </FormField>

                <FormField label="Message (optional)" error={errors.message}>
                    <textarea
                        value={data.message}
                        onChange={(event) => setData("message", event.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        placeholder="Practice the Big Friend rule for 10 minutes each day this week."
                    />
                </FormField>

                <FormField label="Attach a file (optional)" error={errors.file}>
                    <input
                        key={fileInputKey}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(event) => setData("file", event.target.files[0] || null)}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                    />
                    <span className="mt-1 block text-xs text-slate-500">PDF, Word, or image up to 20MB.</span>
                </FormField>

                <div>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${primaryButton}`}
                    >
                        {processing ? "Sharing..." : "Share with group"}
                    </button>
                </div>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-900">Shared resources</h3>
                {resources.length > 0 ? (
                    <ul className="mt-3 space-y-3">
                        {resources.map((resource) => (
                            <li key={resource.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900">{resource.title}</p>
                                        {resource.message && (
                                            <p className="mt-1 text-sm text-slate-600">{resource.message}</p>
                                        )}
                                        {resource.has_file && (
                                            <a
                                                href={resource.download_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                                            >
                                                <Paperclip className="h-4 w-4" />
                                                {resource.file_name}
                                            </a>
                                        )}
                                        <p className="mt-1 text-xs text-slate-400">{resource.created_at}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => remove(resource)}
                                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyLine text="No practice resources shared yet." />
                )}
            </div>
        </section>
    );
}

function HomeworkAssignmentForm({ group, options, primaryButton }) {
    const lessons = options.lessons || [];
    const liveSessions = options.liveSessions || [];
    const statuses = options.statuses || ["assigned"];
    const defaultStatus = statuses.includes("assigned") ? "assigned" : statuses[0] || "assigned";
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        title: "",
        instructions: "",
        practice_tasks_text: "",
        lesson_id: lessons[0]?.id || "",
        live_session_id: "",
        due_date: "",
        estimated_practice_minutes: 15,
        status: defaultStatus,
    });

    const submit = (event) => {
        event.preventDefault();

        transform((formData) => ({
            ...formData,
            practice_tasks: formData.practice_tasks_text
                .split("\n")
                .map((task) => task.trim())
                .filter(Boolean),
        }));

        post(route("mentor.learning-groups.homework.store", group.id), {
            preserveScroll: true,
            onSuccess: () => reset("title", "instructions", "practice_tasks_text", "live_session_id", "due_date", "estimated_practice_minutes"),
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

                <FormField label="Practice examples" error={errors.practice_tasks}>
                    <textarea
                        value={data.practice_tasks_text}
                        onChange={(event) => setData("practice_tasks_text", event.target.value)}
                        rows={5}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        placeholder={"Show number 7.\nShow number 14.\nSolve 2 + 3.\nSolve 8 - 4."}
                    />
                    <span className="mt-1 block text-xs text-slate-500">One simple task per line.</span>
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
