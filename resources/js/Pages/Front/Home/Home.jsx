import React, { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import hero from "../../../../assets/Hero.jpg";
import coding from "../../../../assets/coding.svg";
import abacus from "../../../../assets/abacus.png";
import kid from "../../../../assets/Abacoding.png";
import math from "../../../../assets/math.svg";

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
                <section className="relative bg-gray-100 py-32 px-6 text-center overflow-hidden">
                    <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 z-0">
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
                    </div>

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
                                        src={`/${program.image}`}
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
                                        href={route(
                                            "programs.show",
                                            program.id
                                        )}
                                        className={`inline-block ${color.button} text-white text-lg px-6 py-3 rounded-full transition shadow-lg`}
                                    >
                                        Learn More
                                    </Link>
                                </motion.div>
                            );
                        })}
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
                        Enroll Now
                    </motion.button>
                </section>
            </div>
        </GuestFrontLayout>
    );
};

export default Home;
