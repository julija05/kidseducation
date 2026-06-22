import GroupForm from "@/Components/LearningGroups/GroupForm";
import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";

export default function Create({ programs, statuses }) {
    return (
        <MentorLayout>
            <Head title="Create Group" />

            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Create Group</h1>
                        <p className="mt-1 text-sm text-slate-600">Set up a live teaching group for one of your programs.</p>
                    </div>
                    <Link
                        href={route("mentor.learning-groups.index")}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Groups
                    </Link>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <GroupForm
                        programs={programs}
                        statuses={statuses}
                        submitRoute={route("mentor.learning-groups.store")}
                        cancelRoute={route("mentor.learning-groups.index")}
                    />
                </div>
            </div>
        </MentorLayout>
    );
}
