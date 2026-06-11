import AbacusSimulator from "@/Components/AbacusSimulator";
import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    BookOpen,
    Calendar,
    Calculator,
    ChevronDown,
    FileText,
    LayoutDashboard,
    LogOut,
    Mail,
    Settings,
    ShieldCheck,
    Users,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAvatar } from "@/hooks/useAvatar.jsx";

export default function MentorLayout({ children }) {
    const { props, url } = usePage();
    const user = props.auth.user;
    const { t } = useTranslation();
    const { renderAvatar } = useAvatar();
    const [showAbacus, setShowAbacus] = useState(false);

    const canUseAbacus = Boolean(user?.can_use_abacus);
    const displayName = user.first_name || user.last_name
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : user.name;

    const label = (key, fallback) => {
        const translated = t(key);

        return translated === key ? fallback : translated;
    };

    const navItems = [
        {
            label: "Overview",
            href: route("mentor.dashboard"),
            icon: LayoutDashboard,
            active: url.startsWith("/mentor/dashboard"),
        },
        {
            label: "Meetings",
            href: route("mentor.meetings.index"),
            icon: Calendar,
            active: url.startsWith("/mentor/meetings"),
        },
        {
            label: "Programs",
            href: route("mentor.proposals.programs.my-programs"),
            icon: BookOpen,
            active: url.startsWith("/mentor/programs") || url.includes("/mentor/proposals/programs"),
        },
        {
            label: "Proposals",
            href: route("mentor.proposals.index"),
            icon: FileText,
            active: url.startsWith("/mentor/proposals") && !url.includes("/mentor/proposals/programs"),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
                        <Link href={route("mentor.dashboard")} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-base font-semibold leading-tight">Mentor Panel</p>
                                <p className="text-xs text-slate-500">Students, lessons, and meetings</p>
                            </div>
                        </Link>

                        <nav className="order-3 flex w-full gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1 md:order-2 md:w-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                                            item.active
                                                ? "bg-white text-slate-950 shadow-sm"
                                                : "text-slate-600 hover:bg-white hover:text-slate-950"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="order-2 flex items-center gap-2 md:order-3">
                            {canUseAbacus && (
                                <button
                                    type="button"
                                    onClick={() => setShowAbacus(true)}
                                    className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                                    title="Open Abacus simulator"
                                >
                                    <Calculator className="h-4 w-4" />
                                    <span className="hidden sm:inline">Abacus</span>
                                </button>
                            )}

                            <Link
                                href={route("mentor.meetings.create")}
                                className="hidden items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:inline-flex"
                            >
                                <Calendar className="h-4 w-4" />
                                Schedule
                            </Link>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                                        <span className="rounded-md bg-slate-50 p-0.5 ring-1 ring-slate-200">
                                            {renderAvatar("w-8 h-8", "text-sm", displayName?.charAt(0)?.toUpperCase() || "M")}
                                        </span>
                                        <span className="hidden min-w-0 flex-col items-start leading-tight md:flex">
                                            <span className="max-w-36 truncate font-semibold text-slate-900">{displayName}</span>
                                            <span className="text-[11px] font-medium text-slate-500">Mentor</span>
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-slate-500" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content contentClasses="bg-white p-2">
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-white p-1 ring-1 ring-slate-200">
                                                {renderAvatar("w-12 h-12", "text-xl", displayName?.charAt(0)?.toUpperCase() || "M")}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                                                <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-600">
                                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{user.email}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                Mentor account
                                            </span>
                                            <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                                {user.email_verified_at ? "Email verified" : "Email pending"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 space-y-1">
                                        <Link
                                            href="/mentor/profile"
                                            className="flex w-full items-center rounded-lg border border-transparent px-3 py-2.5 text-left text-sm font-semibold text-slate-900 transition hover:border-slate-200 hover:bg-slate-50"
                                        >
                                            <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                                                <Settings className="h-4 w-4" />
                                            </span>
                                            <span className="flex min-w-0 flex-col">
                                                <span>{label("nav.profile_settings", "Profile settings")}</span>
                                                <span className="text-xs font-medium text-slate-600">Account, language, and security</span>
                                            </span>
                                        </Link>
                                    </div>

                                    <div className="mt-2 border-t border-slate-100 pt-2">
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center rounded-lg border border-transparent px-3 py-2.5 text-left text-sm font-semibold text-slate-900 transition hover:border-slate-200 hover:bg-slate-50"
                                        >
                                            <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                                                <LogOut className="h-4 w-4" />
                                            </span>
                                            <span className="flex min-w-0 flex-col">
                                                <span>{label("nav.log_out", "Sign out")}</span>
                                                <span className="text-xs font-medium text-slate-600">End this mentor session</span>
                                            </span>
                                        </Link>
                                    </div>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>

            <AbacusSimulator isOpen={showAbacus} onClose={() => setShowAbacus(false)} />
        </div>
    );
}
