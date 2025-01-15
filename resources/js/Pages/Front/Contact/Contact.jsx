import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import undrawImage from "../../../../assets/contact-us.svg";

export default function ContactUs() {
    const [contactRef, contactInView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <section
            id="contact"
            className="relative min-h-screen py-16 bg-gradient-to-r from-green-400 to-blue-500 text-white"
        >
            {/* Custom Divider */}
            <div class="custom-shape-divider-top-1736802648">
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

            <div className="container mx-auto px-6 lg:px-12">
                {/* Section Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={contactInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    ref={contactRef}
                    className="text-4xl font-bold text-center mb-12"
                >
                    Contact Us
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Address */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={contactInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="p-6 bg-white text-gray-800 rounded-lg shadow-lg"
                    >
                        <h4 className="text-xl font-bold mb-4">Address</h4>
                        <p>123 Learning Avenue</p>
                        <p>Cityville, Educationland 45678</p>
                    </motion.div>

                    {/* Phone Number */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={contactInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="p-6 bg-white text-gray-800 rounded-lg shadow-lg"
                    >
                        <h4 className="text-xl font-bold mb-4">Phone Number</h4>
                        <p>+1 234 567 890</p>
                        <p>Mon - Fri, 9:00 AM - 6:00 PM</p>
                    </motion.div>

                    {/* Email Address */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={contactInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="p-6 bg-white text-gray-800 rounded-lg shadow-lg"
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
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={contactInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-16 text-center"
                >
                    <img
                        src={undrawImage}
                        alt="Contact Illustration"
                        className="w-full max-w-lg mx-auto rounded-lg shadow-lg"
                    />
                </motion.div>
            </div>
        </section>
    );
}
