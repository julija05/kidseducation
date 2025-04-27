import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import undrawImage from "../../../../assets/contact-us.svg";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";

export default function ContactUs({ auth }) {
    const [contactRef, contactInView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

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

                    {/* Contact Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 z-10 relative">
                        {/* Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={contactInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="p-6 bg-white text-gray-800 rounded-2xl shadow-2xl"
                        >
                            <h4 className="text-xl font-bold mb-4">Address</h4>
                            <p>123 Learning Avenue</p>
                            <p>Cityville, Educationland 45678</p>
                        </motion.div>

                        {/* Phone */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={contactInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="p-6 bg-white text-gray-800 rounded-2xl shadow-2xl"
                        >
                            <h4 className="text-xl font-bold mb-4">
                                Phone Number
                            </h4>
                            <p>+1 234 567 890</p>
                            <p>Mon - Fri, 9:00 AM - 6:00 PM</p>
                        </motion.div>

                        {/* Email */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={contactInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="p-6 bg-white text-gray-800 rounded-2xl shadow-2xl"
                        >
                            <h4 className="text-xl font-bold mb-4">
                                Email Address
                            </h4>
                            <p>info@kidseducation.com</p>
                            <p>support@kidseducation.com</p>
                        </motion.div>
                    </div>

                    {/* Illustration */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={contactInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mt-20"
                    >
                        <img
                            src={undrawImage}
                            alt="Contact Illustration"
                            className="w-full max-w-lg mx-auto rounded-xl shadow-xl"
                        />
                    </motion.div>
                </div>
            </section>
        </GuestFrontLayout>
    );
}
