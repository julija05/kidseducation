import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";

const ProgramsIndex = ({ auth, programs }) => {
    // const { programs, pageTitle, content } = usePage().props;
    const colors = [
        {
            bg: "bg-blue-100",
            text: "text-blue-900",
            button: "bg-blue-600 hover:bg-blue-700",
        },
        {
            bg: "bg-pink-100",
            text: "text-pink-900",
            button: "bg-pink-600 hover:bg-pink-700",
        },
    ];

    return (
        <GuestFrontLayout auth={auth}>
            <section className="relative bg-gray-100 py-32 px-6 text-center overflow-hidden">
                {/* <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 z-0">
                    <svg
                        viewBox="0 0 500 150"
                        preserveAspectRatio="none"
                        className="w-full h-20"
                    >
                        <path
                            d="M0.00,49.98 C150.00,150.00 349.53,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                            style={{ stroke: "none", fill: "#ffffff" }}
                        ></path>
                    </svg>
                </div> */}

                <motion.h2
                    className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-20 z-10 relative"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text drop-shadow-md p-3">
                        Programs
                    </span>
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto z-10 relative">
                    {programs.map((program, index) => {
                        const color = colors[index % 2];
                        return (
                            <motion.div
                                key={program.id}
                                className={`${color.bg} p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative`}
                                whileHover={{ scale: 1.03 }}
                                initial={{
                                    opacity: 0,
                                    y: index % 2 === 0 ? -100 : 100,
                                }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1 }}
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-extrabold text-lg px-6 py-2 rounded-full shadow-lg border-2 border-yellow-500 z-20 animate-bounce">
                                    🎁 1 Free Class
                                </div>
                                <img
                                    src={`${program.image}`}
                                    alt={program.name}
                                    className="mb-8 mx-auto w-72 h-72 object-contain shadow-md rounded-xl mt-10"
                                />
                                <h3
                                    className={`text-4xl font-bold mb-4 ${color.text}`}
                                >
                                    {program.name}
                                </h3>
                                <p className="text-lg text-gray-800 mb-8 leading-relaxed">
                                    {program.description}
                                </p>
                                <Link
                                    href={route("programs.show", program.id)}
                                    className={`inline-block ${color.button} text-white text-lg px-6 py-3 rounded-full transition shadow-lg`}
                                >
                                    Learn More
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </GuestFrontLayout>
    );
};

export default ProgramsIndex;
