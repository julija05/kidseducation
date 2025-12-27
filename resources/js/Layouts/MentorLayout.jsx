import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { User, ChevronDown, GraduationCap, BookOpen, Settings, Calendar, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { useAvatar } from "@/hooks/useAvatar.jsx";
import { useRouteWithLocale } from "@/Utils/routeHelpers";

export default function MentorLayout({ children }) {
    const { props } = usePage();
    const user = props.auth.user;
    const { t } = useTranslation();
    const { avatarData, renderAvatar } = useAvatar();
    const { routeWithLocale } = useRouteWithLocale();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            {/* Navigation Bar */}
            <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            {/* Logo */}
                            <Link
                                href={route("mentor.dashboard")}
                                className="flex items-center"
                            >
                                <GraduationCap className="w-8 h-8 text-emerald-600" />
                                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    {t("nav.mentor_panel") || "Mentor Panel"}
                                </span>
                            </Link>

                            {/* Navigation Links */}
                            <div className="hidden md:ml-10 md:flex md:space-x-8">
                                <Link
                                    href={route("mentor.dashboard")}
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    {t("nav.dashboard") || "Dashboard"}
                                </Link>
                                <Link
                                    href={route("mentor.meetings.index")}
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Meetings
                                </Link>
                                <Link
                                    href={route("mentor.proposals.programs.my-programs")}
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    My Programs
                                </Link>
                            </div>
                        </div>

                        {/* User Dropdown */}
                        <div className="flex items-center">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center text-sm font-medium text-gray-700 hover:text-emerald-600 focus:outline-none transition duration-150 ease-in-out">
                                        <div className="mr-2">
                                            {renderAvatar({ size: "sm" })}
                                        </div>
                                        <span className="hidden md:block">
                                            {user.name}
                                        </span>
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route("profile.edit")}
                                        className="flex items-center"
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        {t("nav.profile_settings")}
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                    >
                                        {t("nav.logout")}
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="py-8">
                {children}
            </main>

            {/* Footer (optional) */}
            <footer className="bg-white/50 backdrop-blur-lg border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-gray-600">
                        {t("footer.copyright", {
                            year: new Date().getFullYear(),
                        })}
                    </p>
                </div>
            </footer>
        </div>
    );
}
