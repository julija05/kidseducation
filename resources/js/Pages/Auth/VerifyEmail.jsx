import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import PrimaryButton from "@/Components/PrimaryButton";
import NavBar from "@/Components/NavBar";
import { Mail, Shield, CheckCircle, LogOut, RotateCcw } from "lucide-react";
import verifyEmailIllustration from "../../../assets/kid-no-bg.png";
import { useTranslation } from "@/hooks/useTranslation";

export default function VerifyEmail({ status, auth }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"));
    };

    return (
        <>
            <Head title="Email Verification - Abacoding" />
            <NavBar auth={auth} />

            <section className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-4 py-12">
                {/* Decorative blobs */}
                <div className="absolute top-0 -left-10 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute bottom-0 -right-10 w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-50 animate-spin-slow" />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white z-10 max-w-5xl w-full rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2"
                >
                    {/* Illustration Side */}
                    <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-violet-100 p-8">
                        <img
                            src={verifyEmailIllustration}
                            alt="Email Verification Illustration"
                            className="w-80 h-auto"
                        />
                    </div>

                    {/* Email Verification Content */}
                    <div className="p-10">
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                                {t('auth.verify_email.title')}
                            </h2>
                            <p className="text-md text-gray-600">
                                {t('auth.verify_email.subtitle')}
                            </p>
                        </div>

                        {status === 'verification-link-sent' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">
                                            {t('auth.verify_email.email_sent_title')}
                                        </p>
                                        <p className="text-sm text-green-700 mt-1">
                                            {t('auth.verify_email.email_sent_text')}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="mb-8 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-start">
                                <Mail className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                                        {t('auth.verify_email.check_email_title')}
                                    </h3>
                                    <p className="text-sm text-purple-800 mb-3">
                                        {t('auth.verify_email.check_email_text_1')}
                                    </p>
                                    <p className="text-sm text-purple-700">
                                        {t('auth.verify_email.check_email_text_2')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <PrimaryButton
                                className="w-full justify-center bg-gradient-to-r from-purple-500 to-pink-600 hover:from-pink-600 hover:to-purple-500 text-white text-lg rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        {t('auth.verify_email.sending_email')}
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <RotateCcw className="w-5 h-5 mr-2" />
                                        {t('auth.verify_email.resend_verification_email')}
                                    </div>
                                )}
                            </PrimaryButton>

                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 font-medium"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                {t('auth.verify_email.log_out')}
                            </Link>
                        </form>

                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                                <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        {t('auth.verify_email.security_info_title')}
                                    </h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        {t('auth.verify_email.security_info_text')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </>
    );
}
