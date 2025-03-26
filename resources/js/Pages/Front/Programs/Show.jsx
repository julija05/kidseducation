import React from "react";
import { Link, usePage } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";

export default function ProgramDetail(auth) {
    const { program } = usePage().props;

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

                    <Link
                        href=""
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Sign Up for This Program
                    </Link>
                </div>
            </div>
        </div>
    );
}
