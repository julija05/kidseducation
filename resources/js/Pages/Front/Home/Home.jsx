import React from "react";
import { motion } from "framer-motion";
import undrawImage from "../../../../assets/friends.svg"; // Replace with your illustration path
import backgroundImage from "../../../../assets/backgroundimage.png"; // Replace with your illustration path

const Home = () => {
    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-white"
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 2 }}
                className="container mx-auto px-6 py-16 flex items-center justify-between"
            >
                {/* Left Side: Text and Button */}
                <div className="max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 font-shantell">
                        Welcome to this site!
                    </h1>
                    <p className="text-lg mb-6">
                        Inspiring young minds through interactive learning and
                        play. Discover our programs and join our growing
                        community!
                    </p>
                    <a
                        href="#signup"
                        className="bg-white text-green-600 py-3 px-8 rounded shadow-lg hover:bg-gray-100 transition"
                    >
                        Get Started Now!!!!!
                    </a>
                </div>

                {/* Right Side: Illustration */}
                <div className="hidden md:block">
                    <motion.img
                        src={undrawImage}
                        alt="Kids Learning Illustration"
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        className="w-[500px] h-auto"
                    />
                </div>
            </motion.div>

            {/* SVG divider at the bottom .. */}
            <div class="custom-shape-divider-bottom-1736693835">
                <svg
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        class="shape-fill"
                    ></path>
                </svg>
            </div>
        </section>
    );
};

export default Home;
