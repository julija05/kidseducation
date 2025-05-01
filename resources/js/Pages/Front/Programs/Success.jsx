import React from "react";
import { Link, usePage } from "@inertiajs/react";

export default function Success() {
    const { student, program } = usePage().props;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
            <div className="max-w-xl w-full bg-white shadow-xl rounded-2xl p-10 text-center">
                <h1 className="text-3xl font-bold text-blue-700 mb-6">
                    Enrollment Successful 🎉
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                    Thank you for your interest,{" "}
                    <span className="font-semibold text-blue-800">
                        {student.first_name}
                    </span>
                    .
                    <br />
                    You have successfully signed up for{" "}
                    <span className="font-semibold text-green-700">
                        {program.name}
                    </span>
                    .
                </p>
                <p className="text-gray-600 mb-10">
                    Our team will contact you as soon as possible with more
                    details.
                </p>
                <Link
                    href={route("landing.index")}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
