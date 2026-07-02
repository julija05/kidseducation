import GroupStudentsManager from "@/Components/LearningGroups/GroupStudentsManager";
import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, CalendarDays, ChevronDown, Plus, UserPlus, Users } from "lucide-react";

const statusStyles = {
    draft: "bg-slate-100 text-slate-700",
    active: "bg-emerald-100 text-emerald-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
};

const label = (status) => status.charAt(0).toUpperCase() + status.slice(1);

export default function Index({ groups }) {
    return (
        <MentorLayout>
            <Head title="My Groups" />

            <div className="-mx-4 -my-6 min-h-screen bg-slate-50 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="mx-auto max-w-[1500px] space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="mb-2 text-xs font-bold text-blue-600">LEARNING GROUPS</p>
                            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">My Groups</h1>
                            <p className="mt-2 text-sm text-slate-600 sm:text-base">Live teaching groups assigned to your mentor account.</p>
                        </div>
                        <Link
                            href={route("mentor.learning-groups.create")}
                            className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Create group
                        </Link>
                    </div>

                    {groups.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <Users className="h-6 w-6" />
                            </span>
                            <p className="mt-4 font-semibold text-slate-900">No groups created yet</p>
                            <p className="mt-1 text-sm text-slate-500">Create a group to organize students and teaching sessions.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                            {groups.map((group) => (
                                <article key={group.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_36px_-28px_rgba(15,23,42,0.4)] transition hover:border-blue-200">
                                    <div className="p-5 sm:p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                                    <Users className="h-5 w-5" />
                                                </span>
                                                <div className="min-w-0">
                                                    <Link
                                                        href={route("mentor.learning-groups.show", group.id)}
                                                        className="block truncate text-lg font-bold text-slate-900 transition hover:text-blue-700"
                                                    >
                                                        {group.name}
                                                    </Link>
                                                    <p className="mt-1 truncate text-sm font-medium text-slate-500">{group.program?.name}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[group.status] || statusStyles.draft}`}>
                                                {label(group.status)}
                                            </span>
                                        </div>

                                        {group.description && (
                                            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{group.description}</p>
                                        )}

                                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                    <CalendarDays className="h-4 w-4 text-blue-600" />
                                                    Schedule
                                                </div>
                                                <p className="mt-2 text-sm font-semibold text-slate-800">{group.start_date} to {group.end_date}</p>
                                            </div>
                                            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                    <Users className="h-4 w-4 text-blue-600" />
                                                    Students
                                                </div>
                                                <p className="mt-2 text-sm font-semibold text-slate-800">{group.students_count} of {group.max_students} enrolled</p>
                                            </div>
                                        </div>

                                        <Link
                                            href={route("mentor.learning-groups.show", group.id)}
                                            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
                                        >
                                            Open group dashboard
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>

                                    <details className="group/manage border-t border-slate-100 bg-slate-50/60">
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 sm:px-6 [&::-webkit-details-marker]:hidden">
                                            <span className="inline-flex items-center gap-2">
                                                <UserPlus className="h-4 w-4" />
                                                Manage students
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-slate-400 transition group-open/manage:rotate-180" />
                                        </summary>
                                        <div className="border-t border-slate-200 bg-white px-5 py-5 sm:px-6">
                                            <GroupStudentsManager
                                                group={group}
                                                storeRoute={(groupId) => route("mentor.learning-groups.students.store", groupId)}
                                                destroyRoute={(groupId, studentId) => route("mentor.learning-groups.students.destroy", [groupId, studentId])}
                                            />
                                        </div>
                                    </details>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MentorLayout>
    );
}
