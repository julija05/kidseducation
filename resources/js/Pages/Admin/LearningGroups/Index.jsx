import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { CalendarDays, Filter, Plus, Search, Users } from "lucide-react";
import { useState } from "react";

const statusStyles = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
};

const label = (status) => status.charAt(0).toUpperCase() + status.slice(1);

export default function Index({ groups, statuses, filters }) {
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "all");

    const applyFilters = () => {
        router.get(route("admin.learning-groups.index"), { search, status }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch("");
        setStatus("all");
        router.get(route("admin.learning-groups.index"));
    };

    return (
        <AdminLayout>
            <Head title="Learning Groups" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Learning Groups</h1>
                        <p className="mt-1 text-sm text-gray-600">Live teaching groups connected to programs and mentors.</p>
                    </div>
                    <Link
                        href={route("admin.learning-groups.create")}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Create group
                    </Link>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto_auto]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search groups, programs, mentors"
                                className="w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="all">All statuses</option>
                            {statuses.map((item) => (
                                <option key={item} value={item}>
                                    {label(item)}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    {groups.data.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-300" />
                            <p className="mt-3 text-sm font-medium text-gray-700">No learning groups found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Group</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Program</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Mentor</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Dates</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Capacity</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {groups.data.map((group) => (
                                        <tr key={group.id}>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{group.name}</div>
                                                {group.description && (
                                                    <div className="mt-1 max-w-xs truncate text-sm text-gray-500">{group.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{group.program?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <div>{group.mentor?.name}</div>
                                                <div className="text-xs text-gray-500">{group.mentor?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-gray-400" />
                                                    <span>{group.start_date} to {group.end_date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{group.max_students}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[group.status] || statusStyles.draft}`}>
                                                    {label(group.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {groups.links?.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {groups.links.map((link, index) => (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url || "#"}
                                preserveScroll
                                className={`rounded-md px-3 py-2 text-sm ${
                                    link.active
                                        ? "bg-blue-600 text-white"
                                        : link.url
                                            ? "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                                            : "cursor-not-allowed bg-gray-100 text-gray-400"
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
