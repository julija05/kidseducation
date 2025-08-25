import { Link, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import FlashMessage from "@/Components/FlashMessage";
import Notifications from "@/Components/Admin/Notifications";
import ChatNotifications from "@/Components/Admin/ChatNotifications";
import { Menu, X, Home, BookOpen, FileText, Users, Calendar, MessageSquare, Settings, LogOut, Bell, ChevronDown } from "lucide-react";

export default function AdminLayout({ children }) {
    const { auth, notifications } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleMarkAsRead = (notificationId) => {
        router.patch(`/admin/notifications/${notificationId}/read`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleMarkAllAsRead = () => {
        router.patch('/admin/notifications/mark-all-read', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

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
            name: "News", 
            href: route("admin.news.index"), 
            icon: FileText 
        },
        { 
            name: "Articles & Guides", 
            href: route("admin.articles.index"), 
            icon: FileText 
        },
        { 
            name: "Quizzes", 
            href: route("admin.quizzes.index"), 
            icon: FileText 
        },
        { 
            name: "Class Schedules", 
            href: route("admin.class-schedules.index"), 
            icon: Calendar 
        },
        { 
            name: "Enrollments", 
            href: route("admin.enrollments.index"), 
            icon: Users 
        },
        { 
            name: "User Management", 
            href: route("admin.users.index"), 
            icon: Users 
        },
        { 
            name: "Live Chat Support", 
            href: route("admin.chat.index"), 
            icon: MessageSquare 
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Flash Messages - positioned above everything */}
            <FlashMessage />

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-700 lg:p-6">
                    <h2 className="text-lg font-bold">Admin Panel</h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <nav className="flex-1 px-4 py-4 space-y-2 lg:px-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center px-3 py-3 text-sm font-medium rounded-md hover:bg-gray-700 hover:text-white transition-colors group"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile logout button in sidebar */}
                <div className="lg:hidden px-4 py-4 border-t border-gray-700">
                    <div className="mb-3 px-3 py-2">
                        <div className="text-sm font-medium text-gray-300">Logged in as:</div>
                        <div className="text-sm text-white truncate">{auth.user.name}</div>
                    </div>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="flex items-center w-full px-3 py-3 text-sm font-medium rounded-md text-red-300 hover:bg-red-900/20 hover:text-red-200 transition-colors group"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:ml-0">
                {/* Mobile header */}
                <div className="lg:hidden">
                    <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-medium text-gray-900">Admin</h1>
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
                <nav className="hidden lg:flex bg-white border-b px-6 py-4 justify-between items-center shadow-sm">
                    <div className="text-gray-700">
                        Welcome,{" "}
                        <span className="font-semibold">{auth.user.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ChatNotifications />
                        <Notifications
                            notifications={notifications?.recent || []}
                            unreadCount={notifications?.unread_count || 0}
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAllAsRead={handleMarkAllAsRead}
                        />
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="text-red-600 hover:text-red-800 hover:underline transition-colors"
                        >
                            Logout
                        </Link>
                    </div>
                </nav>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
