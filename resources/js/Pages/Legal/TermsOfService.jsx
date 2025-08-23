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
            title: t('legal.terms_of_service.acceptance_eligibility'),
            content: t('legal.terms_of_service.acceptance_eligibility_content')
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: t('legal.terms_of_service.educational_services'),
            content: t('legal.terms_of_service.educational_services_content')
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: t('legal.terms_of_service.user_responsibilities'),
            content: t('legal.terms_of_service.user_responsibilities_content')
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            title: t('legal.terms_of_service.prohibited_activities'),
            content: t('legal.terms_of_service.prohibited_activities_content')
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: t('legal.terms_of_service.payment_billing'),
            content: t('legal.terms_of_service.payment_billing_content')
        },
        {
            icon: <Scale className="w-6 h-6" />,
            title: t('legal.terms_of_service.intellectual_property'),
            content: t('legal.terms_of_service.intellectual_property_content')
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: t('legal.terms_of_service.privacy_data_protection'),
            content: t('legal.terms_of_service.privacy_data_protection_content')
        },
        {
            icon: <Gavel className="w-6 h-6" />,
            title: t('legal.terms_of_service.limitation_liability'),
            content: t('legal.terms_of_service.limitation_liability_content')
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
            <Head title={`${t('legal.terms_of_service.title')} - Abacoding`} />
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
                            {t('legal.terms_of_service.title')}
                        </h1>
                        <p className="text-xl text-gray-600 mb-4">
                            {t('legal.terms_of_service.subtitle')}
                        </p>
                        <p className="text-gray-500">
                            {t('legal.terms_of_service.last_updated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                                {t('legal.terms_of_service.intro')}
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
                                    {Array.isArray(section.content) ? section.content.map((item, itemIndex) => (
                                        <li key={itemIndex} className="text-gray-700 leading-relaxed pl-6 border-l-2 border-purple-200">
                                            {item}
                                        </li>
                                    )) : (
                                        <li className="text-gray-700 leading-relaxed pl-6 border-l-2 border-purple-200">
                                            {section.content}
                                        </li>
                                    )}
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
                                    {t('legal.terms_of_service.important_info')}
                                </h2>
                            </div>
                            <div className="space-y-4 text-gray-700">
                                <p className="leading-relaxed">
                                    <strong>{t('legal.terms_of_service.termination')}:</strong> {t('legal.terms_of_service.termination_desc')}
                                </p>
                                <p className="leading-relaxed">
                                    <strong>{t('legal.terms_of_service.changes_terms')}:</strong> {t('legal.terms_of_service.changes_terms_desc')}
                                </p>
                                <p className="leading-relaxed">
                                    <strong>{t('legal.terms_of_service.governing_law')}:</strong> {t('legal.terms_of_service.governing_law_desc')}
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
                                {t('legal.terms_of_service.questions_terms')}
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                {t('legal.terms_of_service.questions_terms_desc')}
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-center justify-center gap-3 p-4 bg-purple-50 rounded-xl">
                                    <FileText className="w-6 h-6 text-purple-600" />
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">{t('legal.terms_of_service.email_support')}</p>
                                        <p className="text-purple-600">legal@abacoding.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-3 p-4 bg-pink-50 rounded-xl">
                                    <Scale className="w-6 h-6 text-pink-600" />
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">{t('legal.terms_of_service.legal_department')}</p>
                                        <p className="text-pink-600">1-800-ABACODING</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-600">
                                    {t('legal.terms_of_service.terms_agreement')}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </>
    );
}