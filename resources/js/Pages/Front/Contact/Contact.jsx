import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import undrawImage from "../../../../assets/contact-us.svg";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";

export default function ContactUs({ auth }) {
    const [contactRef, contactInView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement form submission logic here (like sending an email)
        console.log("Form submitted", formData);
    };

    return (
        <GuestFrontLayout auth={auth}>
            <section
                id="contact"
                className="relative min-h-screen py-24 bg-white text-gray-800 overflow-hidden"
            >
                {/* Background Decorative Blobs */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 opacity-30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300 opacity-30 rounded-full blur-2xl animate-bounce" />

                {/* Section Heading */}
                <div className="container mx-auto px-6 lg:px-12 text-center z-10 relative">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={contactInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        ref={contactRef}
                        className="text-5xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-transparent bg-clip-text drop-shadow mb-12"
                    >
                        Get in Touch
                    </motion.h2>

                    {/* Contact Section */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 z-10 relative">
                        {/* Left Side: Form and Email */}
                        <div className="lg:w-1/2 w-full bg-white p-8 rounded-xl shadow-xl">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-semibold text-gray-700"
                                    >
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-semibold text-gray-700"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="message"
                                        className="block text-sm font-semibold text-gray-700"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows="5"
                                        className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                                >
                                    Send Message
                                </button>
                            </form>

                            {/* Contact Email */}
                            <div className="mt-8 text-center text-lg text-gray-700">
                                <p>Feel free to email us at:</p>
                                <p>
                                    <a
                                        href="mailto:info@kidseducation.com"
                                        className="text-blue-600 hover:underline"
                                    >
                                        info@kidseducation.com
                                    </a>
                                </p>
                                <p>
                                    <a
                                        href="mailto:support@kidseducation.com"
                                        className="text-blue-600 hover:underline"
                                    >
                                        support@kidseducation.com
                                    </a>
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={
                                contactInView ? { opacity: 1, scale: 1 } : {}
                            }
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="lg:w-1/2 w-full mt-8 lg:mt-0"
                        >
                            <img
                                src={undrawImage}
                                alt="Contact Illustration"
                                className="w-full max-w-lg mx-auto rounded-xl shadow-xl"
                            />

                            {/* Social Media Links under Illustration */}
                            <div className="mt-8 text-center">
                                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                                    Connect with us
                                </h3>
                                <div className="flex justify-center space-x-8 text-3xl">
                                    <a
                                        href="https://www.facebook.com/YOUR_PAGE"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:scale-110 transition"
                                    >
                                        <i className="fab fa-facebook-square"></i>
                                    </a>
                                    <a
                                        href="https://www.instagram.com/YOUR_PROFILE"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-pink-500 hover:scale-110 transition"
                                    >
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/company/abacoding/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-700 hover:scale-110 transition"
                                    >
                                        <i className="fab fa-linkedin"></i>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </GuestFrontLayout>
    );
}
