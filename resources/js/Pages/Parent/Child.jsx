import ParentLayout from "@/Layouts/ParentLayout";
import { Head, Link } from "@inertiajs/react";
import {
    ArrowLeft,
    BookOpen,
    CalendarClock,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    ListChecks,
    MessageSquareText,
    Target,
    TrendingUp,
} from "lucide-react";

const approvalTone = (status) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    if (status === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
    return "bg-slate-50 text-slate-700 ring-slate-200";
};

export default function Child({ child }) {
    const canShowLearningDetails = child.has_active_program === true;

    return (
        <ParentLayout>
            <Head title={`${child.name} - Parent Dashboard`} />

            <div className="space-y-6">
                <Link
                    href={route("parent.dashboard")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                </Link>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Student profile</p>
                            <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">{child.name}</h1>
                            {canShowLearningDetails ? (
                                <p className="mt-2 text-sm text-slate-600">{child.username || child.email}</p>
                            ) : (
                                <p className="mt-2 text-sm text-slate-600">Login details are available after admin approval.</p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {canShowLearningDetails && (
                                <Link
                                    href={route("parent.children.learning-dashboard", child.id)}
                                    className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    <GraduationCap className="h-4 w-4" />
                                    Learning dashboard
                                </Link>
                            )}
                            <span className="inline-flex w-fit items-center rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold capitalize text-slate-700">
                                {child.status || "active"}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-lg font-semibold text-slate-950">Program enrollments</h2>
                    </div>

                    {child.enrollments.length ? (
                        <div className="divide-y divide-slate-200">
                            {child.enrollments.map((enrollment) => (
                                <div key={enrollment.id} className="px-5 py-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-slate-500" />
                                                <p className="font-semibold text-slate-950">
                                                    {enrollment.program?.name || "Removed program"}
                                                </p>
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ${approvalTone(enrollment.approval_status)}`}>
                                                    {enrollment.approval_status}
                                                </span>
                                            </div>
                                            {enrollment.has_learning_access && (
                                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-500"
                                                        style={{ width: `${Math.min(enrollment.progress || 0, 100)}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {enrollment.has_learning_access ? (
                                            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                                                <EnrollmentStat
                                                    icon={TrendingUp}
                                                    label="Progress"
                                                    value={`${enrollment.progress || 0}%`}
                                                />
                                                <EnrollmentStat
                                                    icon={CheckCircle2}
                                                    label="Quiz points"
                                                    value={enrollment.quiz_points || 0}
                                                />
                                                <EnrollmentStat
                                                    icon={Clock}
                                                    label="Level"
                                                    value={enrollment.highest_unlocked_level || 1}
                                                />
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800 lg:min-w-[320px]">
                                                Learning progress appears after admin approval.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-5 py-12 text-center">
                            <h3 className="text-base font-semibold text-slate-950">No enrollments yet</h3>
                            <p className="mt-2 text-sm text-slate-600">This student does not have any program enrollments.</p>
                        </div>
                    )}
                </section>

                {canShowLearningDetails && (
                    <>
                        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-950">Weekly learning reports</h2>
                                    <p className="mt-1 text-sm text-slate-600">Latest and previous parent updates from class weeks.</p>
                                </div>
                                {child.weekly_reports?.length > 0 && (
                                    <span className="inline-flex w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                        {child.weekly_reports.length} reports
                                    </span>
                                )}
                            </div>

                            {child.weekly_reports?.length ? (
                                <div className="divide-y divide-slate-200">
                                    {child.weekly_reports.map((report, index) => (
                                        <WeeklyReport key={report.id} report={report} isLatest={index === 0} />
                                    ))}
                                </div>
                            ) : (
                                <div className="px-5 py-12 text-center">
                                    <FileText className="mx-auto h-8 w-8 text-slate-400" />
                                    <h3 className="mt-3 text-base font-semibold text-slate-950">No weekly reports yet</h3>
                                    <p className="mt-2 text-sm text-slate-600">Published weekly reports for this child or group will appear here.</p>
                                </div>
                            )}
                        </section>

                        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-5 py-4">
                                <h2 className="text-lg font-semibold text-slate-950">Mentor notes for parents</h2>
                            </div>

                            {child.parent_visible_mentor_notes?.length ? (
                                <div className="divide-y divide-slate-200">
                                    {child.parent_visible_mentor_notes.map((note) => (
                                        <div key={note.id} className="px-5 py-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex gap-3">
                                                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                                                        <MessageSquareText className="h-4 w-4" />
                                                    </span>
                                                    <div>
                                                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{note.note}</p>
                                                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                                                            {note.class_title && <span>{note.class_title}</span>}
                                                            {note.program_name && <span>{note.program_name}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {note.date && (
                                                    <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                        <CalendarClock className="h-3.5 w-3.5" />
                                                        {note.date}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-5 py-12 text-center">
                                    <MessageSquareText className="mx-auto h-8 w-8 text-slate-400" />
                                    <h3 className="mt-3 text-base font-semibold text-slate-950">No parent-visible notes yet</h3>
                                    <p className="mt-2 text-sm text-slate-600">Mentor notes marked for parents will appear here.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </ParentLayout>
    );
}

function WeeklyReport({ report, isLatest }) {
    return (
        <article className="px-5 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                            <FileText className="h-3.5 w-3.5" />
                            Week {report.week_number}
                        </span>
                        {isLatest && (
                            <span className="inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                Latest
                            </span>
                        )}
                        {report.group_name && (
                            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {report.group_name}
                            </span>
                        )}
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-slate-950">
                        {report.program?.name || report.class_title || "Weekly report"}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                        {report.week_range && <span>{report.week_range}</span>}
                        {report.published_at && <span>Published {report.published_at}</span>}
                    </div>
                </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
                <ReportPanel icon={BookOpen} label="What we learned" value={report.what_we_learned} />
                <ReportPanel icon={ListChecks} label="What to practice" value={report.what_to_practice} />
                <ReportPanel icon={Target} label="Next focus" value={report.next_focus} />
            </div>

            {report.individual_child_note && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                        <MessageSquareText className="h-4 w-4" />
                        Individual child note
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                        {report.individual_child_note}
                    </p>
                </div>
            )}
        </article>
    );
}

function ReportPanel({ icon: Icon, label, value }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{value}</p>
        </div>
    );
}

function EnrollmentStat({ icon: Icon, label, value }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
        </div>
    );
}
