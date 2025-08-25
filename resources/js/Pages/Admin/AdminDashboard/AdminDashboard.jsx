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
    Calendar,
    User,
    MapPin,
    ExternalLink,
} from "lucide-react";

export default function AdminDashboard() {
    const { pendingEnrollmentsCount = 0, stats = {}, nextScheduledLesson = null } = usePage().props;

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="max-w-7xl mx-auto">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>
                </div>

                {/* Next Scheduled Lesson */}
                {nextScheduledLesson && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 mb-4 sm:mb-0">
                                <div className="flex items-center mb-3">
                                    <Calendar className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                                    <h3 className="text-lg font-semibold text-blue-900">
                                        Next Lesson
                                    </h3>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center text-blue-800">
                                        <div className="flex items-center mb-1 sm:mb-0">
                                            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span className="font-medium text-sm sm:text-base">
                                                {nextScheduledLesson.day_description} at {nextScheduledLesson.time_only}
                                            </span>
                                        </div>
                                        <span className="text-xs sm:text-sm text-blue-600 sm:ml-2">
                                            ({nextScheduledLesson.duration})
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center text-blue-800">
                                        <User className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm sm:text-base">with <strong>{nextScheduledLesson.student_name}</strong></span>
                                    </div>
                                    
                                    <div className="text-blue-900">
                                        <p className="font-medium text-sm sm:text-base">
                                            {nextScheduledLesson.title}
                                        </p>
                                        {nextScheduledLesson.lesson_name && (
                                            <p className="text-xs sm:text-sm text-blue-700 mt-1">
                                                Lesson: {nextScheduledLesson.lesson_name}
                                            </p>
                                        )}
                                        {nextScheduledLesson.program_name && (
                                            <p className="text-xs sm:text-sm text-blue-700">
                                                Program: {nextScheduledLesson.program_name}
                                            </p>
                                        )}
                                        {nextScheduledLesson.description && (
                                            <p className="text-xs sm:text-sm text-blue-700 mt-1">
                                                {nextScheduledLesson.description}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {(nextScheduledLesson.location || nextScheduledLesson.meeting_link) && (
                                        <div className="flex items-center text-blue-800 mt-2">
                                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">{nextScheduledLesson.location || 'Online'}</span>
                                            {nextScheduledLesson.meeting_link && (
                                                <a
                                                    href={nextScheduledLesson.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-blue-600 hover:text-blue-800 flex items-center p-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <Link
                                href={route("admin.class-schedules.show", nextScheduledLesson.id)}
                                className="w-full sm:w-auto sm:ml-4 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center min-h-[44px] flex items-center justify-center"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pending Enrollments Alert */}
                {pendingEnrollmentsCount > 0 && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <div className="flex items-start sm:items-center flex-1 mb-3 sm:mb-0">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Pending Enrollments
                                    </h3>
                                    <p className="mt-1 text-sm text-yellow-700">
                                        You have {pendingEnrollmentsCount}{" "}
                                        enrollment
                                        {pendingEnrollmentsCount > 1 ? "s" : ""}{" "}
                                        waiting for approval.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route("admin.enrollments.pending")}
                                className="w-full sm:w-auto sm:ml-4 px-4 py-3 sm:py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium text-center min-h-[44px] flex items-center justify-center"
                            >
                                Review Now
                            </Link>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2 sm:p-3">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            </div>
                            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                    Total Students
                                </p>
                                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                    {stats.totalStudents || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-lg p-2 sm:p-3">
                                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                            </div>
                            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                    Active Programs
                                </p>
                                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                    {stats.activePrograms || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-2 sm:p-3">
                                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                            </div>
                            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                    Pending Enrollments
                                </p>
                                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                    {pendingEnrollmentsCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-2 sm:p-3">
                                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                            </div>
                            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                    Active Enrollments
                                </p>
                                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                    {stats.activeEnrollments || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Updated with Resources */}
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                        <Link
                            href={route("admin.enrollments.pending")}
                            className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[80px] sm:min-h-[88px] flex flex-col items-center justify-center"
                        >
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mx-auto mb-1 sm:mb-2" />
                            <span className="text-xs sm:text-sm font-medium text-gray-900 text-center leading-tight">
                                Review Enrollments
                            </span>
                        </Link>
                        <Link
                            href={route("admin.programs.create")}
                            className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[80px] sm:min-h-[88px] flex flex-col items-center justify-center"
                        >
                            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
                            <span className="text-xs sm:text-sm font-medium text-gray-900 text-center leading-tight">
                                Add Program
                            </span>
                        </Link>
                        <Link
                            href={route("admin.enrollments.index")}
                            className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[80px] sm:min-h-[88px] flex flex-col items-center justify-center"
                        >
                            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                            <span className="text-xs sm:text-sm font-medium text-gray-900 text-center leading-tight">
                                All Enrollments
                            </span>
                        </Link>
                        <Link
                            href={route("admin.programs.index")}
                            className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[80px] sm:min-h-[88px] flex flex-col items-center justify-center"
                        >
                            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
                            <span className="text-xs sm:text-sm font-medium text-gray-900 text-center leading-tight">
                                Manage Programs
                            </span>
                        </Link>
                        <Link
                            href={route("admin.resources.index")}
                            className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative min-h-[80px] sm:min-h-[88px] flex flex-col items-center justify-center col-span-2 sm:col-span-1"
                        >
                            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mx-auto mb-1 sm:mb-2" />
                            <span className="text-xs sm:text-sm font-medium text-gray-900 text-center leading-tight">
                                Manage Resources
                            </span>
                            <span className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-green-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                New
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Resources Overview Section */}
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                        <h2 className="text-lg font-medium text-gray-900">
                            Learning Resources Overview
                        </h2>
                        <Link
                            href={route("admin.resources.index")}
                            className="text-sm text-blue-600 hover:text-blue-800 self-start sm:self-auto"
                        >
                            View All Resources →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <Video className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mr-3 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                        {stats.totalVideos || 0}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Video Resources
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-3 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                        {stats.totalDocuments || 0}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Documents
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mr-3 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                                        {stats.totalQuizzes || 0}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Quizzes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-xs sm:text-sm text-blue-800">
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
