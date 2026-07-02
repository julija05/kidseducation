import AbacusSimulator from "@/Components/AbacusSimulator";
import FlashMessage from "@/Components/FlashMessage";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
    BookOpen,
    Calendar,
    Calculator,
    ChevronDown,
    FileText,
    LayoutDashboard,
    LogOut,
    Mail,
    Menu,
    Settings,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAvatar } from "@/hooks/useAvatar.jsx";

export default function MentorLayout({ children }) {
    const { props, url } = usePage();
    const user = props.auth.user;
    const { t } = useTranslation();
    const { renderAvatar } = useAvatar();
    const [showAbacus, setShowAbacus] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const canUseAbacus = Boolean(user?.can_use_abacus);
    const displayName = user.first_name || user.last_name
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : user.name;

    useEffect(() => {
        setSidebarOpen(false);
        setProfileOpen(false);
    }, [url]);

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setSidebarOpen(false);
                setProfileOpen(false);
            }
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, []);

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
            label: "Groups",
            href: route("mentor.learning-groups.index"),
            icon: Users,
            active: url.startsWith("/mentor/learning-groups"),
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
        <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
            <FlashMessage />

            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close mentor navigation"
                    className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {profileOpen && (
                <button
                    type="button"
                    aria-label="Close profile menu"
                    className="fixed inset-0 z-40 cursor-default bg-transparent"
                    onClick={() => {
                        setProfileOpen(false);
                        setSidebarOpen(false);
                    }}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-900/5 transition-transform duration-300 ease-out lg:w-[260px] lg:translate-x-0 lg:shadow-[4px_0_24px_-20px_rgba(15,23,42,0.28)] ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-5">
                    <Link
                        href={route("mentor.dashboard")}
                        className="flex min-w-0 items-center"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="text-2xl font-bold text-blue-600 transition hover:text-blue-700">
                            Abacoding
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            setSidebarOpen(false);
                            setProfileOpen(false);
                        }}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                        aria-label="Close navigation"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
                    <p className="px-3 text-xs font-semibold text-slate-400">MENTOR WORKSPACE</p>
                    <nav className="mt-4 space-y-1.5" aria-label="Mentor navigation">
                        {navItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    aria-current={item.active ? "page" : undefined}
                                    className={`flex min-h-11 items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                        item.active
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 shrink-0 ${item.active ? "text-blue-600" : "text-slate-400"}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-7 border-t border-slate-100 pt-5">
                        <p className="px-3 text-xs font-semibold text-slate-400">QUICK ACTIONS</p>
                        <div className="mt-3 space-y-2">
                            <Link
                                href={route("mentor.meetings.create")}
                                onClick={() => setSidebarOpen(false)}
                                className="flex w-full items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[13px] font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                            >
                                <Calendar className="h-4 w-4 shrink-0 text-blue-600" />
                                <span>Schedule session</span>
                            </Link>

                            {canUseAbacus && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAbacus(true);
                                        setSidebarOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-[13px] font-medium text-amber-700 transition hover:bg-amber-100"
                                    title="Open Abacus simulator"
                                >
                                    <Calculator className="h-4 w-4 shrink-0 text-amber-600" />
                                    <span>Open abacus</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative z-50 shrink-0 border-t border-slate-200 p-3">
                    {profileOpen && (
                        <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-2xl border border-slate-200 !bg-white p-2 shadow-xl shadow-slate-900/10">
                            <div className="rounded-xl bg-blue-50/60 p-3">
                                <p className="truncate text-sm font-semibold !text-slate-900">{displayName}</p>
                                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </p>
                                <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    {user.email_verified_at ? "Verified mentor" : "Mentor account"}
                                </span>
                            </div>

                            <Link
                                href={route("mentor.profile.edit")}
                                className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                            >
                                <Settings className="h-4 w-4 text-slate-400" />
                                {label("nav.profile_settings", "Profile settings")}
                            </Link>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                {label("nav.log_out", "Sign out")}
                            </Link>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setProfileOpen((open) => !open)}
                        className="flex w-full appearance-none items-center gap-3 rounded-xl border border-slate-200 !bg-white p-2.5 text-left !text-slate-900 shadow-sm transition hover:border-blue-200 hover:!bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        aria-expanded={profileOpen}
                        aria-label="Open mentor profile menu"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold !text-blue-700 ring-1 ring-blue-200">
                            {displayName?.charAt(0)?.toUpperCase() || "M"}
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                            <span className="block truncate text-sm font-semibold !text-slate-900">{displayName}</span>
                            <span className="mt-1 block text-xs font-medium text-slate-500">Mentor</span>
                        </span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${profileOpen ? "rotate-180" : ""}`} />
                    </button>
                </div>
            </aside>

            <div className="min-h-screen min-w-0 lg:pl-[260px]">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                        aria-label="Open mentor navigation"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <Link href={route("mentor.dashboard")}>
                        <span className="text-xl font-bold text-blue-600 transition hover:text-blue-700">
                            Abacoding
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            setSidebarOpen(true);
                            setProfileOpen(true);
                        }}
                        className="rounded-lg bg-slate-50 p-0.5 ring-1 ring-slate-200"
                        aria-label="Open mentor profile menu"
                    >
                        {renderAvatar("w-9 h-9", "text-sm", displayName?.charAt(0)?.toUpperCase() || "M")}
                    </button>
                </header>

                <main className="mx-auto min-w-0 w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>

            <AbacusSimulator isOpen={showAbacus} onClose={() => setShowAbacus(false)} />
        </div>
    );
}
