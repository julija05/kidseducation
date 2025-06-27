import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    BookOpen,
    Code,
    Calculator,
    User,
    Calendar,
    Trophy,
    Play,
    FileText,
    CheckCircle,
} from "lucide-react";
import { useState } from "react";

const AbacusProgram = () => {
    const lessons = [
        {
            id: 1,
            title: "Introduction to Abacus",
            completed: true,
            duration: "30 min",
        },
        {
            id: 2,
            title: "Basic Addition Techniques",
            completed: true,
            duration: "45 min",
        },
        {
            id: 3,
            title: "Subtraction on Abacus",
            completed: false,
            duration: "45 min",
        },
        {
            id: 4,
            title: "Multiplication Fundamentals",
            completed: false,
            duration: "60 min",
        },
        {
            id: 5,
            title: "Advanced Calculations",
            completed: false,
            duration: "60 min",
        },
    ];

    const resources = [
        { title: "Abacus Practice Sheets", type: "PDF", icon: FileText },
        {
            title: "Video Tutorial: Speed Techniques",
            type: "Video",
            icon: Play,
        },
        {
            title: "Interactive Abacus Simulator",
            type: "Interactive",
            icon: Calculator,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-purple-800 mb-3">
                    Welcome to Abacus Program!
                </h3>
                <p className="text-purple-700">
                    Master mental math through the ancient art of abacus
                    calculation.
                </p>
            </div>

            <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <BookOpen className="mr-2" size={20} />
                    Your Lessons
                </h4>
                <div className="space-y-3">
                    {lessons.map((lesson) => (
                        <div
                            key={lesson.id}
                            className="bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                        lesson.completed
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    {lesson.completed && (
                                        <CheckCircle
                                            size={16}
                                            className="text-white"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h5 className="font-medium">
                                        {lesson.title}
                                    </h5>
                                    <p className="text-sm text-gray-500">
                                        {lesson.duration}
                                    </p>
                                </div>
                            </div>
                            <button
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                    lesson.completed
                                        ? "bg-gray-100 text-gray-500"
                                        : "bg-purple-500 text-white hover:bg-purple-600"
                                }`}
                            >
                                {lesson.completed ? "Review" : "Start"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-lg font-semibold mb-4">
                    Learning Resources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {resources.map((resource, idx) => (
                        <div
                            key={idx}
                            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex items-center mb-2">
                                <resource.icon
                                    className="text-purple-500 mr-2"
                                    size={20}
                                />
                                <span className="text-sm text-gray-500">
                                    {resource.type}
                                </span>
                            </div>
                            <h5 className="font-medium">{resource.title}</h5>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CodingProgram = () => {
    const modules = [
        {
            id: 1,
            title: "Introduction to Programming",
            completed: true,
            language: "Scratch",
        },
        {
            id: 2,
            title: "Creating Animations",
            completed: true,
            language: "Scratch",
        },
        {
            id: 3,
            title: "Game Development Basics",
            completed: false,
            language: "Scratch",
        },
        {
            id: 4,
            title: "Introduction to Python",
            completed: false,
            language: "Python",
        },
        {
            id: 5,
            title: "Building Simple Programs",
            completed: false,
            language: "Python",
        },
    ];

    const projects = [
        { title: "My First Animation", status: "Completed", stars: 4 },
        { title: "Space Adventure Game", status: "In Progress", stars: 0 },
        { title: "Calculator App", status: "Not Started", stars: 0 },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">
                    Welcome to Coding for Kids!
                </h3>
                <p className="text-blue-700">
                    Learn to create amazing things with code. Start your journey
                    to become a young programmer!
                </p>
            </div>

            <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Code className="mr-2" size={20} />
                    Learning Modules
                </h4>
                <div className="space-y-3">
                    {modules.map((module) => (
                        <div
                            key={module.id}
                            className="bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                        module.completed
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    {module.completed && (
                                        <CheckCircle
                                            size={16}
                                            className="text-white"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h5 className="font-medium">
                                        {module.title}
                                    </h5>
                                    <p className="text-sm text-gray-500">
                                        Language: {module.language}
                                    </p>
                                </div>
                            </div>
                            <button
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                    module.completed
                                        ? "bg-gray-100 text-gray-500"
                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                            >
                                {module.completed ? "Review" : "Start"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Trophy className="mr-2" size={20} />
                    My Projects
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {projects.map((project, idx) => (
                        <div
                            key={idx}
                            className="bg-white border rounded-lg p-4"
                        >
                            <h5 className="font-medium mb-2">
                                {project.title}
                            </h5>
                            <p className="text-sm text-gray-500 mb-2">
                                {project.status}
                            </p>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i < project.stars
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const PROGRAMS = {
        ABACUS: {
            id: "abacus",
            name: "Abacus Program",
            icon: Calculator,
            color: "bg-purple-500",
            lightColor: "bg-purple-50",
            borderColor: "border-purple-500",
            textColor: "text-purple-700",
        },
        CODING: {
            id: "coding",
            name: "Coding for Kids",
            icon: Code,
            color: "bg-blue-500",
            lightColor: "bg-blue-50",
            borderColor: "border-blue-500",
            textColor: "text-blue-700",
        },
    };

    // Sample student data - In real app, this would come from your backend
    const currentStudent = {
        name: "Alex Johnson",
        enrolledProgram: "coding", // Change this to 'coding' to see different content
        progress: 65,
        nextClass: "2024-01-15 3:00 PM",
    };

    const { props } = usePage();
    const student = props.auth.user;

    const program =
        PROGRAMS[
            Object.keys(PROGRAMS).find(
                (key) => PROGRAMS[key].id === currentStudent.enrolledProgram
            )
        ];

    if (!program) {
        return (
            <AuthenticatedLayout>
                <Head title="Dashboard" />
                <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-red-800">
                                No Program Enrolled
                            </h3>
                            <p className="text-red-700 mt-2">
                                Please contact your administrator to enroll in a
                                program.
                            </p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const Icon = program.icon;

    // Custom header for the dashboard
    const customHeader = (
        <>
            <Icon className="mr-3" size={32} />
            <h1 className="text-2xl font-bold">
                {program.name} - Student Dashboard
            </h1>
        </>
    );

    return (
        <AuthenticatedLayout
            programConfig={program}
            customHeader={customHeader}
        >
            <Head title={`${program.name} Dashboard`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            Overall Progress
                        </h3>
                        <div className="flex items-center">
                            <div className="flex-1">
                                <div className="relative pt-1">
                                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                        <div
                                            style={{
                                                width: `${currentStudent.progress}%`,
                                            }}
                                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${program.color}`}
                                        />
                                    </div>
                                </div>
                            </div>
                            <span
                                className={`ml-3 text-lg font-semibold ${program.textColor}`}
                            >
                                {currentStudent.progress}%
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            Next Class
                        </h3>
                        <div className="flex items-center">
                            <Calendar
                                className={`mr-2 ${program.textColor}`}
                                size={20}
                            />
                            <span className="text-lg font-semibold">
                                {currentStudent.nextClass}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            Current Program
                        </h3>
                        <div className="flex items-center">
                            <Icon
                                className={`mr-2 ${program.textColor}`}
                                size={20}
                            />
                            <span className="text-lg font-semibold">
                                {program.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Program-specific Content */}
                <div
                    className={`${program.lightColor} ${program.borderColor} border-2 rounded-lg p-6`}
                >
                    {currentStudent.enrolledProgram === "abacus" && (
                        <AbacusProgram />
                    )}
                    {currentStudent.enrolledProgram === "coding" && (
                        <CodingProgram />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
