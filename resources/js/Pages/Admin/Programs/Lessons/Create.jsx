import React from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import LessonForm from "./LessonForm";
import { ArrowLeft } from "lucide-react";

export default function CreateLesson() {
    const { program, selectedLevel, nextOrderInLevel, availableLevels, contentTypes } = usePage().props;

    const handleSubmit = (data, post) => {
        post(route("admin.programs.lessons.store", program.slug));
    };

    const formData = {
        level: selectedLevel,
        order_in_level: nextOrderInLevel,
        is_active: true,
    };

    return (
        <AdminLayout>
            <Head title={`Create Lesson - ${program.name}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={route("admin.programs.lessons.index", program.slug)}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Lessons
                    </Link>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Create New Lesson
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Add a new lesson to <strong>{program.name}</strong>
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <LessonForm 
                            formData={formData}
                            availableLevels={availableLevels}
                            contentTypes={contentTypes}
                            onSubmit={handleSubmit}
                            isUpdate={false}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}