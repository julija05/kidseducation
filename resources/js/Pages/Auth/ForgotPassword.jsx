import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import NavBar from "@/Components/NavBar";
import { Mail, ArrowLeft, Shield } from "lucide-react";
import forgotPasswordIllustration from "../../../assets/kid-no-bg.png";
import { useTranslation } from "@/hooks/useTranslation";

export default function ForgotPassword({ status, auth }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <>
            <Head title="Forgot Password - Abacoding" />
            <NavBar auth={auth} />

            <section className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-4 py-12">
                {/* Decorative blobs */}
                <div className="absolute top-0 -left-10 w-72 h-72 bg-orange-300 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute bottom-0 -right-10 w-72 h-72 bg-red-300 rounded-full blur-3xl opacity-50 animate-spin-slow" />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white z-10 max-w-5xl w-full rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2"
                >
                    {/* Illustration Side */}
                    <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 p-8">
                        <img
                            src={forgotPasswordIllustration}
                            alt="Forgot Password Illustration"
                            className="w-80 h-auto"
                        />
                    </div>

                    {/* Forgot Password Form */}
                    <div className="p-10">
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                                Forgot Password?
                            </h2>
                            <p className="text-md text-gray-600">
                                No worries! Enter your email and we'll send you a reset link.
                            </p>
                        </div>

                        {status && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Shield className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">
                                            Email Sent Successfully!
                                        </p>
                                        <p className="text-sm text-green-700 mt-1">
                                            {status}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="email" value="Email Address" className="text-gray-700 font-medium" />
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                        autoComplete="email"
                                        isFocused={true}
                                        placeholder="Enter your email address"
                                        onChange={(e) => setData("email", e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="space-y-4">
                                <PrimaryButton
                                    className="w-full justify-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white text-lg rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Sending Email...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <Mail className="w-5 h-5 mr-2" />
                                            Send Reset Link
                                        </div>
                                    )}
                                </PrimaryButton>

                                <Link
                                    href={route("login")}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 font-medium"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>

                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                                <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Security Information
                                    </h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        The reset link will expire in 60 minutes for your security. 
                                        If you don't receive the email, check your spam folder.
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
