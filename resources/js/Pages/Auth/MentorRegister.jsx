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
    GraduationCap,
    BookOpen,
    Award,
    Sparkles,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function MentorRegister({ auth, programs }) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        bio: "",
        expertise: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("mentor.register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title={t("auth.mentor_register.title")} />
            <NavBar auth={auth} />

            <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden px-4 py-12">
                {/* Decorative elements */}
                <div className="absolute top-0 -left-10 w-96 h-96 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full blur-3xl opacity-60 animate-pulse" />
                <div
                    className="absolute bottom-0 -right-10 w-80 h-80 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-full blur-3xl opacity-60 animate-bounce"
                    style={{ animationDuration: "6s" }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-white/70 backdrop-blur-lg z-10 max-w-5xl w-full rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid md:grid-cols-2"
                >
                    {/* Illustration Side */}
                    <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100/80 via-teal-100/80 to-cyan-100/80 p-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 backdrop-blur-sm"></div>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                            className="relative z-10 text-center"
                        >
                            <GraduationCap className="w-32 h-32 mx-auto text-emerald-600 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                {t("auth.mentor_register.become_mentor")}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {t("auth.mentor_register.mentor_description")}
                            </p>

                            <div className="space-y-3 text-left">
                                <div className="flex items-start gap-3">
                                    <BookOpen className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">
                                        {t("auth.mentor_register.benefit_1")}
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Award className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">
                                        {t("auth.mentor_register.benefit_2")}
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">
                                        {t("auth.mentor_register.benefit_3")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Registration Form */}
                    <div className="p-10 relative overflow-y-auto max-h-screen">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                                {t("auth.mentor_register.title")}
                            </h2>
                            <p className="text-md text-gray-600 mb-2">
                                {t("auth.mentor_register.subtitle")}
                            </p>
                            <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mx-auto"></div>
                        </motion.div>

                        <motion.form
                            onSubmit={submit}
                            className="space-y-5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            {/* First and Last Name Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="first_name"
                                        value={t("form.first_name")}
                                    />
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                        <TextInput
                                            id="first_name"
                                            name="first_name"
                                            value={data.first_name}
                                            className="pl-10 block w-full"
                                            autoComplete="given-name"
                                            isFocused={true}
                                            onChange={(e) =>
                                                setData("first_name", e.target.value)
                                            }
                                            placeholder={t("form.enter_first_name")}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.first_name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="last_name"
                                        value={t("form.last_name")}
                                    />
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                        <TextInput
                                            id="last_name"
                                            name="last_name"
                                            value={data.last_name}
                                            className="pl-10 block w-full"
                                            autoComplete="family-name"
                                            onChange={(e) =>
                                                setData("last_name", e.target.value)
                                            }
                                            placeholder={t("form.enter_last_name")}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.last_name} className="mt-2" />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <InputLabel
                                    htmlFor="email"
                                    value={t("form.email")}
                                />
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 block w-full"
                                        autoComplete="username"
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder={t("form.enter_email")}
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value={t("form.password")}
                                    />
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                        <TextInput
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={data.password}
                                            className="pl-10 pr-10 block w-full"
                                            autoComplete="new-password"
                                            onChange={(e) =>
                                                setData("password", e.target.value)
                                            }
                                            placeholder={t("form.enter_password")}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 z-10"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value={t("form.confirm_password")}
                                    />
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                                        <TextInput
                                            id="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="pl-10 pr-10 block w-full"
                                            autoComplete="new-password"
                                            onChange={(e) =>
                                                setData("password_confirmation", e.target.value)
                                            }
                                            placeholder={t("form.enter_password")}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 z-10"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Strength Indicator */}
                            <PasswordStrengthIndicator password={data.password} />

                            {/* Submit Button */}
                            <div className="flex items-center justify-between pt-4">
                                <PrimaryButton
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300"
                                    disabled={processing}
                                >
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    {processing
                                        ? t("form.creating")
                                        : t("auth.mentor_register.create_account")}
                                </PrimaryButton>
                            </div>

                            {/* Already have account */}
                            <div className="text-center pt-4">
                                <p className="text-sm text-gray-600">
                                    {t("auth.mentor_register.already_have_account")}{" "}
                                    <Link
                                        href={route("login")}
                                        className="text-emerald-600 hover:text-emerald-700 font-semibold"
                                    >
                                        {t("auth.register.sign_in_here")}
                                    </Link>
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    {t("auth.mentor_register.student_instead")}{" "}
                                    <Link
                                        href={route("register")}
                                        className="text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        {t("auth.mentor_register.register_as_student")}
                                    </Link>
                                </p>
                            </div>
                        </motion.form>
                    </div>
                </motion.div>
            </section>
        </>
    );
}
