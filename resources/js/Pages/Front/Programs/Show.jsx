import React from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";

export default function ProgramDetail(auth) {
    const { program } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        program_id: program.id,
        child_name: "",
        child_surname: "",
        child_age: "",
        address: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("enroll.store"));
    };

    return (
        <div>
            <NavBar auth={auth} />
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
                                    Child's First Name
                                    <input
                                        type="text"
                                        value={data.child_name}
                                        onChange={(e) =>
                                            setData(
                                                "child_name",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                        required
                                    />
                                    {errors.child_name && (
                                        <div className="text-red-500 text-sm">
                                            {errors.child_name}
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Child's Last Name
                                    <input
                                        type="text"
                                        value={data.child_surname}
                                        onChange={(e) =>
                                            setData(
                                                "child_surname",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                        required
                                    />
                                    {errors.child_surname && (
                                        <div className="text-red-500 text-sm">
                                            {errors.child_surname}
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Child's Age
                                    <input
                                        type="number"
                                        value={data.child_age}
                                        onChange={(e) =>
                                            setData("child_age", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                        min="3"
                                        max="18"
                                        required
                                    />
                                    {errors.child_age && (
                                        <div className="text-red-500 text-sm">
                                            {errors.child_age}
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                    <textarea
                                        value={data.address}
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                                        rows="3"
                                        required
                                    />
                                    {errors.address && (
                                        <div className="text-red-500 text-sm">
                                            {errors.address}
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
                                {processing
                                    ? "Processing..."
                                    : "Continue to Payment"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
