import { Link, usePage } from "@inertiajs/react";

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white p-6">
                <h2 className="text-lg font-bold mb-6">Admin Panel</h2>
                <ul>
                    <li className="mb-4">
                        <Link href={route("admin.dashboard")}>Dashboard</Link>
                    </li>
                    <li className="mb-4">
                        <Link href={route("admin.programs.index")}>
                            Programs
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link href="#">News</Link>
                    </li>
                </ul>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Top navbar */}
                <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>Welcome, {auth.user.name}</div>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="text-red-600 hover:underline"
                    >
                        Logout
                    </Link>
                </nav>

                {/* Page content */}
                <main className="p-6 overflow-y-auto flex-1">{children}</main>
            </div>
        </div>
    );
}
