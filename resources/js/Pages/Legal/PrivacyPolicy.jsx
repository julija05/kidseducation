import React from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import NavBar from "@/Components/NavBar";
import { Shield, Lock, Eye, FileCheck, Users, Database, Mail, Phone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function PrivacyPolicy({ auth }) {
    const { t } = useTranslation();

    const sections = [
        {
            icon: <FileCheck className="w-6 h-6" />,
            title: "Information We Collect",
            content: [
                "Personal Information: Name, email address, age, and parent/guardian contact information when creating an account.",
                "Educational Data: Progress tracking, lesson completion status, quiz scores, and learning preferences.",
                "Usage Information: How you interact with our platform, time spent on lessons, and feature usage patterns.",
                "Device Information: IP address, browser type, operating system, and device specifications for security and optimization.",
            ]
        },
        {
            icon: <Eye className="w-6 h-6" />,
            title: "How We Use Your Information",
            content: [
                "Provide and improve our educational services and platform functionality.",
                "Track learning progress and customize educational content to individual needs.",
                "Communicate with students and parents about account status, updates, and educational opportunities.",
                "Ensure platform security, prevent fraud, and protect user safety.",
                "Analyze usage patterns to enhance user experience and develop new features.",
                "Comply with legal obligations and protect our rights and interests.",
            ]
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Information Sharing",
            content: [
                "We do NOT sell, rent, or trade personal information to third parties for marketing purposes.",
                "Parent/Guardian Access: Parents and guardians have full access to their child's educational data and progress.",
                "Service Providers: We may share data with trusted third-party service providers who help us operate our platform (hosting, analytics, customer support).",
                "Legal Requirements: We may disclose information when required by law, court order, or to protect rights and safety.",
                "Business Transfers: In the event of a merger or acquisition, user data may be transferred with appropriate notice.",
            ]
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: "Data Security",
            content: [
                "We implement industry-standard security measures including encryption, secure servers, and access controls.",
                "All sensitive data is encrypted in transit and at rest using advanced cryptographic protocols.",
                "Regular security audits and monitoring to protect against unauthorized access or data breaches.",
                "Employee training on data protection and strict access controls based on job responsibilities.",
                "Secure backup systems to prevent data loss while maintaining privacy protections.",
            ]
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: "Data Retention",
            content: [
                "Educational progress data is retained for the duration of active enrollment plus 3 years for educational records.",
                "Account information is retained as long as the account remains active.",
                "Inactive accounts may be deleted after 2 years of inactivity with prior notice.",
                "Users can request data deletion at any time, subject to legal retention requirements.",
                "Backup data is securely deleted according to our data retention schedule.",
            ]
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Children's Privacy (COPPA Compliance)",
            content: [
                "We are committed to protecting children's privacy and comply with COPPA regulations.",
                "Parental consent is required before collecting personal information from children under 13.",
                "Parents have the right to review, modify, or delete their child's personal information.",
                "We do not require children to disclose more information than necessary to participate in activities.",
                "Parents can contact us to review what information we have collected from their child.",
            ]
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <>
            <Head title="Privacy Policy - Abacoding" />
            <NavBar auth={auth} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
                {/* Hero Section */}
                <section className="py-20 px-4 text-center relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-r from-pink-200 to-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto relative z-10"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-blue-100 p-4 rounded-full">
                                <Shield className="w-12 h-12 text-blue-600" />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-gray-600 mb-4">
                            Your privacy and security are our top priorities
                        </p>
                        <p className="text-gray-500">
                            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </motion.div>
                </section>

                {/* Introduction */}
                <motion.section 
                    className="py-12 px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                At <span className="font-semibold text-blue-600">Abacoding</span>, we are committed to protecting the privacy and security of our users, especially children and their families. This Privacy Policy explains how we collect, use, protect, and share information when you use our educational platform. We believe in transparency and want you to understand exactly how your data is handled.
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* Main Sections */}
                <motion.section 
                    className="py-12 px-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="max-w-4xl mx-auto space-y-8">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-shadow duration-300"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {section.title}
                                    </h2>
                                </div>
                                <ul className="space-y-3">
                                    {section.content.map((item, itemIndex) => (
                                        <li key={itemIndex} className="text-gray-700 leading-relaxed pl-6 border-l-2 border-blue-200">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Your Rights Section */}
                <motion.section 
                    className="py-12 px-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-200">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                                Your Rights & Choices
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-500 text-white p-2 rounded-lg mt-1">
                                            <Eye className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Access Your Data</h3>
                                            <p className="text-gray-600">Request a copy of all personal information we have about you.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-purple-500 text-white p-2 rounded-lg mt-1">
                                            <FileCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Correct Information</h3>
                                            <p className="text-gray-600">Update or correct any inaccurate personal information.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-pink-500 text-white p-2 rounded-lg mt-1">
                                            <Database className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Delete Your Data</h3>
                                            <p className="text-gray-600">Request deletion of your personal information (subject to legal requirements).</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-yellow-500 text-white p-2 rounded-lg mt-1">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Data Portability</h3>
                                            <p className="text-gray-600">Export your data in a commonly used, machine-readable format.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Contact Section */}
                <motion.section 
                    className="py-16 px-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                                Questions About Your Privacy?
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                If you have any questions about this Privacy Policy or how we handle your data, please don't hesitate to contact us.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-xl">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">Email Us</p>
                                        <p className="text-blue-600">privacy@abacoding.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-3 p-4 bg-purple-50 rounded-xl">
                                    <Phone className="w-6 h-6 text-purple-600" />
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">Call Us</p>
                                        <p className="text-purple-600">1-800-ABACODING</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-6">
                                We typically respond to privacy inquiries within 48 hours.
                            </p>
                        </div>
                    </div>
                </motion.section>
            </div>
        </>
    );
}