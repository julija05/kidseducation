import React, { useState } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    BookOpen,
    Video,
    FileText,
    Link2 as LinkIcon,
    Download,
    Puzzle,
    HelpCircle,
    Plus,
    Search,
    Filter,
    ChevronRight,
    BarChart3,
} from "lucide-react";

export default function ResourcesIndex() {
    const { programs = [], stats = {} } = usePage().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    const resourceTypeIcons = {
        video: Video,
        document: FileText,
        link: LinkIcon,
        download: Download,
        interactive: Puzzle,
        quiz: HelpCircle,
    };

    const resourceTypeColors = {
        video: "text-red-600 bg-red-100",
        document: "text-blue-600 bg-blue-100",
        link: "text-green-600 bg-green-100",
        download: "text-purple-600 bg-purple-100",
        interactive: "text-yellow-600 bg-yellow-100",
        quiz: "text-indigo-600 bg-indigo-100",
    };

    const filteredPrograms = programs.filter((program) => {
        const matchesSearch =
            program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (program.lessons &&
                Array.isArray(program.lessons) &&
                program.lessons.some((lesson) =>
                    lesson.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                ));

        if (filterType === "all") return matchesSearch;
        if (filterType === "no-resources") {
            return (
                matchesSearch &&
                program.lessons &&
                Array.isArray(program.lessons) &&
                program.lessons.some(
                    (lesson) => (lesson.resources_count || 0) === 0
                )
            );
        }
        return matchesSearch;
    });

    const getTotalResourcesForProgram = (program) => {
        if (!program.lessons || !Array.isArray(program.lessons)) return 0;
        return program.lessons.reduce(
            (sum, lesson) => sum + (lesson.resources_count || 0),
            0
        );
    };

    return (
        <AdminLayout>
            <Head title="Manage Resources" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Program Resources Management
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Add and manage learning resources for all programs
                        </p>
                    </div>
                    <Link
                        href={route("admin.resources.templates")}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Resource Templates
                    </Link>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Total Programs
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.totalPrograms || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                <BarChart3 className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Total Lessons
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.totalLessons || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">
                                    Total Resources
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.totalResources || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">
                                    Resources by Type
                                </p>
                                <div className="space-y-1">
                                    {Object.entries(
                                        stats.resourcesByType || {}
                                    ).map(([type, count]) => {
                                        const Icon =
                                            resourceTypeIcons[type] || FileText;
                                        return (
                                            <div
                                                key={type}
                                                className="flex items-center text-xs"
                                            >
                                                <Icon
                                                    size={14}
                                                    className="mr-1"
                                                />
                                                <span className="capitalize">
                                                    {type}:
                                                </span>
                                                <span className="ml-1 font-semibold">
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search programs or lessons..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Programs</option>
                                <option value="no-resources">
                                    Needs Resources
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Programs List */}
                <div className="space-y-4">
                    {filteredPrograms.map((program) => {
                        const totalResources =
                            getTotalResourcesForProgram(program);
                        const lessonsWithoutResources =
                            program.lessons && Array.isArray(program.lessons)
                                ? program.lessons.filter(
                                      (l) => (l.resources_count || 0) === 0
                                  ).length
                                : 0;

                        return (
                            <div
                                key={program.id}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {program.name}
                                                </h3>
                                                {lessonsWithoutResources >
                                                    0 && (
                                                    <span className="ml-3 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                                        {
                                                            lessonsWithoutResources
                                                        }{" "}
                                                        lessons need resources
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                                <span>
                                                    {program.lessons_count || 0}{" "}
                                                    lessons
                                                </span>
                                                <span className="mx-2">•</span>
                                                <span>
                                                    {totalResources} resources
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={route(
                                                    "admin.resources.program.quickAdd",
                                                    program.slug
                                                )}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                            >
                                                <Plus
                                                    size={16}
                                                    className="mr-1"
                                                />
                                                Quick Add
                                            </Link>
                                            <Link
                                                href={route(
                                                    "admin.resources.program.show",
                                                    program.slug
                                                )}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                            >
                                                Manage
                                                <ChevronRight
                                                    size={16}
                                                    className="ml-1"
                                                />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Lessons Preview */}
                                    {program.lessons &&
                                        Array.isArray(program.lessons) &&
                                        program.lessons.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {program.lessons
                                                    .slice(0, 3)
                                                    .map((lesson) => (
                                                        <div
                                                            key={lesson.id}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <div className="flex items-center">
                                                                <span className="text-gray-500">
                                                                    Level{" "}
                                                                    {lesson.level ||
                                                                        1}
                                                                    :
                                                                </span>
                                                                <span className="ml-2 text-gray-700">
                                                                    {
                                                                        lesson.title
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {(lesson.resources_count ||
                                                                    0) > 0 ? (
                                                                    <span className="text-green-600">
                                                                        {
                                                                            lesson.resources_count
                                                                        }{" "}
                                                                        resources
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-red-600">
                                                                        No
                                                                        resources
                                                                    </span>
                                                                )}
                                                                <Link
                                                                    href={route(
                                                                        "admin.lessons.resources.index",
                                                                        lesson.id
                                                                    )}
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                >
                                                                    <Plus
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {program.lessons.length > 3 && (
                                                    <div className="text-sm text-gray-500 pt-1">
                                                        And{" "}
                                                        {program.lessons
                                                            .length - 3}{" "}
                                                        more lessons...
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredPrograms.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500">
                            No programs found matching your criteria.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
