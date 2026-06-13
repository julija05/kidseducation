import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Eye, Search, Users } from "lucide-react";

const statusTone = (status) => {
    const tones = {
        pending: "bg-amber-100 text-amber-800",
        approved: "bg-emerald-100 text-emerald-800",
        rejected: "bg-red-100 text-red-800",
        waitlist: "bg-blue-100 text-blue-800",
    };

    return tones[status] || tones.pending;
};

export default function Index({ childProfiles, filters = {}, statuses = [] }) {
    const submitSearch = (event) => {
        event.preventDefault();
        router.get(route("admin.child-profiles.index"), {
            search: event.target.search.value,
            status: filters.status,
        });
    };

    const filterStatus = (status) => {
        router.get(route("admin.child-profiles.index"), {
            search: filters.search,
            status,
        });
    };

    return (
        <AdminLayout>
            <Head title="Child Profiles" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="flex items-center text-2xl font-bold text-gray-900 sm:text-3xl">
                        <Users className="mr-3 h-7 w-7 text-blue-600" />
                        Child Profiles
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Review child profiles submitted by parent accounts.
                    </p>
                </div>

                <section className="rounded-lg bg-white p-5 shadow">
                    <form onSubmit={submitSearch} className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters.search || ""}
                                placeholder="Search by child, grade/class, parent name, or parent email..."
                                className="w-full rounded-md border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </form>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => filterStatus("")}
                            className={`rounded-md px-3 py-2 text-sm font-semibold ${
                                !filters.status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            All
                        </button>
                        {statuses.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => filterStatus(status)}
                                className={`rounded-md px-3 py-2 text-sm font-semibold capitalize ${
                                    filters.status === status
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg bg-white shadow">
                    {childProfiles.data.length ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <TableHead>Child</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Grade/Class</TableHead>
                                        <TableHead>Parent</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {childProfiles.data.map((profile) => (
                                        <tr key={profile.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-semibold text-gray-900">{profile.child_name}</div>
                                                <div className="max-w-xs truncate text-sm text-gray-500">
                                                    {profile.notes || "No notes"}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{profile.age ?? "-"}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{profile.grade_class || "-"}</td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{profile.parent?.name || "Unknown"}</div>
                                                <div className="text-sm text-gray-500">{profile.parent?.email || "-"}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusTone(profile.status)}`}>
                                                    {profile.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                {new Date(profile.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <Link
                                                    href={route("admin.child-profiles.show", profile.id)}
                                                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <h2 className="text-base font-semibold text-gray-900">No child profiles found</h2>
                            <p className="mt-2 text-sm text-gray-600">Profiles submitted by parents will appear here.</p>
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

function TableHead({ children }) {
    return (
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">
            {children}
        </th>
    );
}
