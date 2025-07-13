import React from "react";
import { Head, router } from "@inertiajs/react";

export default function EmptyState() {
    return (
        <>
            <Head title="Lesson Not Found" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Lesson Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        The lesson you're looking for doesn't exist or couldn't
                        be loaded.
                    </p>
                    <button
                        onClick={() => router.visit(route("dashboard"))}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </>
    );
}
