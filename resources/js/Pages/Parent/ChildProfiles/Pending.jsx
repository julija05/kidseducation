import ParentLayout from "@/Layouts/ParentLayout";
import { Head, Link } from "@inertiajs/react";
import { Clock, Home } from "lucide-react";

export default function Pending({ childProfile }) {
    return (
        <ParentLayout>
            <Head title="Waiting for Approval" />

            <div className="mx-auto max-w-2xl">
                <section className="rounded-lg border border-amber-200 bg-white p-6 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                        <Clock className="h-7 w-7" />
                    </div>
                    <p className="mt-5 text-sm font-semibold uppercase text-amber-700">Waiting for approval</p>
                    <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                        {childProfile.child_name}'s application is pending
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
                        An admin will review the application for {childProfile.program?.name || "the selected program"}.
                        The child account can access lessons after approval.
                    </p>

                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-slate-600">Application status</span>
                            <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold capitalize text-amber-800">
                                {childProfile.enrollment?.approval_status || childProfile.status}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
                        <p className="text-sm font-semibold text-slate-950">Child login details</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Credential label="Username" value={childProfile.child_username} />
                            <Credential label="Password" value={childProfile.child_generated_password} />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Link
                            href={route("parent.dashboard")}
                            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
