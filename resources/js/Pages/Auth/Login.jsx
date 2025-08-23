import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import NavBar from "@/Components/NavBar";
import loginIllustration from "../../../assets/kid-no-bg.png";
import { useTranslation } from "@/hooks/useTranslation";
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from "lucide-react";

export default function Login({ status, canResetPassword, auth }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <NavBar auth={auth} />

            <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-pink-50 relative overflow-hidden px-4 py-12">
                {/* Enhanced decorative elements */}
                <div className="absolute top-0 -left-10 w-96 h-96 bg-gradient-to-r from-pink-200 to-yellow-200 rounded-full blur-3xl opacity-60 animate-pulse" />
                <div
                    className="absolute bottom-0 -right-10 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-60 animate-bounce"
                    style={{ animationDuration: "6s" }}
                />
                <div
                    className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-full blur-2xl opacity-40 animate-pulse"
                    style={{ animationDelay: "2s" }}
                />

                {/* Floating particles */}
                <motion.div
                    className="absolute top-20 left-20 w-4 h-4 bg-pink-400 rounded-full"
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute top-40 right-40 w-3 h-3 bg-yellow-400 rounded-full"
                    animate={{
                        y: [0, -15, 0],
                        x: [0, 10, 0],
                        opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                />
                <motion.div
                    className="absolute bottom-40 left-40 w-2 h-2 bg-blue-400 rounded-full"
                    animate={{
                        y: [0, -25, 0],
                        opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-white/70 backdrop-blur-lg z-10 max-w-5xl w-full rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid md:grid-cols-2"
                >
                    {/* Illustration Side */}
                    <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-pink-100/80 via-yellow-100/80 to-blue-100/80 p-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-blue-200/30 backdrop-blur-sm"></div>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                duration: 1,
                                ease: "easeOut",
                                delay: 0.3,
                            }}
                            className="relative z-10"
                        >
                            <img
                                src={loginIllustration}
                                alt="Login Illustration"
                                className="w-80 h-auto drop-shadow-2xl"
                            />
                        </motion.div>

                        {/* Sparkle effects */}
                        <motion.div
                            className="absolute top-16 left-16 text-yellow-400"
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        >
                            <Sparkles className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                            className="absolute bottom-20 right-20 text-pink-400"
                            animate={{
                                rotate: [360, 0],
                                scale: [1, 1.3, 1],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        >
                            <Sparkles className="w-5 h-5" />
                        </motion.div>
                    </div>

                    {/* Login Form */}
                    <div className="p-10 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                                {t("auth.login.title")}
                            </h2>
                            <p className="text-md text-gray-600 mb-2">
                                {t("auth.login.subtitle")}
                            </p>
                            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full mx-auto"></div>
                        </motion.div>

                        {status && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700 text-center"
                            >
                                {status}
                            </motion.div>
                        )}

                        <motion.form
                            onSubmit={submit}
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <div>
                                <InputLabel
                                    htmlFor="email"
                                    value={t("auth.login.email")}
                                />
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 block w-full transition-all duration-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                        autoComplete="username"
                                        isFocused={true}
                                        placeholder="Enter your email address"
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value={t("auth.login.password")}
                                />
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                    <TextInput
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={data.password}
                                        className="pl-10 pr-12 block w-full transition-all duration-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />

                                <div className="flex items-center justify-between mt-3">
                                    <label className="flex items-center space-x-2">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData(
                                                    "remember",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <span className="text-sm text-gray-600">
                                            {t("auth.login.remember_me")}
                                        </span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="text-sm text-pink-500 hover:text-pink-600 font-medium hover:underline transition-colors duration-200"
                                        >
                                            {t("auth.login.forgot_password")}
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <PrimaryButton
                                    className="w-full justify-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg rounded-xl py-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            {t("auth.login.login_button")}
                                        </>
                                    )}
                                </PrimaryButton>
                            </motion.div>
                        </motion.form>

                        {/* <p className="mt-6 text-center text-sm text-gray-600">
                            Don’t have an account?{" "}
                            <Link
                                href={route("register")}
                                className="text-pink-500 font-semibold hover:underline"
                            >
                                Register
                            </Link>
                        </p> */}
                    </div>
                </motion.div>
            </section>
        </>
    );
}
