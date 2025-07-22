import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    Users,
    BookOpen,
    DollarSign,
    Clock,
    TrendingUp,
    AlertCircle,
    FileText,
    Video,
    HelpCircle,
} from "lucide-react";

export default function AdminDashboard() {
    const { pendingEnrollmentsCount = 0, stats = {} } = usePage().props;

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Admin Dashboard
                </h1>

                {/* Pending Enrollments Alert */}
                {pendingEnrollmentsCount > 0 && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Pending Enrollments
                                </h3>
                                <p className="mt-1 text-sm text-yellow-700">
                                    You have {pendingEnrollmentsCount}{" "}
                                    enrollment
                                    {pendingEnrollmentsCount > 1
                                        ? "s"
                                        : ""}{" "}
                                    waiting for approval.
                                </p>
                            </div>
                            <Link
                                href={route("admin.enrollments.pending")}
                                className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                            >
                                Review Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Total Students
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.totalStudents || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                <BookOpen className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Active Programs
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.activePrograms || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Pending Enrollments
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {pendingEnrollmentsCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Active Enrollments
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.activeEnrollments || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Updated with Resources */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <Link
                            href={route("admin.enrollments.pending")}
                            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <span className="text-sm font-medium text-gray-900">
                                Review Enrollments
                            </span>
                        </Link>
                        <Link
                            href={route("admin.programs.create")}
                            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <span className="text-sm font-medium text-gray-900">
                                Add Program
                            </span>
                        </Link>
                        <Link
                            href={route("admin.enrollments.index")}
                            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <span className="text-sm font-medium text-gray-900">
                                All Enrollments
                            </span>
                        </Link>
                        <Link
                            href={route("admin.programs.index")}
                            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                            <span className="text-sm font-medium text-gray-900">
                                Manage Programs
                            </span>
                        </Link>
                        <Link
                            href={route("admin.resources.index")}
                            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 relative"
                        >
                            <FileText className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                            <span className="text-sm font-medium text-gray-900">
                                Manage Resources
                            </span>
                            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                New
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Resources Overview Section */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">
                            Learning Resources Overview
                        </h2>
                        <Link
                            href={route("admin.resources.index")}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            View All Resources →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <Video className="h-8 w-8 text-red-600 mr-3" />
                                <div>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats.totalVideos || 0}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Video Resources
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats.totalDocuments || 0}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Documents
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <HelpCircle className="h-8 w-8 text-indigo-600 mr-3" />
                                <div>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {stats.totalQuizzes || 0}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Quizzes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> You can now easily add YouTube
                            videos, documents, quizzes, and other resources to
                            any lesson directly from the Resources Management
                            page.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
