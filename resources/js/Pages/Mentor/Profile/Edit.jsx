import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    FileText,
    Globe,
    Lock,
    Mail,
    Settings,
    Shield,
    Trash2,
    User,
    Users,
} from "lucide-react";
import DeleteUserForm from "@/Pages/Profile/Partials/DeleteUserForm";
import UpdateLanguagePreferenceForm from "@/Pages/Profile/Partials/UpdateLanguagePreferenceForm";
import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "@/Pages/Profile/Partials/UpdateProfileInformationForm";
import { useAvatar } from "@/hooks/useAvatar";

export default function Edit({ mustVerifyEmail, status, mentorStats = {} }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const { renderAvatar } = useAvatar();

    const displayName = user.first_name || user.last_name
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : user.name;

    return (
        <MentorLayout>
            <Head title="Mentor Profile Settings" />

            <div className="space-y-6">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <Link
                        href={route("mentor.dashboard")}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to mentor dashboard
                    </Link>

                    <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                                {renderAvatar("w-16 h-16", "text-3xl", displayName?.charAt(0)?.toUpperCase() || "M")}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Mentor account</p>
                                <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                                    {displayName}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail className="h-4 w-4" />
                                        {user.email}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                        <Shield className="h-3.5 w-3.5" />
                                        Mentor
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            {user.email_verified_at ? "Email verified" : "Email verification pending"}
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Metric
                            icon={BookOpen}
                            label="Teaching programs"
                            value={mentorStats.teaching_programs ?? 0}
                        />
                        <Metric
                            icon={Users}
                            label="Assigned students"
                            value={mentorStats.assigned_students ?? 0}
                        />
                        <Metric
                            icon={Calendar}
                            label="Scheduled meetings"
                            value={mentorStats.scheduled_meetings ?? 0}
                        />
                        <Metric
                            icon={FileText}
                            label="Pending proposals"
                            value={mentorStats.pending_proposals ?? 0}
                        />
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="space-y-3">
                        <ProfileNavItem icon={User} label="Profile information" />
                        <ProfileNavItem icon={Globe} label="Language" />
                        <ProfileNavItem icon={Lock} label="Password" />
                        <ProfileNavItem icon={Trash2} label="Account removal" danger />
                    </aside>

                    <div className="space-y-6">
                        <ProfilePanel icon={Settings} title="Profile Information">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </ProfilePanel>

                        <ProfilePanel icon={Globe} title="Language Preference">
                            <UpdateLanguagePreferenceForm />
                        </ProfilePanel>

                        <ProfilePanel icon={Lock} title="Password">
                            <UpdatePasswordForm />
                        </ProfilePanel>

                        <ProfilePanel icon={Trash2} title="Danger Zone" danger>
                            <DeleteUserForm />
                        </ProfilePanel>
                    </div>
                </div>
            </div>
        </MentorLayout>
    );
}

function ProfileNavItem({ icon: Icon, label, danger = false }) {
    return (
        <div
            className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm font-medium ${
                danger
                    ? "border-red-100 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white text-slate-700"
            }`}
        >
            <Icon className="h-4 w-4" />
            {label}
        </div>
    );
}

function ProfilePanel({ icon: Icon, title, children, danger = false }) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-md ${
                        danger ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"
                    }`}
                >
                    <Icon className="h-4 w-4" />
                </div>
                <h2 className="font-semibold text-slate-950">{title}</h2>
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

function Metric({ icon: Icon, label, value }) {
    return (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-600">{label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-700 ring-1 ring-slate-200">
                    <Icon className="h-4 w-4" />
                </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
    );
}
