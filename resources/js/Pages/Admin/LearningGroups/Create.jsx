import GroupForm from "@/Components/LearningGroups/GroupForm";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";

export default function Create({ programs, mentors, statuses }) {
    return (
        <AdminLayout>
            <Head title="Create Learning Group" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Learning Group</h1>
                        <p className="mt-1 text-sm text-gray-600">Set up a live teaching group for a program and mentor.</p>
                    </div>
                    <Link
                        href={route("admin.learning-groups.index")}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Groups
                    </Link>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <GroupForm
                        programs={programs}
                        mentors={mentors}
                        statuses={statuses}
                        submitRoute={route("admin.learning-groups.store")}
                        cancelRoute={route("admin.learning-groups.index")}
                        showMentor
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
