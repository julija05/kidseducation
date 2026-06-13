import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Mail, User } from "lucide-react";

const statusTone = (status) => {
    const tones = {
        pending: "bg-amber-100 text-amber-800",
        approved: "bg-emerald-100 text-emerald-800",
        rejected: "bg-red-100 text-red-800",
        waitlist: "bg-blue-100 text-blue-800",
    };

    return tones[status] || tones.pending;
};

export default function Show({ childProfile }) {
    return (
        <AdminLayout>
            <Head title={`${childProfile.child_name} - Child Profile`} />

            <div className="mx-auto max-w-4xl space-y-6">
                <Link
                    href={route("admin.child-profiles.index")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-950"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to child profiles
                </Link>

                <section className="rounded-lg bg-white p-6 shadow">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Child profile</p>
                            <h1 className="mt-1 text-2xl font-bold text-gray-900">{childProfile.child_name}</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Created {new Date(childProfile.created_at).toLocaleString()}
                            </p>
                        </div>
                        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusTone(childProfile.status)}`}>
                            {childProfile.status}
                        </span>
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-2">
                    <Panel title="Child Details">
                        <Detail label="Name" value={childProfile.child_name} />
                        <Detail label="Age" value={childProfile.age ?? "-"} />
                        <Detail label="Grade/Class" value={childProfile.grade_class || "-"} />
                        <Detail label="Status" value={childProfile.status} capitalize />
                    </Panel>

                    <Panel title="Parent Account">
                        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-900 text-white">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900">{childProfile.parent?.name || "Unknown parent"}</p>
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{childProfile.parent?.email || "-"}</span>
                                </p>
                            </div>
                        </div>
                    </Panel>
                </section>

                <Panel title="Notes">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                        {childProfile.notes || "No notes added."}
                    </p>
                </Panel>
            </div>
        </AdminLayout>
    );
}

function Panel({ title, children }) {
    return (
        <section className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
            <div className="space-y-4 p-5">{children}</div>
        </section>
    );
}

function Detail({ label, value, capitalize = false }) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className={`mt-1 text-sm font-semibold text-gray-900 ${capitalize ? "capitalize" : ""}`}>{value}</p>
        </div>
    );
}
