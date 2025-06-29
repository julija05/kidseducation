// resources/js/Pages/Dashboard/Programs/Show.jsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { ProgramContent, ProgressOverview } from "@/Components/Dashboard";
import { iconMap } from "@/Utils/iconMapping";

export default function ProgramShow({
    program,
    userEnrollment,
    enrolledProgram,
    nextClass,
}) {
    const handleStartLesson = (lessonId) => {
        // Navigate to the lesson page
        router.visit(route("lessons.show", lessonId));
    };

    const handleReviewLesson = (lessonId) => {
        // Navigate to the lesson page for review
        router.visit(route("lessons.show", lessonId));
    };

    // Get the program icon
    const ProgramIcon = iconMap[enrolledProgram.theme.icon] || iconMap.BookOpen;

    const customHeader = (
        <>
            <ProgramIcon className="mr-3" size={32} />
            <h1 className="text-2xl font-bold">
                {enrolledProgram.name} - Student Dashboard
            </h1>
        </>
    );

    return (
        <AuthenticatedLayout
            programConfig={enrolledProgram.theme}
            customHeader={customHeader}
        >
            <Head title={`${enrolledProgram.name} Dashboard`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back to Dashboard Button */}
                <div className="mb-6">
                    <button
                        onClick={() => router.visit(route("dashboard"))}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                {/* Progress Overview */}
                <ProgressOverview
                    enrolledProgram={enrolledProgram}
                    nextClass={nextClass}
                />

                {/* Program Content */}
                <div
                    className={`${enrolledProgram.theme.lightColor} ${enrolledProgram.theme.borderColor} border-2 rounded-lg p-6`}
                >
                    <ProgramContent
                        program={enrolledProgram}
                        onStartLesson={handleStartLesson}
                        onReviewLesson={handleReviewLesson}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
