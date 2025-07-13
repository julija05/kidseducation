import AdminLayout from "@/Layouts/AdminLayout";
import { Link, useForm } from "@inertiajs/react";

export default function AdminPrograms({ programs }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this program?")) {
            destroy(route("admin.programs.destroy", id));
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Programs</h1>
                <Link
                    href={route("admin.programs.create")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                >
                    + Create New Program
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programs.map((program) => (
                    <div
                        key={program.id}
                        className="bg-white rounded-xl shadow p-5 border"
                    >
                        <h2 className="text-xl font-semibold mb-2">
                            {program.name}
                        </h2>
                        <p className="text-gray-600 mb-2">
                            {program.description?.slice(0, 100)}...
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Age range: {program.age_range || "Not specified"}
                        </p>
                        <div className="flex justify-end gap-4 text-sm">
                            <Link
                                href={route("admin.programs.lessons.index", program.slug)}
                                className="text-green-600 hover:underline"
                            >
                                Lessons
                            </Link>
                            <Link
                                href={route("admin.programs.edit", program.id)}
                                className="text-blue-600 hover:underline"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(program.id)}
                                className="text-red-600 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
