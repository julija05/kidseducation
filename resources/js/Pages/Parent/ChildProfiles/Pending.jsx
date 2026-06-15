import ParentLayout from "@/Layouts/ParentLayout";
import { Head, Link } from "@inertiajs/react";
import { AlertTriangle, Clock, Home, RefreshCcw, XCircle } from "lucide-react";

export default function Pending({ childProfile }) {
    const isRejected = childProfile.status === "rejected" || childProfile.enrollment?.approval_status === "rejected";
    const statusClasses = isRejected
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";
    const StatusIcon = isRejected ? XCircle : Clock;

    return (
        <ParentLayout>
            <Head title={isRejected ? "Application Rejected" : "Waiting for Approval"} />

            <div className="mx-auto max-w-2xl">
                <section className={`rounded-lg border bg-white p-6 text-center shadow-sm ${isRejected ? "border-red-200" : "border-amber-200"}`}>
                    <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-lg ${isRejected ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                        <StatusIcon className="h-7 w-7" />
                    </div>
                    <p className={`mt-5 text-sm font-semibold uppercase ${isRejected ? "text-red-700" : "text-amber-700"}`}>
                        {isRejected ? "Application rejected" : "Waiting for approval"}
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                        {isRejected
                            ? `${childProfile.child_name}'s application was rejected`
                            : `${childProfile.child_name}'s application is pending`}
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
                        {isRejected
                            ? "You can register this child again and submit a new application for review."
                            : `An admin will review the application for ${childProfile.program?.name || "the selected program"}. The child account can access lessons after approval.`}
                    </p>

                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-slate-600">Application status</span>
                            <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses}`}>
                                {childProfile.enrollment?.approval_status || childProfile.status}
                            </span>
                        </div>
                        {isRejected && childProfile.rejection_reason && (
                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm ring-1 ring-red-100">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-700">
                                        <AlertTriangle className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-red-900">Rejection note</p>
                                        <p className="mt-1 text-sm leading-6 text-red-800">{childProfile.rejection_reason}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isRejected && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
                            <p className="text-sm font-semibold text-slate-950">Child login details</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <Credential label="Username" value={childProfile.child_username} />
                                <Credential label="Password" value={childProfile.child_generated_password} />
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {isRejected && (
                            <Link
                                href={route("parent.child-profiles.create", { reregister: childProfile.id })}
                                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Register again
                            </Link>
                        )}
                        <Link
                            href={route("parent.dashboard")}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <Home className="h-4 w-4" />
                            Parent dashboard
                        </Link>
                    </div>
                </section>
            </div>
        </ParentLayout>
    );
}

function Credential({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
            <p className="mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-950">
                {value || "-"}
            </p>
        </div>
    );
}
