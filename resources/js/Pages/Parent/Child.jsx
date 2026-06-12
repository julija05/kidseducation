import ParentLayout from "@/Layouts/ParentLayout";
import { Head, Link } from "@inertiajs/react";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock,
    TrendingUp,
} from "lucide-react";

const approvalTone = (status) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    if (status === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
    return "bg-slate-50 text-slate-700 ring-slate-200";
};

export default function Child({ child }) {
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
                            <p className="mt-2 text-sm text-slate-600">{child.email}</p>
                        </div>
                        <span className="inline-flex w-fit items-center rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold capitalize text-slate-700">
                            {child.status || "active"}
                        </span>
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
                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-emerald-500"
                                                    style={{ width: `${Math.min(enrollment.progress || 0, 100)}%` }}
                                                />
                                            </div>
                                        </div>

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
            </div>
        </ParentLayout>
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
