import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import NavBar from "@/Components/NavBar";
import { Lock, Eye, EyeOff, Shield, Key, CheckCircle } from "lucide-react";
import resetPasswordIllustration from "../../../assets/kid-no-bg.png";
import { useTranslation } from "@/hooks/useTranslation";

export default function ResetPassword({ token, email, auth }) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.store"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    const passwordRequirements = [
        { text: "At least 8 characters", met: data.password.length >= 8 },
        { text: "Contains uppercase letter", met: /[A-Z]/.test(data.password) },
        { text: "Contains lowercase letter", met: /[a-z]/.test(data.password) },
        { text: "Contains number", met: /\d/.test(data.password) },
    ];

    return (
        <>
            <Head title="Reset Password - Abacoding" />
            <NavBar auth={auth} />

            <section className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-4 py-12">
                {/* Decorative blobs */}
                <div className="absolute top-0 -left-10 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute bottom-0 -right-10 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-50 animate-spin-slow" />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white z-10 max-w-5xl w-full rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2"
                >
                    {/* Illustration Side */}
                    <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 p-8">
                        <img
                            src={resetPasswordIllustration}
                            alt="Reset Password Illustration"
                            className="w-80 h-auto"
                        />
                    </div>

                    {/* Reset Password Form */}
                    <div className="p-10">
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                                <Key className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                                Reset Password
                            </h2>
                            <p className="text-md text-gray-600">
                                Create a new secure password for your account
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email Field (Read-only) */}
                            <div>
                                <InputLabel htmlFor="email" value="Email Address" className="text-gray-700 font-medium" />
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Shield className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 block w-full border-gray-300 rounded-lg bg-gray-50"
                                        autoComplete="username"
                                        readOnly
                                        onChange={(e) => setData("email", e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* New Password Field */}
                            <div>
                                <InputLabel htmlFor="password" value="New Password" className="text-gray-700 font-medium" />
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        className="pl-10 pr-10 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        autoComplete="new-password"
                                        isFocused={true}
                                        placeholder="Enter your new password"
                                        onChange={(e) => setData("password", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                                
                                {/* Password Requirements */}
                                {data.password && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                                        <div className="space-y-1">
                                            {passwordRequirements.map((req, index) => (
                                                <div key={index} className="flex items-center text-xs">
                                                    <CheckCircle 
                                                        className={`h-3 w-3 mr-2 ${req.met ? 'text-green-500' : 'text-gray-300'}`}
                                                    />
                                                    <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                                                        {req.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm New Password" className="text-gray-700 font-medium" />
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password_confirmation"
                                        type={showPasswordConfirmation ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="pl-10 pr-10 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        autoComplete="new-password"
                                        placeholder="Confirm your new password"
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-2" />
                                
                                {/* Password Match Indicator */}
                                {data.password_confirmation && data.password && (
                                    <div className="mt-2 flex items-center text-xs">
                                        <CheckCircle 
                                            className={`h-3 w-3 mr-2 ${
                                                data.password === data.password_confirmation 
                                                    ? 'text-green-500' 
                                                    : 'text-red-500'
                                            }`}
                                        />
                                        <span className={
                                            data.password === data.password_confirmation 
                                                ? 'text-green-600' 
                                                : 'text-red-600'
                                        }>
                                            {data.password === data.password_confirmation 
                                                ? 'Passwords match' 
                                                : 'Passwords do not match'
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>

                            <PrimaryButton
                                className="w-full justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white text-lg rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Resetting Password...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <Key className="w-5 h-5 mr-2" />
                                        Reset Password
                                    </div>
                                )}
                            </PrimaryButton>
                        </form>

                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                                <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Security Tips
                                    </h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Choose a strong, unique password that you haven't used elsewhere. 
                                        Consider using a password manager for better security.
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
