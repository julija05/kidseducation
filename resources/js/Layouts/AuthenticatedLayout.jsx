import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { User, ChevronDown } from "lucide-react";

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

    // Debug logging
    console.log("AuthenticatedLayout theme:", theme);
    console.log("Program config:", programConfig);

    // Ensure we have a valid background color class
    const headerBgClass =
        theme.color && theme.color.startsWith("bg-")
            ? theme.color
            : "bg-gray-700";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className={`${headerBgClass} text-white shadow-lg`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {customHeader ? (
                                customHeader
                            ) : (
                                <>
                                    <User
                                        className="mr-3 text-white"
                                        size={32}
                                    />
                                    <Link 
                                        href={route("dashboard")}
                                        className="text-2xl font-bold text-white hover:text-gray-200 transition-colors"
                                    >
                                        {theme.name}
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* User Dropdown - Fixed with better visibility */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 border-2 border-white border-opacity-30 hover:border-opacity-50 shadow-sm"
                                        >
                                            <div className="text-right">
                                                <p className="text-xs opacity-90">
                                                    Welcome back,
                                                </p>
                                                <p className="font-semibold text-sm text-white">
                                                    {user.name}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center border border-white border-opacity-20">
                                                <User
                                                    size={16}
                                                    className="text-white"
                                                />
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className="opacity-90 text-white"
                                            />
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route("dashboard")}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Dashboard
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route("profile.edit")}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Profile Settings
                                    </Dropdown.Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
