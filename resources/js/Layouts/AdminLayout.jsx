import { Link, usePage } from "@inertiajs/react";
import FlashMessage from "@/Components/FlashMessage";

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="flex h-screen">
            {/* Flash Messages - positioned above everything */}
            <FlashMessage />

            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white p-6">
                <h2 className="text-lg font-bold mb-6">Admin Panel</h2>
                <ul>
                    <li className="mb-4">
                        <Link
                            href={route("admin.dashboard")}
                            className="hover:text-gray-300 transition-colors"
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link
                            href={route("admin.programs.index")}
                            className="hover:text-gray-300 transition-colors"
                        >
                            Programs
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link
                            href={route("admin.news.index")}
                            className="hover:text-gray-300 transition-colors"
                        >
                            News
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link
                            href={route("admin.quizzes.index")}
                            className="hover:text-gray-300 transition-colors"
                        >
                            Quizzes
                        </Link>
                    </li>
                </ul>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Top navbar */}
                <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
                    <div className="text-gray-700">
                        Welcome,{" "}
                        <span className="font-semibold">{auth.user.name}</span>
                    </div>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="text-red-600 hover:text-red-800 hover:underline transition-colors"
                    >
                        Logout
                    </Link>
                </nav>

                {/* Page content */}
                <main className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
