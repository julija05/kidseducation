import GroupStudentsManager from "@/Components/LearningGroups/GroupStudentsManager";
import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link } from "@inertiajs/react";
import { CalendarDays, LayoutDashboard, Plus, Users } from "lucide-react";

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

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Groups</h1>
                        <p className="mt-1 text-sm text-slate-600">Live teaching groups assigned to your mentor account.</p>
                    </div>
                    <Link
                        href={route("mentor.learning-groups.create")}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <Plus className="h-4 w-4" />
                        Create group
                    </Link>
                </div>

                {groups.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <Users className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-3 text-sm font-medium text-slate-700">No groups created yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {groups.map((group) => (
                            <div key={group.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Link
                                            href={route("mentor.learning-groups.show", group.id)}
                                            className="text-lg font-bold text-slate-900 hover:text-slate-700"
                                        >
                                            {group.name}
                                        </Link>
                                        <p className="mt-1 text-sm font-medium text-slate-600">{group.program?.name}</p>
                                    </div>
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[group.status] || statusStyles.draft}`}>
                                        {label(group.status)}
                                    </span>
                                </div>

                                {group.description && (
                                    <p className="mt-4 line-clamp-2 text-sm text-slate-600">{group.description}</p>
                                )}

                                <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-slate-400" />
                                        <span>{group.start_date} to {group.end_date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <span>{group.max_students} students max</span>
                                    </div>
                                </div>

                                <div className="mt-5 border-t border-slate-200 pt-4">
                                    <GroupStudentsManager
                                        group={group}
                                        storeRoute={(groupId) => route("mentor.learning-groups.students.store", groupId)}
                                        destroyRoute={(groupId, studentId) => route("mentor.learning-groups.students.destroy", [groupId, studentId])}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Link
                                        href={route("mentor.learning-groups.show", group.id)}
                                        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Open dashboard
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MentorLayout>
    );
}
