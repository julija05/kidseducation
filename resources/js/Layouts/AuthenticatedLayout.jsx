import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { User } from "lucide-react";

export default function AuthenticatedLayout({
    children,
    programConfig = null,
    showSideNavigation = false,
    customHeader = null,
}) {
    const { props } = usePage();
    const user = props.auth.user;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Default theme configuration if no program config is provided
    const defaultTheme = {
        name: "Dashboard",
        color: "bg-gray-700",
        lightColor: "bg-gray-50",
        borderColor: "border-gray-500",
        textColor: "text-gray-700",
    };

    const theme = programConfig || defaultTheme;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className={`${theme.color} text-white shadow-lg`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {customHeader ? (
                                customHeader
                            ) : (
                                <>
                                    <User className="mr-3" size={32} />
                                    <h1 className="text-2xl font-bold">
                                        {theme.name}
                                    </h1>
                                </>
                            )}
                        </div>

                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="flex items-center space-x-4 text-white hover:opacity-90 transition-opacity"
                                        >
                                            <div className="text-right">
                                                <p className="text-sm opacity-90">
                                                    Welcome back,
                                                </p>
                                                <p className="font-semibold">
                                                    {user.name}
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                                <User size={20} />
                                            </div>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route("profile.edit")}>
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
        </div>
    );
}
