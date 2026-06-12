import ParentLayout from "@/Layouts/ParentLayout";
import { Head, Link } from "@inertiajs/react";
import {
    ArrowRight,
    BookOpen,
    GraduationCap,
    TrendingUp,
    Users,
} from "lucide-react";

const averageProgress = (children) => {
    const enrollments = children.flatMap((child) => child.enrollments || []);
    if (!enrollments.length) return 0;

    return Math.round(
        enrollments.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0) / enrollments.length
    );
};

export default function Dashboard({ children = [] }) {
    const totalEnrollments = children.reduce((sum, child) => sum + (child.enrollments?.length || 0), 0);
    const progress = averageProgress(children);

    return (
        <ParentLayout>
            <Head title="Parent Dashboard" />

            <div className="space-y-6">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Parent workspace</p>
                            <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                                Children and progress
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                View the students linked to your parent account and follow their program progress.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <Metric icon={Users} label="Linked children" value={children.length} />
                        <Metric icon={BookOpen} label="Program enrollments" value={totalEnrollments} tone="blue" />
                        <Metric icon={TrendingUp} label="Average progress" value={`${progress}%`} tone="emerald" />
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-lg font-semibold text-slate-950">My children</h2>
                    </div>

                    {children.length ? (
                        <div className="divide-y divide-slate-200">
                            {children.map((child) => (
                                <Link
                                    key={child.id}
                                    href={route("parent.children.show", child.id)}
                                    className="grid gap-4 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1fr_160px_160px_80px]"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-950">{child.name}</p>
                                        <p className="mt-1 truncate text-sm text-slate-600">{child.email}</p>
                                    </div>
                                    <ChildStat
                                        icon={BookOpen}
                                        label="Programs"
                                        value={child.enrollments?.length || 0}
                                    />
                                    <ChildStat
                                        icon={TrendingUp}
                                        label="Progress"
                                        value={`${averageProgress([child])}%`}
                                    />
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
                        <div className="px-5 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-slate-950">No linked children yet</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                                Once an administrator links a student to your parent account, that child will appear here.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </ParentLayout>
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

function ChildStat({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
            </span>
            <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-950">{value}</p>
            </div>
        </div>
    );
}
