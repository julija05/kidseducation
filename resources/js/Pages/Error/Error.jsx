import React from "react";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";
import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";

export default function Error({ status }) {
    const title = {
        503: "503: Service Unavailable",
        500: "500: Server Error",
        404: "404: Page Not Found",
        403: "403: Forbidden",
    }[status];

    const description = {
        503: "Sorry, we are doing some maintenance. Please check back soon.",
        500: "Whoops, something went wrong on our servers.",
        404: "Sorry, the page you are looking for could not be found.",
        403: "Sorry, you are forbidden from accessing this page.",
    }[status];

    return (
        <GuestFrontLayout>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 p-6 text-center">
                <motion.div
                    className="bg-white p-10 rounded-3xl shadow-2xl max-w-2xl"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 mb-4 drop-shadow-lg">
                        {title}
                    </h1>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {description}
                    </h2>
                    <Link
                        href="/"
                        className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:scale-105 transition transform duration-300 mt-6"
                    >
                        Back to Home
                    </Link>
                </motion.div>
            </div>
        </GuestFrontLayout>
    );
}
