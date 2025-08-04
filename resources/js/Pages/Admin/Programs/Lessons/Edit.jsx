import React from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import LessonFormSimple from "./LessonFormSimple";
import { ArrowLeft } from "lucide-react";

export default function EditLesson() {
    const { program, lesson, availableLevels, contentTypes } = usePage().props;

    const handleSubmit = (data, put) => {
        put(route("admin.programs.lessons.update", [program.slug, lesson.id]), data);
    };

    return (
        <AdminLayout>
            <Head title={`Edit Lesson - ${lesson.title}`} />

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
                            Edit Lesson
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Update lesson in <strong>{program.name}</strong>
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <LessonFormSimple 
                            formData={lesson}
                            availableLevels={availableLevels}
                            contentTypes={contentTypes}
                            onSubmit={handleSubmit}
                            isUpdate={true}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}