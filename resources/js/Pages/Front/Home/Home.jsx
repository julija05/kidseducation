import React, { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import kid from "../../../../assets/Abacoding.png";
import learningMap from "../../../../assets/learning_map.png";
import learningMapCoding from "../../../../assets/lerning-map-coding.png";

import GuestFrontLayout from "@/Layouts/GuessFrontLayout";

const Home = ({ auth }) => {
    const { programs, pageTitle, content } = usePage().props;
    const fullText = "Where kids learn to think fast and build the future.";
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        console.log("Programs:", programs);
    }, [programs]);

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            setDisplayedText(fullText.slice(0, currentIndex + 1));
            currentIndex++;
            if (currentIndex === fullText.length) clearInterval(interval);
        }, 100); // typing speed
        return () => clearInterval(interval);
    }, []);

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
            <div className="bg-white text-gray-800 overflow-hidden">
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col md:flex-row items-center justify-between px-6 py-24 relative z-10 max-w-7xl mx-auto gap-12">
                    {/* Left: Text Content */}
                    <div className="md:w-1/2 text-center md:text-left">
                        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-transparent bg-clip-text drop-shadow-lg mb-6 leading-tight min-h-[6rem] md:min-h-[7rem]">
                            {displayedText}
                        </h1>

                        <motion.p
                            className="text-xl md:text-2xl font-medium text-gray-800 mt-4 leading-relaxed"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 1 }}
                        >
                            Explore the{" "}
                            <span className="text-pink-600 font-semibold">
                                magical world
                            </span>{" "}
                            of learning with our{" "}
                            <span className="text-blue-500 font-semibold">
                                Abacus
                            </span>{" "}
                            and{" "}
                            <span className="text-pink-600 font-semibold">
                                Coding
                            </span>{" "}
                            programs for{" "}
                            <span className="text-blue-500 font-semibold">
                                curious & creative
                            </span>{" "}
                            young minds.
                        </motion.p>

                        {/* Stats */}
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 pt-12 w-full">
                            <div className="flex-1 bg-white/70 backdrop-blur-md shadow-lg rounded-xl px-6 py-4 text-center">
                                <h3 className="text-3xl font-bold text-pink-600 animate-pulse">
                                    1896+
                                </h3>
                                <p className="text-sm text-blue-500 font-medium">
                                    Happy Learners
                                </p>
                            </div>
                            <div className="flex-1 bg-white/70 backdrop-blur-md shadow-lg rounded-xl px-6 py-4 text-center">
                                <h3 className="text-3xl font-bold text-pink-600 animate-pulse">
                                    2000+
                                </h3>
                                <p className="text-sm text-blue-500 font-medium">
                                    Active Users
                                </p>
                            </div>
                            <div className="flex-1 bg-white/70 backdrop-blur-md shadow-lg rounded-xl px-6 py-4 text-center">
                                <h3 className="text-3xl font-bold text-pink-600 animate-pulse">
                                    98%
                                </h3>
                                <p className="text-sm text-blue-500 font-medium">
                                    Parent Satisfaction
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Image with SVG Waves and Fancy Shapes */}
                    <div className="md:w-1/2 relative flex justify-center items-center">
                        {/* SVG Waves Background */}
                        <svg
                            className="absolute top-0 left-0 w-full h-full -z-10"
                            viewBox="0 0 500 500"
                            preserveAspectRatio="xMinYMin meet"
                        >
                            <path
                                d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z"
                                fill="#fcd34d"
                                opacity="0.4"
                            />
                            <path
                                d="M0,120 C180,220 320,20 500,120 L500,00 L0,0 Z"
                                fill="#f9a8d4"
                                opacity="0.3"
                            />
                            <path
                                d="M0,140 C200,240 300,40 500,140 L500,00 L0,0 Z"
                                fill="#93c5fd"
                                opacity="0.3"
                            />
                        </svg>

                        {/* Fancy blobs */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-60 animate-spin-slow" />
                        <div className="absolute bottom-0 right-10 w-60 h-60 bg-pink-300 rounded-full blur-2xl opacity-50 animate-pulse" />
                        <div className="absolute top-20 left-20 w-24 h-24 bg-blue-300 rotate-12 blur-xl opacity-60 animate-bounce" />

                        {/* Image */}
                        <img
                            src={kid}
                            alt="Happy Kid"
                            className="relative z-10 w-full max-w-xs md:max-w-md"
                        />
                    </div>
                </section>

                {/* Programs Section */}
                {/* Abacus Program Explanation Section */}
                <section className="relative bg-gray-100 py-32 px-6 text-center overflow-hidden">
                    <motion.h2
                        className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-20 z-10 relative"
                        initial={{ opacity: 0, y: -30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text drop-shadow-md p-3">
                            Mental Arithmetic Program
                        </span>
                    </motion.h2>

                    <div className="flex flex-col md:flex-row items-center gap-10 max-w-7xl mx-auto z-10 relative">
                        <motion.div
                            className="w-full md:w-2/3"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src={learningMap}
                                alt="Abacus Levels"
                                className="rounded-xl w-full h-auto"
                            />
                        </motion.div>

                        <div className="md:w-1/2 text-left">
                            <motion.h3
                                className="text-3xl font-bold text-blue-600 mb-6"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                What is Abacus?
                            </motion.h3>
                            <motion.p
                                className="text-lg text-gray-700 leading-relaxed mb-6"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                The abacus is an ancient calculating tool...
                            </motion.p>

                            <motion.h3
                                className="text-3xl font-bold text-pink-600 mb-6"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                Why Learn Abacus?
                            </motion.h3>
                            <motion.ul
                                className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <li>Develops strong mental math skills...</li>
                                <li>
                                    Improves memory, concentration, and focus.
                                </li>
                                <li>
                                    Enhances visualization and imaginative
                                    thinking.
                                </li>
                                <li>Boosts self-confidence...</li>
                                <li>Strengthens brain development...</li>
                                <li>Helps children love math...</li>
                            </motion.ul>

                            <motion.h3
                                className="text-3xl font-bold text-blue-600 mb-6"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                When Should a Child Start Learning Abacus?
                            </motion.h3>
                            <motion.p
                                className="text-lg text-gray-700 leading-relaxed mb-12"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Children can start learning abacus as early as 4
                                to 5 years old...
                            </motion.p>

                            <motion.div
                                className="mt-8"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <p className="text-xl text-blue-600 font-semibold mb-4">
                                    Ready to get started? Join now and enjoy the
                                    first lesson for free!
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Scratch Programming Section */}
                <section className="relative bg-white py-32 px-6 text-center overflow-hidden">
                    <motion.h2
                        className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-20 z-10 relative"
                        initial={{ opacity: 0, y: -30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text drop-shadow-md p-3">
                            Coding for Kids (Scratch)
                        </span>
                    </motion.h2>

                    <div className="flex flex-col md:flex-row-reverse items-center gap-10 max-w-7xl mx-auto z-10 relative">
                        <motion.div
                            className="w-full md:w-2/3"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src={learningMapCoding}
                                alt="Scratch Programming for Kids"
                                className="rounded-xl w-full h-auto"
                            />
                        </motion.div>

                        <div className="md:w-1/2 text-left">
                            <motion.h3
                                className="text-3xl font-bold text-blue-600 mb-6"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                What is Scratch Programming?
                            </motion.h3>
                            <motion.p
                                className="text-lg text-gray-700 leading-relaxed mb-6"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Scratch is a beginner-friendly programming
                                platform...
                            </motion.p>

                            <motion.h3
                                className="text-3xl font-bold text-pink-600 mb-6"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                Why Learn Coding at a Young Age?
                            </motion.h3>
                            <motion.ul
                                className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <li>Strengthens problem-solving skills.</li>
                                <li>Encourages creativity and storytelling.</li>
                                <li>
                                    Helps kids express themselves through tech.
                                </li>
                                <li>Improves persistence and resilience.</li>
                                <li>Builds early tech confidence.</li>
                                <li>
                                    Creates a strong foundation for future
                                    coding.
                                </li>
                            </motion.ul>

                            <motion.h3
                                className="text-3xl font-bold text-blue-600 mb-6"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                When Should a Child Start Learning Scratch?
                            </motion.h3>
                            <motion.p
                                className="text-lg text-gray-700 leading-relaxed mb-12"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Children aged 6 and above can start learning
                                Scratch...
                            </motion.p>

                            <motion.div
                                className="mt-8"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <p className="text-xl text-blue-600 font-semibold mb-4">
                                    Ready to get started? Join now and enjoy the
                                    first lesson for free!
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="bg-yellow-100 text-center px-6 py-20">
                    <motion.h2
                        className="text-4xl font-bold mb-6"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        Ready to Get Started?
                    </motion.h2>
                    <motion.p
                        className="text-lg mb-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 1 }}
                    >
                        Join hundreds of happy parents who are building a better
                        future for their kids.
                    </motion.p>
                    <motion.button
                        className="bg-yellow-400 hover:bg-yellow-300 text-white font-semibold py-3 px-8 rounded-2xl text-lg transition"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link href={route("programs.index")}>Enroll Now</Link>
                    </motion.button>
                </section>
            </div>
        </GuestFrontLayout>
    );
};

export default Home;
