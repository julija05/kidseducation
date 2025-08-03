import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import NavBar from "@/Components/NavBar";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import registerIllustration from "../../../assets/kid-no-bg.png";
import { useTranslation } from "@/hooks/useTranslation";

export default function Register({ auth }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Join Abacoding - Register" />
            <NavBar auth={auth} />

            <section className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-4 py-12">
                {/* Decorative blobs */}
                <div className="absolute top-0 -left-10 w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute bottom-0 -right-10 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-50 animate-spin-slow" />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white z-10 max-w-5xl w-full rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2"
                >
                    {/* Illustration Side */}
                    <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 p-8">
                        <img
                            src={registerIllustration}
                            alt="Join Abacoding"
                            className="w-80 h-auto"
                        />
                    </div>

                    {/* Registration Form */}
                    <div className="p-10">
                        <h2 className="text-4xl font-extrabold text-pink-600 text-center mb-4">
                            {t('auth.register.title')}
                        </h2>
                        <p className="text-md text-gray-600 text-center mb-6">
                            {t('auth.register.subtitle')}
                        </p>

                        <form onSubmit={submit} className="space-y-6">
                            {/* First and Last Name Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="first_name" value={t('forms.first_name')} />
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <TextInput
                                            id="first_name"
                                            name="first_name"
                                            value={data.first_name}
                                            className="pl-10 mt-1 block w-full"
                                            autoComplete="given-name"
                                            isFocused={true}
                                            onChange={(e) => setData("first_name", e.target.value)}
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.first_name} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="last_name" value={t('forms.last_name')} />
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <TextInput
                                            id="last_name"
                                            name="last_name"
                                            value={data.last_name}
                                            className="pl-10 mt-1 block w-full"
                                            autoComplete="family-name"
                                            onChange={(e) => setData("last_name", e.target.value)}
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.last_name} className="mt-2" />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <InputLabel htmlFor="email" value={t('auth.register.email_address')} />
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 mt-1 block w-full"
                                        autoComplete="username"
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder={t('auth.register.email_placeholder')}
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Password Field */}
                            <div>
                                <InputLabel htmlFor="password" value={t('auth.register.password')} />
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="pl-10 mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) => setData("password", e.target.value)}
                                        placeholder={t('auth.register.password_placeholder')}
                                        required
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value={t('auth.register.confirm_password')}
                                />
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="pl-10 mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData("password_confirmation", e.target.value)
                                        }
                                        placeholder={t('auth.register.confirm_password_placeholder')}
                                        required
                                    />
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            {/* Submit Button */}
                            <PrimaryButton
                                className="w-full justify-center bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-yellow-400 hover:to-pink-500 text-white text-lg rounded-xl py-3 flex items-center gap-2"
                                disabled={processing}
                            >
                                <UserPlus className="w-5 h-5" />
                                {processing ? t('auth.register.creating_account') : t('auth.register.create_account')}
                            </PrimaryButton>
                        </form>

                        {/* Footer */}
                        <p className="mt-6 text-center text-sm text-gray-600">
                            {t('auth.register.already_have_account')}{" "}
                            <Link
                                href={route("login")}
                                className="text-pink-500 font-semibold hover:underline"
                            >
                                {t('auth.register.sign_in_here')}
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </section>
        </>
    );
}
