import React from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";

export default function ProgramDetail(auth) {
    const { success, program } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        program_id: program.id,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
    });
    console.log(usePage().props, "Pageprops");
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("student.store"));
    };

    return (
        <div>
            <NavBar auth={auth} />

            {success && (
                <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold mb-4">{program.name}</h1>
                    <div className="mb-6 text-gray-600 space-y-4">
                        <p>{program.description}</p>
                        <div className="flex gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <span className="block text-sm text-blue-600">
                                    Price
                                </span>
                                <span className="text-2xl font-bold text-blue-800">
                                    ${program.price}
                                </span>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <span className="block text-sm text-green-600">
                                    Duration
                                </span>
                                <span className="text-2xl font-bold text-green-800">
                                    {program.duration}
                                </span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                    <input
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) =>
                                            setData(
                                                "first_name",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                        required
                                    />
                                    {errors.first_name && (
                                        <div className="text-red-500 text-sm">
                                            {errors.first_name}
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                    <input
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) =>
                                            setData("last_name", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                        required
                                    />
                                    {errors.last_name && (
                                        <div className="text-red-500 text-sm">
                                            {errors.last_name}
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                        required
                                    />
                                    {errors.email && (
                                        <div className="text-red-500 text-sm">
                                            {errors.email}
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                        required
                                    />
                                    {errors.phone && (
                                        <div className="text-red-500 text-sm">
                                            {errors.phone}
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                    <input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) =>
                                            setData(
                                                "date_of_birth",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                        required
                                    />
                                    {errors.date_of_birth && (
                                        <div className="text-red-500 text-sm">
                                            {errors.date_of_birth}
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8">
                            <Link
                                href={route("about.index")}
                                className="text-gray-600 hover:text-gray-900 underline"
                            >
                                Back to Programs
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {processing ? "Processing..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
