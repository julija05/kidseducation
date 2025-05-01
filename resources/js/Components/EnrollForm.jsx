// resources/js/Components/EnrollForm.jsx
import React from "react";
import { Link, useForm } from "@inertiajs/react";

export default function EnrollForm({ program, success }) {
    const { data, setData, post, processing, errors } = useForm({
        program_id: program.id,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("student.store"));
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Enroll Now
            </h2>

            {success && (
                <div className="bg-green-100 text-green-800 p-4 rounded mb-6">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["first_name", "last_name", "email", "phone"].map(
                        (field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                    {field.replace("_", " ")}
                                </label>
                                <input
                                    type={field === "email" ? "email" : "text"}
                                    value={data[field]}
                                    onChange={(e) =>
                                        setData(field, e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-md p-2 shadow-sm"
                                    required
                                />
                                {errors[field] && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors[field]}
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            value={data.date_of_birth}
                            onChange={(e) =>
                                setData("date_of_birth", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-md p-2 shadow-sm"
                            required
                        />
                        {errors.date_of_birth && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.date_of_birth}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <Link
                        href={route("landing.index")}
                        className="text-gray-600 hover:text-gray-900 underline"
                    >
                        Back to Home
                    </Link>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {processing ? "Processing..." : "Enroll Now"}
                    </button>
                </div>
            </form>
        </div>
    );
}
