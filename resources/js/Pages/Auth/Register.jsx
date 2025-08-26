import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import NavBar from "@/Components/NavBar";
import PasswordStrengthIndicator from "@/Components/PasswordStrengthIndicator";
import {
    UserPlus,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Sparkles,
    Shield,
    Check,
} from "lucide-react";
import registerIllustration from "../../../assets/kid-no-bg.png";
import { useTranslation } from "@/hooks/useTranslation";

export default function Register({ auth }) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();

        console.log("Registration data:", data);
        console.log("Current errors:", errors);

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
            onError: (errors) => {
                console.log("Registration errors received:", errors);
            },
            onSuccess: () => {
                console.log("Registration successful");
            },
        });
    };

    return (
        <>
            <Head title="Join Abacoding - Register" />
            <NavBar auth={auth} />

            <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden px-4 py-12">
                {/* Enhanced decorative elements */}
                <div className="absolute top-0 -left-10 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-60 animate-pulse" />
                <div
                    className="absolute bottom-0 -right-10 w-80 h-80 bg-gradient-to-r from-pink-200 to-yellow-200 rounded-full blur-3xl opacity-60 animate-bounce"
                    style={{ animationDuration: "6s" }}
                />
                <div
                    className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full blur-2xl opacity-40 animate-pulse"
                    style={{ animationDelay: "1.5s" }}
                />

                {/* Floating particles */}
                <motion.div
                    className="absolute top-32 right-20 w-3 h-3 bg-blue-400 rounded-full"
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute top-60 left-40 w-4 h-4 bg-purple-400 rounded-full"
                    animate={{
                        y: [0, -15, 0],
                        x: [0, 15, 0],
                        opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-white/70 backdrop-blur-lg z-10 max-w-5xl w-full rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid md:grid-cols-2"
                >
                    {/* Illustration Side */}
                    <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-100/80 via-purple-100/80 to-pink-100/80 p-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-200/30 backdrop-blur-sm"></div>
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
                                src={registerIllustration}
                                alt="Join Abacoding"
                                className="w-80 h-auto drop-shadow-2xl"
                            />
                        </motion.div>

                        {/* Animated icons */}
                        <motion.div
                            className="absolute top-20 left-16 text-blue-400"
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
                            <Shield className="w-6 h-6" />
                        </motion.div>

                        <motion.div
                            className="absolute bottom-24 right-16 text-purple-400"
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

                        <motion.div
                            className="absolute top-32 right-24 text-pink-400"
                            animate={{
                                y: [0, -10, 0],
                                opacity: [0.6, 1, 0.6],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <Check className="w-4 h-4" />
                        </motion.div>
                    </div>

                    {/* Registration Form */}
                    <div className="p-10 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                                {t("auth.register.title")}
                            </h2>
                            <p className="text-md text-gray-600 mb-2">
                                {t("auth.register.subtitle")}
                            </p>
                            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto"></div>
                        </motion.div>

                        <motion.form
                            onSubmit={submit}
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            {/* First and Last Name Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                >
                                    <InputLabel
                                        htmlFor="first_name"
                                        value={t("forms.first_name")}
                                    />
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                        <TextInput
                                            id="first_name"
                                            name="first_name"
                                            value={data.first_name}
                                            className="pl-10 block w-full transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                                            autoComplete="given-name"
                                            isFocused={true}
                                            onChange={(e) =>
                                                setData(
                                                    "first_name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>
                                    <InputError
                                        message={errors.first_name}
                                        className="mt-2"
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                >
                                    <InputLabel
                                        htmlFor="last_name"
                                        value={t("forms.last_name")}
                                    />
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                        <TextInput
                                            id="last_name"
                                            name="last_name"
                                            value={data.last_name}
                                            className="pl-10 block w-full transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                                            autoComplete="family-name"
                                            onChange={(e) =>
                                                setData(
                                                    "last_name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>
                                    <InputError
                                        message={errors.last_name}
                                        className="mt-2"
                                    />
                                </motion.div>
                            </div>

                            {/* Email Field */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                            >
                                <InputLabel
                                    htmlFor="email"
                                    value={t("auth.register.email_address")}
                                />
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 block w-full transition-all duration-200 focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                                        autoComplete="username"
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder={t(
                                            "auth.register.email_placeholder"
                                        )}
                                        required
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </motion.div>

                            {/* Password Field */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                            >
                                <InputLabel
                                    htmlFor="password"
                                    value={t("auth.register.password")}
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
                                        className="pl-10 pr-12 block w-full transition-all duration-200 focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder={t(
                                            "auth.register.password_placeholder"
                                        )}
                                        required
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
                                <PasswordStrengthIndicator
                                    password={data.password}
                                />
                            </motion.div>

                            {/* Confirm Password Field */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.9 }}
                            >
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value={t("auth.register.confirm_password")}
                                />
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                    <TextInput
                                        id="password_confirmation"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="pl-10 pr-12 block w-full transition-all duration-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                        placeholder={t(
                                            "auth.register.confirm_password_placeholder"
                                        )}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </motion.div>

                            {/* Terms Agreement */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.95 }}
                                className="text-center text-sm text-gray-600"
                            >
                                <p>
                                    {t("auth.register.terms_agreement_part1")}{" "}
                                    <Link
                                        href={route("legal.terms")}
                                        className="text-purple-500 font-medium hover:text-purple-600 hover:underline transition-colors duration-200"
                                        target="_blank"
                                    >
                                        {t("auth.register.terms_of_service")}
                                    </Link>{" "}
                                    {t("auth.register.terms_agreement_and")}{" "}
                                    <Link
                                        href={route("legal.privacy")}
                                        className="text-blue-500 font-medium hover:text-blue-600 hover:underline transition-colors duration-200"
                                        target="_blank"
                                    >
                                        {t("auth.register.privacy_policy")}
                                    </Link>
                                    {t("auth.register.terms_agreement_part2")}
                                </p>
                            </motion.div>

                            {/* Global Error Display */}
                            {Object.keys(errors).length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                                >
                                    <p className="text-red-800 font-medium mb-2">
                                        Please fix the following errors:
                                    </p>
                                    <ul className="text-sm text-red-700 space-y-1">
                                        {Object.entries(errors).map(
                                            ([field, messages]) => (
                                                <li key={field}>
                                                    <strong>{field}:</strong>{" "}
                                                    {Array.isArray(messages)
                                                        ? messages[0]
                                                        : messages}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.0 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <PrimaryButton
                                    className="w-full justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white text-lg rounded-xl py-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {t(
                                                "auth.register.creating_account"
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            {t("auth.register.create_account")}
                                        </>
                                    )}
                                </PrimaryButton>
                            </motion.div>
                        </motion.form>

                        {/* Footer */}
                        <motion.p
                            className="mt-6 text-center text-sm text-gray-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.1 }}
                        >
                            {t("auth.register.already_have_account")}{" "}
                            <Link
                                href={route("login")}
                                className="text-purple-500 font-semibold hover:text-purple-600 hover:underline transition-colors duration-200"
                            >
                                {t("auth.register.sign_in_here")}
                            </Link>
                        </motion.p>
                    </div>
                </motion.div>
            </section>
        </>
    );
}
