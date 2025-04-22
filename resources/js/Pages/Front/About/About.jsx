import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import undrawImage from "../../../../assets/people.svg";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";

export default function About({ auth }) {
    const [missionRef, missionInView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <GuestFrontLayout auth={auth}>
            <div className="bg-white text-gray-800 overflow-hidden">
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col md:flex-row items-center justify-between px-6 py-24 relative z-10 max-w-7xl mx-auto gap-12">
                    {/* Text Content */}
                    <div className="md:w-1/2 text-center md:text-left">
                        <motion.h1
                            className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-transparent bg-clip-text drop-shadow-lg mb-6 leading-tight"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5 }}
                        >
                            Who We Are
                        </motion.h1>
                        <motion.p
                            className="text-xl text-gray-800 mt-4 leading-relaxed"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 1 }}
                        >
                            We’re passionate about helping kids develop
                            problem-solving and creative thinking skills from a
                            young age. Our programs are carefully designed to
                            make learning fun, engaging, and meaningful.
                        </motion.p>
                    </div>

                    {/* Decorative + Image */}
                    <div className="md:w-1/2 relative flex justify-center items-center">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-60 animate-spin-slow" />
                        <div className="absolute bottom-0 right-10 w-60 h-60 bg-green-300 rounded-full blur-2xl opacity-50 animate-pulse" />
                        <div className="absolute top-20 left-20 w-24 h-24 bg-purple-300 rotate-12 blur-xl opacity-60 animate-bounce" />

                        <img
                            src={undrawImage}
                            alt="Team Illustration"
                            className="relative z-10 w-full max-w-sm md:max-w-md"
                        />
                    </div>
                </section>

                {/* Mission Section */}
                <section className="relative bg-gray-100 py-32 px-6 overflow-hidden text-center">
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
                        className="text-5xl font-extrabold mb-12 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text drop-shadow"
                        initial={{ opacity: 0, y: -30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        Our Mission
                    </motion.h2>

                    <motion.div
                        ref={missionRef}
                        initial={{ opacity: 0, y: 40 }}
                        animate={missionInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 1 }}
                        className="max-w-3xl mx-auto text-lg text-gray-800 leading-relaxed"
                    >
                        We are dedicated to nurturing young minds through
                        interactive and engaging learning experiences. Our
                        mission is to foster creativity, critical thinking, and
                        a lifelong love of learning in every child.
                    </motion.div>
                </section>

                {/* Call to Action */}
                <section className="bg-yellow-100 text-center px-6 py-20">
                    <motion.h2
                        className="text-4xl font-bold mb-6"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        Want to Know More?
                    </motion.h2>
                    <motion.p
                        className="text-lg mb-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 1 }}
                    >
                        Discover how we help children thrive through joyful
                        learning.
                    </motion.p>
                    <motion.a
                        href="/programs"
                        className="bg-yellow-400 hover:bg-yellow-300 text-white font-semibold py-3 px-8 rounded-2xl text-lg transition inline-block"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Explore Programs
                    </motion.a>
                </section>
            </div>
        </GuestFrontLayout>
    );
}
