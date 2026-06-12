import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Mail,
    Settings,
    Users,
} from "lucide-react";

export default function ParentLayout({ children }) {
    const { props, url } = usePage();
    const user = props.auth.user;
    const displayName = user.first_name || user.last_name
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : user.name;
    const initial = displayName?.charAt(0)?.toUpperCase() || "P";

    const navItems = [
        {
            label: "Dashboard",
            href: route("parent.dashboard"),
            icon: LayoutDashboard,
            active: url.startsWith("/parent/dashboard"),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
                        <Link href={route("parent.dashboard")} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-base font-semibold leading-tight">Parent Dashboard</p>
                                <p className="text-xs text-slate-500">Children and learning progress</p>
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

                        <div className="order-2 md:order-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
                                            {initial}
                                        </span>
                                        <span className="hidden min-w-0 flex-col items-start leading-tight md:flex">
                                            <span className="max-w-36 truncate font-semibold text-slate-900">{displayName}</span>
                                            <span className="text-[11px] font-medium text-slate-500">Parent</span>
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-slate-500" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content contentClasses="bg-white p-2">
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                        <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </p>
                                    </div>

                                    <div className="mt-2 space-y-1">
                                        <Link
                                            href={route("profile.edit")}
                                            className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                                        >
                                            <Settings className="mr-3 h-4 w-4 text-slate-500" />
                                            Profile settings
                                        </Link>
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                                        >
                                            <LogOut className="mr-3 h-4 w-4 text-slate-500" />
                                            Sign out
                                        </Link>
                                    </div>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}
