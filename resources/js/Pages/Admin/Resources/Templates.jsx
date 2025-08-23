import React from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    ArrowLeft,
    Video,
    FileText,
    HelpCircle,
    Copy,
    FileDown,
} from "lucide-react";

export default function Templates() {
    const { templates } = usePage().props;

    const resourceTypeIcons = {
        video: Video,
        document: FileText,
        quiz: HelpCircle,
    };

    const resourceTypeColors = {
        video: "bg-red-50 border-red-200 text-red-700",
        document: "bg-blue-50 border-blue-200 text-blue-700",
        quiz: "bg-indigo-50 border-indigo-200 text-indigo-700",
    };

    const copyToClipboard = (template) => {
        const text = `Title: ${template.name}\nDescription: ${
            template.description
        }${
            template.suggested_duration
                ? `\nDuration: ${template.suggested_duration}`
                : ""
        }`;
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    return (
        <AdminLayout>
            <Head title="Resource Templates" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={route("admin.resources.index")}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Resources
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Resource Templates
                    </h1>
                    <p className="mt-1 text-gray-600">
                        Use these templates as a starting point for creating
                        consistent learning resources
                    </p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FileDown className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                These templates provide suggested formats and
                                descriptions for common resource types. Click
                                the copy button to use a template as a starting
                                point.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Templates by Type */}
                <div className="space-y-8">
                    {Object.entries(templates).map(([type, typeTemplates]) => {
                        const Icon = resourceTypeIcons[type];
                        const colorClass = resourceTypeColors[type];

                        return (
                            <div
                                key={type}
                                className="bg-white rounded-lg shadow"
                            >
                                <div
                                    className={`px-6 py-4 border-b ${colorClass} bg-opacity-50`}
                                >
                                    <div className="flex items-center">
                                        <Icon className="h-6 w-6 mr-3" />
                                        <h2 className="text-xl font-semibold capitalize">
                                            {type} Templates
                                        </h2>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {typeTemplates.map((template, index) => (
                                        <div
                                            key={index}
                                            className="p-6 hover:bg-gray-50"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {template.name}
                                                    </h3>
                                                    <p className="mt-1 text-gray-600">
                                                        {template.description}
                                                    </p>
                                                    {template.suggested_duration && (
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            <strong>
                                                                Suggested
                                                                Duration:
                                                            </strong>{" "}
                                                            {
                                                                template.suggested_duration
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            template
                                                        )
                                                    }
                                                    className="ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Copy template"
                                                >
                                                    <Copy size={20} />
                                                </button>
                                            </div>

                                            {/* Example Usage */}
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Example Usage:
                                                </p>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {type === "video" && (
                                                        <>
                                                            {template.name ===
                                                                "Introduction Video" && (
                                                                <>
                                                                    <li>
                                                                        •
                                                                        Program
                                                                        overview
                                                                        and
                                                                        objectives
                                                                    </li>
                                                                    <li>
                                                                        •
                                                                        Instructor
                                                                        introduction
                                                                    </li>
                                                                    <li>
                                                                        • What
                                                                        students
                                                                        will
                                                                        learn
                                                                    </li>
                                                                </>
                                                            )}
                                                            {template.name ===
                                                                "Tutorial Video" && (
                                                                <>
                                                                    <li>
                                                                        •
                                                                        Step-by-step
                                                                        demonstrations
                                                                    </li>
                                                                    <li>
                                                                        •
                                                                        Practical
                                                                        examples
                                                                    </li>
                                                                    <li>
                                                                        •
                                                                        Hands-on
                                                                        exercises
                                                                    </li>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    {type === "document" && (
                                                        <>
                                                            {template.name ===
                                                                "Course Syllabus" && (
                                                                <>
                                                                    <li>
                                                                        •
                                                                        Learning
                                                                        objectives
                                                                    </li>
                                                                    <li>
                                                                        •
                                                                        Schedule
                                                                        and
                                                                        timeline
                                                                    </li>
                                                                    <li>
                                                                        •
                                                                        Assessment
                                                                        criteria
                                                                    </li>
                                                                </>
                                                            )}
                                                            {template.name ===
                                                                "Worksheet" && (
                                                                <>
                                                                    <li>
                                                                        •
                                                                        Practice
                                                                        problems
                                                                    </li>
                                                                    <li>
                                                                        • Answer
                                                                        keys
                                                                    </li>
                                                                    <li>
                                                                        •
                                                                        Self-assessment
                                                                        tools
                                                                    </li>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    {type === "quiz" && (
                                                        <>
                                                            {template.name ===
                                                                "Pre-Assessment" && (
                                                                <>
                                                                    <li>
                                                                        •
                                                                        Baseline
                                                                        knowledge
                                                                        check
                                                                    </li>
                                                                    <li>
                                                                        •
                                                                        Identify
                                                                        learning
                                                                        gaps
                                                                    </li>
                                                                    <li>
                                                                        •
                                                                        Personalize
                                                                        learning
                                                                        path
                                                                    </li>
                                                                </>
                                                            )}
                                                            {template.name ===
                                                                "Final Assessment" && (
                                                                <>
                                                                    <li>
                                                                        •
                                                                        Comprehensive
                                                                        evaluation
                                                                    </li>
                                                                    <li>
                                                                        •
                                                                        Certification
                                                                        requirement
                                                                    </li>
                                                                    <li>
                                                                        •
                                                                        Performance
                                                                        tracking
                                                                    </li>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Best Practices */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Best Practices for Creating Resources
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">
                                Content Guidelines
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Keep content focused and concise</li>
                                <li>• Use clear, simple language</li>
                                <li>• Include practical examples</li>
                                <li>• Provide actionable takeaways</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">
                                Technical Requirements
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Videos: MP4 format, 1080p preferred</li>
                                <li>• Documents: PDF for best compatibility</li>
                                <li>• File size: Keep under 100MB</li>
                                <li>• Naming: Use descriptive filenames</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
