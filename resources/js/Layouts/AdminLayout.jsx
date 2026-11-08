import { Link, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import FlashMessage from "@/Components/FlashMessage";
import Notifications from "@/Components/Admin/Notifications";
import ChatNotifications from "@/Components/Admin/ChatNotifications";
import { Menu, X, Home, BookOpen, FileText, Users, UserCog, LogOut, GraduationCap, CreditCard } from "lucide-react";

export default function AdminLayout({ children }) {
    const { auth, notifications } = usePage().props;
    const currentPath = usePage().url.split("?")[0];
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Mark a single notification as read without a full page reload.
    const handleMarkAsRead = (notificationId) => {
        router.patch(`/admin/notifications/${notificationId}/read`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // Mark every notification as read without a full page reload.
    const handleMarkAllAsRead = () => {
        router.patch('/admin/notifications/mark-all-read', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // Core admin navigation for the MVP. Paused areas (mentors, parents,
    // live classes, news, quizzes, etc.) are intentionally hidden from the
    // nav; their routes still exist and will be feature-flagged separately.
    const menuItems = [
        {
            name: "Dashboard",
            href: route("admin.dashboard"),
            icon: Home
        },
        {
            name: "Programs",
            href: route("admin.programs.index"),
            icon: BookOpen
        },
        {
            name: "Lessons & Resources",
            href: route("admin.resources.index"),
            icon: FileText
        },
        {
            name: "Enrollments",
            href: route("admin.enrollments.index"),
            icon: Users
        },
        {
            name: "Payments",
            href: route("admin.payments.index"),
            icon: CreditCard
        },
        {
            name: "User Management",
            href: route("admin.users.index"),
            icon: UserCog
        }
    ];

    // Resolve whether a nav item points at the page currently being viewed.
    // The Dashboard matches exactly; every other item also matches its
    // sub-pages (e.g. "Programs" stays active on /admin/programs/create).
    const isActive = (href) => {
        const path = href.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
        return currentPath === path || currentPath.startsWith(path + "/");
    };

    // Up-to-two-letter initials for the signed-in admin's avatar.
    const userInitials = (auth.user.name || "")
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className="h-screen overflow-hidden bg-gray-100 flex">
            {/* Flash Messages - positioned above everything */}
            <FlashMessage />

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {/* Brand */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-900/40">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </span>
                        <div className="leading-tight">
                            <div className="text-sm font-bold">Abacoding</div>
                            <div className="text-[11px] text-gray-400">Admin Panel</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                    active
                                        ? "bg-white/10 text-white"
                                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                                }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {active && (
                                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-400" />
                                )}
                                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? "text-indigo-300" : "text-gray-400"}`} />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="border-t border-white/10 p-3">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                            {userInitials}
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-white">{auth.user.name}</div>
                            <div className="text-[11px] text-gray-400">Administrator</div>
                        </div>
                    </div>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="mt-1 flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile header */}
                <div className="lg:hidden">
                    <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
                                <div className="text-xs text-gray-500 truncate max-w-[120px]">{auth.user.name}</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <ChatNotifications />
                            <Notifications
                                notifications={notifications?.recent || []}
                                unreadCount={notifications?.unread_count || 0}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAllAsRead={handleMarkAllAsRead}
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop header */}
                <header className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200 px-6 h-16 justify-between items-center">
                    <div className="text-gray-600">
                        Welcome back,{" "}
                        <span className="font-semibold text-gray-900">{auth.user.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ChatNotifications />
                        <Notifications
                            notifications={notifications?.recent || []}
                            unreadCount={notifications?.unread_count || 0}
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAllAsRead={handleMarkAllAsRead}
                        />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 min-h-0 overflow-hidden">
                    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
