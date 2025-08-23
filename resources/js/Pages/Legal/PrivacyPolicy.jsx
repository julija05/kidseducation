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
            title: t('legal.privacy_policy.information_collect'),
            content: t('legal.privacy_policy.information_collect_content')
        },
        {
            icon: <Eye className="w-6 h-6" />,
            title: t('legal.privacy_policy.how_we_use'),
            content: t('legal.privacy_policy.how_we_use_content')
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: t('legal.privacy_policy.information_sharing'),
            content: t('legal.privacy_policy.information_sharing_content')
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: t('legal.privacy_policy.data_security'),
            content: t('legal.privacy_policy.data_security_content')
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: t('legal.privacy_policy.data_retention'),
            content: t('legal.privacy_policy.data_retention_content')
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: t('legal.privacy_policy.children_privacy'),
            content: t('legal.privacy_policy.children_privacy_content')
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
            <Head title={`${t('legal.privacy_policy.title')} - Abacoding`} />
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
                            {t('legal.privacy_policy.title')}
                        </h1>
                        <p className="text-xl text-gray-600 mb-4">
                            {t('legal.privacy_policy.subtitle')}
                        </p>
                        <p className="text-gray-500">
                            {t('legal.privacy_policy.last_updated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                                {t('legal.privacy_policy.intro')}
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
                                    {Array.isArray(section.content) ? section.content.map((item, itemIndex) => (
                                        <li key={itemIndex} className="text-gray-700 leading-relaxed pl-6 border-l-2 border-blue-200">
                                            {item}
                                        </li>
                                    )) : (
                                        <li className="text-gray-700 leading-relaxed pl-6 border-l-2 border-blue-200">
                                            {section.content}
                                        </li>
                                    )}
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
                                {t('legal.privacy_policy.your_rights')}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-500 text-white p-2 rounded-lg mt-1">
                                            <Eye className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{t('legal.privacy_policy.access_data')}</h3>
                                            <p className="text-gray-600">{t('legal.privacy_policy.access_data_desc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-purple-500 text-white p-2 rounded-lg mt-1">
                                            <FileCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{t('legal.privacy_policy.correct_info')}</h3>
                                            <p className="text-gray-600">{t('legal.privacy_policy.correct_info_desc')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-pink-500 text-white p-2 rounded-lg mt-1">
                                            <Database className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{t('legal.privacy_policy.delete_data')}</h3>
                                            <p className="text-gray-600">{t('legal.privacy_policy.delete_data_desc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-yellow-500 text-white p-2 rounded-lg mt-1">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{t('legal.privacy_policy.data_portability')}</h3>
                                            <p className="text-gray-600">{t('legal.privacy_policy.data_portability_desc')}</p>
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
                                {t('legal.privacy_policy.questions_privacy')}
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                {t('legal.privacy_policy.contact_desc')}
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-xl">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">{t('legal.privacy_policy.email_us')}</p>
                                        <p className="text-blue-600">privacy@abacoding.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-3 p-4 bg-purple-50 rounded-xl">
                                    <Phone className="w-6 h-6 text-purple-600" />
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">{t('legal.privacy_policy.call_us')}</p>
                                        <p className="text-purple-600">1-800-ABACODING</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-6">
                                {t('legal.privacy_policy.response_time')}
                            </p>
                        </div>
                    </div>
                </motion.section>
            </div>
        </>
    );
}