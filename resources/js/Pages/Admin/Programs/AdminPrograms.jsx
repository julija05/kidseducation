import AdminLayout from "@/Layouts/AdminLayout";
import { Link, useForm } from "@inertiajs/react";

export default function AdminPrograms({ programs }) {
    const { delete: destroy } = useForm();

    const handleDelete = (program) => {
        if (confirm("Are you sure you want to delete this program?")) {
            destroy(route("admin.programs.destroy", program.slug || program.id));
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Programs</h1>
                    <Link
                        href={route("admin.programs.create")}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded shadow font-medium text-center min-h-[44px] flex items-center justify-center"
                    >
                        + Create New Program
                    </Link>
                </div>

                {/* Programs Grid */}
                {programs.length === 0 ? (
                    <div className="text-center text-gray-500 bg-gray-50 rounded-lg p-6 sm:p-8">
                        <h3 className="text-base sm:text-lg font-medium mb-2">No programs available</h3>
                        <p className="text-sm sm:text-base mb-4">
                            Create your first program to get started with lesson management.
                        </p>
                        <Link
                            href={route("admin.programs.create")}
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium min-h-[44px]"
                        >
                            + Create First Program
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {programs.map((program) => (
                            <div
                                key={program.id}
                                className="bg-white rounded-xl shadow p-4 sm:p-5 border hover:shadow-lg transition-shadow"
                            >
                                <div className="mb-4">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-2 leading-tight">
                                        {program.name}
                                    </h2>
                                    <p className="text-gray-600 text-sm sm:text-base mb-2 leading-relaxed">
                                        {program.description?.length > 120 
                                            ? program.description.slice(0, 120) + "..." 
                                            : program.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                            Age: {program.age_range || "Not specified"}
                                        </span>
                                        {program.price && (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                                €{program.price}
                                            </span>
                                        )}
                                        {program.duration && (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                {program.duration}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 border-t">
                                    <Link
                                        href={route("admin.programs.lessons.index", program.slug)}
                                        className="flex-1 text-green-600 hover:text-green-800 font-medium py-2 sm:py-0 text-center sm:text-left min-h-[44px] sm:min-h-0 flex items-center justify-center sm:justify-start hover:underline"
                                    >
                                        Lessons
                                    </Link>
                                    <Link
                                        href={route("admin.programs.edit", program.slug || program.id)}
                                        className="flex-1 text-blue-600 hover:text-blue-800 font-medium py-2 sm:py-0 text-center sm:text-left min-h-[44px] sm:min-h-0 flex items-center justify-center sm:justify-start hover:underline"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(program)}
                                        className="flex-1 text-red-600 hover:text-red-800 font-medium py-2 sm:py-0 text-center sm:text-left min-h-[44px] sm:min-h-0 flex items-center justify-center sm:justify-start hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
