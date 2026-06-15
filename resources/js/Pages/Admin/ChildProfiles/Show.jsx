import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2, Mail, User, XCircle } from "lucide-react";

const statusTone = (status) => {
    const tones = {
        pending: "bg-amber-100 text-amber-800",
        approved: "bg-emerald-100 text-emerald-800",
        rejected: "bg-red-100 text-red-800",
        waitlist: "bg-blue-100 text-blue-800",
    };

    return tones[status] || tones.pending;
};

const statusLabel = (status) => {
    const labels = {
        pending: "Pending review",
        approved: "Approved",
        rejected: "Rejected",
        waitlist: "Waitlist",
    };

    return labels[status] || status;
};

export default function Show({ childProfile, programOptions = [], groupOptions = [] }) {
    const approveForm = useForm({
        program_id: childProfile.program_id || childProfile.program?.id || "",
        group_schedule_id: "",
    });
    const rejectForm = useForm({
        rejection_reason: "",
    });

    const filteredGroups = groupOptions.filter((group) => (
        !approveForm.data.program_id || Number(group.program_id) === Number(approveForm.data.program_id)
    ));

    const submitApprove = (event) => {
        event.preventDefault();
        approveForm.post(route("admin.child-profiles.approve", childProfile.id), {
            preserveScroll: true,
        });
    };

    const submitReject = (event) => {
        event.preventDefault();
        rejectForm.post(route("admin.child-profiles.reject", childProfile.id), {
            preserveScroll: true,
        });
    };

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
                            {statusLabel(childProfile.status)}
                        </span>
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-2">
                    <Panel title="Child Details">
                        <Detail label="Name" value={childProfile.child_name} />
                        <Detail label="Age" value={childProfile.age ?? "-"} />
                        <Detail label="Grade/Class" value={childProfile.grade_class || "-"} />
                        <Detail label="Requested program" value={childProfile.program?.name || "-"} />
                        <Detail label="Application status" value={statusLabel(childProfile.status)} />
                        <Detail label="Enrollment status" value={childProfile.enrollment?.approval_status || "-"} capitalize />
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

                {childProfile.status === "pending" && (
                    <section className="grid gap-6 md:grid-cols-2">
                        <Panel title="Approve Application">
                            <form onSubmit={submitApprove} className="space-y-4">
                                <div>
                                    <label htmlFor="program_id" className="text-sm font-medium text-gray-700">
                                        Assigned program
                                    </label>
                                    <select
                                        id="program_id"
                                        value={approveForm.data.program_id}
                                        onChange={(event) => {
                                            approveForm.setData({
                                                ...approveForm.data,
                                                program_id: event.target.value,
                                                group_schedule_id: "",
                                            });
                                        }}
                                        className="mt-1 w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select program</option>
                                        {programOptions.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.name}
                                            </option>
                                        ))}
                                    </select>
                                    {approveForm.errors.program_id && (
                                        <p className="mt-1 text-sm text-red-600">{approveForm.errors.program_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="group_schedule_id" className="text-sm font-medium text-gray-700">
                                        Assigned group
                                    </label>
                                    <select
                                        id="group_schedule_id"
                                        value={approveForm.data.group_schedule_id}
                                        onChange={(event) => approveForm.setData("group_schedule_id", event.target.value)}
                                        className="mt-1 w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">No group assigned yet</option>
                                        {filteredGroups.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.title} - {group.formatted_time} ({group.students_count}/{group.max_students})
                                            </option>
                                        ))}
                                    </select>
                                    {approveForm.errors.group_schedule_id && (
                                        <p className="mt-1 text-sm text-red-600">{approveForm.errors.group_schedule_id}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={approveForm.processing}
                                    className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approve child
                                </button>
                            </form>
                        </Panel>

                        <Panel title="Reject Application">
                            <form onSubmit={submitReject} className="space-y-4">
                                <div>
                                    <label htmlFor="rejection_reason" className="text-sm font-medium text-gray-700">
                                        Rejection reason
                                    </label>
                                    <textarea
                                        id="rejection_reason"
                                        value={rejectForm.data.rejection_reason}
                                        onChange={(event) => rejectForm.setData("rejection_reason", event.target.value)}
                                        rows="5"
                                        className="mt-1 w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    {rejectForm.errors.rejection_reason && (
                                        <p className="mt-1 text-sm text-red-600">{rejectForm.errors.rejection_reason}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={rejectForm.processing}
                                    className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject child
                                </button>
                            </form>
                        </Panel>
                    </section>
                )}

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
