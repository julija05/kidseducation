import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    Users,
    BookOpen,
    TrendingUp,
    Clock,
    AlertCircle,
    Plus,
    FileText,
    ChevronRight,
} from "lucide-react";

// Badge styling + label for each enrollment approval status.
const STATUS_STYLES = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
    approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Rejected", className: "bg-rose-100 text-rose-700" },
    blocked: { label: "Blocked", className: "bg-gray-200 text-gray-600" },
};

// Rotating avatar background colors for the recent-enrollments list.
const AVATAR_COLORS = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
];

// Returns up-to-two-letter uppercase initials for a person's name.
const getInitials = (name) =>
    (name || "?")
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

export default function AdminDashboard() {
    const {
        pendingEnrollmentsCount = 0,
        stats = {},
        recentEnrollments = [],
    } = usePage().props;

    // Summary cards shown at the top of the dashboard.
    const summaryCards = [
        {
            label: "Total Students",
            value: stats.totalStudents || 0,
            icon: Users,
            iconClass: "bg-blue-100 text-blue-600",
        },
        {
            label: "Active Programs",
            value: stats.activePrograms || 0,
            icon: BookOpen,
            iconClass: "bg-emerald-100 text-emerald-600",
        },
        {
            label: "Active Enrollments",
            value: stats.activeEnrollments || 0,
            icon: TrendingUp,
            iconClass: "bg-violet-100 text-violet-600",
        },
    ];

    // Primary shortcuts for the most common admin tasks.
    const quickActions = [
        {
            label: "Review enrollments",
            href: route("admin.enrollments.pending"),
            icon: Clock,
            iconClass: "bg-amber-100 text-amber-600",
        },
        {
            label: "Add new program",
            href: route("admin.programs.create"),
            icon: Plus,
            iconClass: "bg-blue-100 text-blue-600",
        },
        {
            label: "Manage lessons & resources",
            href: route("admin.resources.index"),
            icon: FileText,
            iconClass: "bg-violet-100 text-violet-600",
        },
    ];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        An overview of your platform at a glance.
                    </p>
                </div>

                {/* Pending Enrollments Alert */}
                {pendingEnrollmentsCount > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <div className="flex items-start sm:items-center flex-1 mb-3 sm:mb-0">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-amber-800">
                                        Pending Enrollments
                                    </h3>
                                    <p className="mt-0.5 text-sm text-amber-700">
                                        {pendingEnrollmentsCount} enrollment
                                        {pendingEnrollmentsCount > 1 ? "s are" : " is"}{" "}
                                        waiting for your approval.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route("admin.enrollments.pending")}
                                className="w-full sm:w-auto sm:ml-4 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium text-center transition-colors"
                            >
                                Review Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-center">
                                    <div
                                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="ml-4 min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-500 truncate">
                                            {card.label}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 tabular-nums">
                                            {card.value}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Actions + Recent Enrollments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </h2>
                        <div className="space-y-2.5">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="group flex items-center rounded-lg border border-gray-100 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50"
                                    >
                                        <div
                                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${action.iconClass}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="ml-3 flex-1 text-sm font-medium text-gray-800">
                                            {action.label}
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-500" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Enrollments */}
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-gray-900">
                                Recent Enrollments
                            </h2>
                            <Link
                                href={route("admin.enrollments.index")}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                View all
                            </Link>
                        </div>

                        {recentEnrollments.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {recentEnrollments.map((enrollment, index) => {
                                    const status =
                                        STATUS_STYLES[enrollment.status] ||
                                        STATUS_STYLES.pending;
                                    const avatarColor =
                                        AVATAR_COLORS[index % AVATAR_COLORS.length];
                                    return (
                                        <li
                                            key={enrollment.id}
                                            className="flex items-center py-3"
                                        >
                                            <span
                                                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor}`}
                                            >
                                                {getInitials(enrollment.student_name)}
                                            </span>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {enrollment.student_name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {enrollment.program_name}
                                                </p>
                                            </div>
                                            <span
                                                className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                                            >
                                                {status.label}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="py-10 text-center">
                                <Users className="mx-auto h-8 w-8 text-gray-300" />
                                <p className="mt-2 text-sm text-gray-500">
                                    No enrollments yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
