import React, { useState } from "react";
import { Link, Head, usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    ArrowLeft,
    Plus,
    Book,
    Video,
    FileText,
    Puzzle,
    HelpCircle,
    Edit,
    Trash2,
    Clock,
    ChevronDown,
    ChevronRight,
    GripVertical,
    Users,
    BookOpen,
} from "lucide-react";

export default function LessonsIndex() {
    const { program, lessonsByLevel } = usePage().props;
    const [expandedLevels, setExpandedLevels] = useState(new Set([1])); // Expand level 1 by default

    const contentTypeIcons = {
        video: Video,
        text: FileText,
        interactive: Puzzle,
        quiz: HelpCircle,
        mixed: Book,
    };

    const contentTypeColors = {
        video: "text-red-600 bg-red-50",
        text: "text-blue-600 bg-blue-50",
        interactive: "text-purple-600 bg-purple-50",
        quiz: "text-green-600 bg-green-50",
        mixed: "text-gray-600 bg-gray-50",
    };

    const toggleLevel = (level) => {
        const newExpanded = new Set(expandedLevels);
        if (newExpanded.has(level)) {
            newExpanded.delete(level);
        } else {
            newExpanded.add(level);
        }
        setExpandedLevels(newExpanded);
    };

    const handleDeleteLesson = (lesson) => {
        if (confirm(`Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`)) {
            router.delete(route('admin.programs.lessons.destroy', [program.slug, lesson.id]), {
                preserveScroll: true,
                onSuccess: () => {
                    // Optionally show success message
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    alert('Failed to delete lesson. Please try again.');
                },
            });
        }
    };

    const getTotalLessons = () => {
        return lessonsByLevel.reduce((total, level) => total + level.lessons.length, 0);
    };

    const getMaxLevel = () => {
        return lessonsByLevel.length > 0 ? Math.max(...lessonsByLevel.map(l => l.level)) : 0;
    };

    return (
        <AdminLayout>
            <Head title={`Lessons - ${program.name}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={route("admin.programs.index")}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Programs
                    </Link>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {program.name} - Lessons
                            </h1>
                            <p className="mt-1 text-gray-600">
                                Manage lessons and levels for this program
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={route("admin.programs.lessons.create", program.slug)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Plus size={16} className="mr-2" />
                                Add Lesson
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Lessons</p>
                                <p className="text-2xl font-semibold text-gray-900">{getTotalLessons()}</p>
                            </div>
                            <BookOpen className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Levels</p>
                                <p className="text-2xl font-semibold text-gray-900">{getMaxLevel()}</p>
                            </div>
                            <Users className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Avg per Level</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {getMaxLevel() > 0 ? Math.round(getTotalLessons() / getMaxLevel() * 10) / 10 : 0}
                                </p>
                            </div>
                            <Book className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Lessons by Level */}
                <div className="space-y-4">
                    {lessonsByLevel.length > 0 ? (
                        lessonsByLevel.map((levelData) => {
                            const isExpanded = expandedLevels.has(levelData.level);
                            
                            return (
                                <div key={levelData.level} className="bg-white rounded-lg shadow">
                                    <div 
                                        className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                                        onClick={() => toggleLevel(levelData.level)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <button className="mr-3 text-gray-400 hover:text-gray-600">
                                                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                                </button>
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900">
                                                        Level {levelData.level}
                                                    </h2>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {levelData.lessons.length} lesson{levelData.lessons.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route("admin.programs.lessons.create", {
                                                        program: program.slug,
                                                        level: levelData.level
                                                    })}
                                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Plus size={14} className="inline mr-1" />
                                                    Add Lesson
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="p-4">
                                            {levelData.lessons.length > 0 ? (
                                                <div className="space-y-3">
                                                    {levelData.lessons.map((lesson, index) => {
                                                        const Icon = contentTypeIcons[lesson.content_type];
                                                        const colorClass = contentTypeColors[lesson.content_type];

                                                        return (
                                                            <div
                                                                key={lesson.id}
                                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                                                            >
                                                                <div className="flex items-center">
                                                                    <GripVertical className="text-gray-400 mr-3" size={16} />
                                                                    <div className="mr-3 text-sm text-gray-500 font-mono">
                                                                        #{lesson.order_in_level}
                                                                    </div>
                                                                    <div className={`p-2 rounded ${colorClass} mr-4`}>
                                                                        <Icon size={16} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h3 className="font-medium text-gray-900">
                                                                            {lesson.title}
                                                                        </h3>
                                                                        {lesson.description && (
                                                                            <p className="text-sm text-gray-600 mt-1">
                                                                                {lesson.description}
                                                                            </p>
                                                                        )}
                                                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                                            <span className="flex items-center">
                                                                                <Clock size={12} className="mr-1" />
                                                                                {lesson.formatted_duration}
                                                                            </span>
                                                                            <span className="capitalize">
                                                                                {lesson.content_type_display}
                                                                            </span>
                                                                            <span>
                                                                                {lesson.resources_count} resources
                                                                            </span>
                                                                            {!lesson.is_active && (
                                                                                <span className="text-red-600">Inactive</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Link
                                                                        href={route("admin.lessons.resources.index", lesson.id)}
                                                                        className="p-2 text-gray-600 hover:text-blue-600 text-sm"
                                                                        title="Manage Resources"
                                                                    >
                                                                        Resources
                                                                    </Link>
                                                                    <Link
                                                                        href={route("admin.programs.lessons.edit", [program.slug, lesson.id])}
                                                                        className="p-1 text-gray-600 hover:text-blue-600"
                                                                        title="Edit Lesson"
                                                                    >
                                                                        <Edit size={16} />
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleDeleteLesson(lesson)}
                                                                        className="p-1 text-gray-600 hover:text-red-600"
                                                                        title="Delete Lesson"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500 text-sm">
                                                        No lessons in this level yet.
                                                    </p>
                                                    <Link
                                                        href={route("admin.programs.lessons.create", {
                                                            program: program.slug,
                                                            level: levelData.level
                                                        })}
                                                        className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Plus size={14} className="mr-1" />
                                                        Add first lesson to this level
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No Lessons Yet
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Start building your program by adding your first lesson.
                            </p>
                            <Link
                                href={route("admin.programs.lessons.create", program.slug)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus size={16} className="mr-2" />
                                Add First Lesson
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Add New Level */}
                {lessonsByLevel.length > 0 && (
                    <div className="mt-6 bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Level</h3>
                        <p className="text-gray-600 mb-4">
                            Create a lesson for a new level to automatically add that level to your program.
                        </p>
                        <Link
                            href={route("admin.programs.lessons.create", {
                                program: program.slug,
                                level: getMaxLevel() + 1
                            })}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Plus size={16} className="mr-2" />
                            Start Level {getMaxLevel() + 1}
                        </Link>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}