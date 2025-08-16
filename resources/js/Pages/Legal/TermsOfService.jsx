import React from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import NavBar from "@/Components/NavBar";
import { Scale, FileText, Users, Shield, AlertTriangle, CreditCard, Gavel, BookOpen } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function TermsOfService({ auth }) {
    const { t } = useTranslation();

    const sections = [
        {
            icon: <Users className="w-6 h-6" />,
            title: "Acceptance and Eligibility",
            content: [
                "By accessing or using Abacoding, you agree to be bound by these Terms of Service and all applicable laws.",
                "If you are under 18, your parent or guardian must accept these terms on your behalf.",
                "You must provide accurate, current, and complete information when creating an account.",
                "You are responsible for maintaining the security and confidentiality of your account credentials.",
                "Each user may only maintain one active account unless explicitly authorized by us.",
            ]
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: "Educational Services",
            content: [
                "Abacoding provides online educational content including mathematics, coding, and other subjects for children.",
                "We strive to provide high-quality educational content but cannot guarantee specific learning outcomes.",
                "Content is designed for educational purposes and should supplement, not replace, formal education.",
                "Access to certain features may require enrollment in specific programs or payment of applicable fees.",
                "We reserve the right to modify, update, or discontinue educational content with reasonable notice.",
            ]
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: "User Responsibilities",
            content: [
                "Use the platform solely for educational purposes in accordance with these terms.",
                "Respect other users and maintain appropriate online behavior at all times.",
                "Do not share account credentials or allow unauthorized access to your account.",
                "Report any technical issues, inappropriate content, or violations of these terms promptly.",
                "Ensure that any content you submit (reviews, comments) is appropriate and lawful.",
                "Parents/guardians are responsible for supervising their child's use of the platform.",
            ]
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            title: "Prohibited Activities",
            content: [
                "Attempting to hack, interfere with, or gain unauthorized access to our systems.",
                "Using the platform for any commercial purpose without explicit written permission.",
                "Sharing inappropriate, harmful, or illegal content through our platform.",
                "Harassing, bullying, or engaging in any form of inappropriate behavior toward other users.",
                "Attempting to circumvent payment systems or access paid content without authorization.",
                "Using automated tools or bots to access or interact with our platform.",
                "Violating any applicable laws or regulations while using our services.",
            ]
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: "Payment and Billing",
            content: [
                "Some educational programs require payment of fees as displayed during enrollment.",
                "All fees are charged in advance and are non-refundable except as required by law.",
                "We reserve the right to change pricing with 30 days advance notice to existing users.",
                "Payment information is processed securely through third-party payment processors.",
                "Failure to pay applicable fees may result in suspension or termination of access.",
                "Refund requests must be submitted within 14 days of purchase and will be reviewed case by case.",
            ]
        },
        {
            icon: <Scale className="w-6 h-6" />,
            title: "Intellectual Property",
            content: [
                "All content, including text, graphics, videos, software, and educational materials, is owned by Abacoding or our licensors.",
                "Users are granted a limited, non-exclusive license to access and use content for personal educational purposes only.",
                "You may not copy, distribute, modify, or create derivative works from our content without permission.",
                "User-generated content (reviews, progress data) remains yours, but you grant us permission to use it to improve our services.",
                "We respect intellectual property rights and will respond to valid DMCA takedown notices.",
            ]
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Privacy and Data Protection",
            content: [
                "Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms.",
                "We implement appropriate security measures to protect user data and educational records.",
                "Educational progress and performance data may be shared with parents/guardians as applicable.",
                "We comply with COPPA and other applicable privacy laws regarding children's information.",
                "Users may request access to, correction of, or deletion of their personal information subject to legal requirements.",
            ]
        },
        {
            icon: <Gavel className="w-6 h-6" />,
            title: "Limitation of Liability",
            content: [
                "Abacoding is provided \"as is\" without warranties of any kind, express or implied.",
                "We do not guarantee uninterrupted access or that the platform will be error-free.",
                "Our liability is limited to the amount paid by you in the 12 months preceding any claim.",
                "We are not liable for indirect, incidental, or consequential damages arising from your use.",
                "Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.",
                "You agree to indemnify and hold us harmless from claims arising from your violation of these terms.",
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
            <Head title="Terms of Service - Abacoding" />
            <NavBar auth={auth} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
                {/* Hero Section */}
                <section className="py-20 px-4 text-center relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-gradient-to-r from-blue-200 to-green-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto relative z-10"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-purple-100 p-4 rounded-full">
                                <Scale className="w-12 h-12 text-purple-600" />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
                            Terms of Service
                        </h1>
                        <p className="text-xl text-gray-600 mb-4">
                            Clear guidelines for using our educational platform
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
                                Welcome to <span className="font-semibold text-purple-600">Abacoding</span>! These Terms of Service ("Terms") govern your access to and use of our educational platform. By using Abacoding, you agree to these terms, so please read them carefully. We've written these terms to be as clear and straightforward as possible while ensuring both your rights and ours are protected.
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
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {section.title}
                                    </h2>
                                </div>
                                <ul className="space-y-3">
                                    {section.content.map((item, itemIndex) => (
                                        <li key={itemIndex} className="text-gray-700 leading-relaxed pl-6 border-l-2 border-purple-200">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Important Notice */}
                <motion.section 
                    className="py-12 px-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-amber-500 text-white p-3 rounded-xl">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800">
                                    Important Information
                                </h2>
                            </div>
                            <div className="space-y-4 text-gray-700">
                                <p className="leading-relaxed">
                                    <strong>Termination:</strong> We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will cease immediately.
                                </p>
                                <p className="leading-relaxed">
                                    <strong>Changes to Terms:</strong> We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                                </p>
                                <p className="leading-relaxed">
                                    <strong>Governing Law:</strong> These Terms shall be interpreted and governed by the laws of the State of [Your State], without regard to conflict of law provisions. Any disputes will be resolved in the courts of [Your Jurisdiction].
                                </p>
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
                                Questions About These Terms?
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                If you have any questions about these Terms of Service, please contact us. We're here to help clarify anything that might be unclear.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-center justify-center gap-3 p-4 bg-purple-50 rounded-xl">
                                    <FileText className="w-6 h-6 text-purple-600" />
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">Email Support</p>
                                        <p className="text-purple-600">legal@abacoding.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-3 p-4 bg-pink-50 rounded-xl">
                                    <Scale className="w-6 h-6 text-pink-600" />
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">Legal Department</p>
                                        <p className="text-pink-600">1-800-ABACODING</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-600">
                                    By continuing to use Abacoding after any changes to these Terms, you agree to the revised Terms. 
                                    We encourage you to review these Terms periodically.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </>
    );
}