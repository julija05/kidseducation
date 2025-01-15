import React from "react";
import { motion } from "framer-motion";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import loginIllustration from "../../../assets/backgroundimage.png";
import NavBar from "@/Components/NavBar";

export default function Login({ status, canResetPassword, auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), { onFinish: () => reset("password") });
    };

    return (
        <>
            <Head title="Log in" />
            <NavBar auth={auth} />
            <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full"
                >
                    {/* Illustration Section */}
                    <div className="hidden md:block md:w-1/2 bg-blue-500 p-8">
                        <img
                            src={loginIllustration}
                            alt="Login Illustration"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Form Section */}
                    <div className="w-full md:w-1/2 p-8">
                        <h2 className="text-3xl font-bold mb-6 text-green-400 text-center">
                            Welcome Back!
                        </h2>

                        {/* Status Message */}
                        {status && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="mb-4 text-sm font-medium text-green-600 text-center"
                            >
                                {status}
                            </motion.div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none text-gray-900"
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>
                            <div className="relative">
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                />
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none text-gray-900 h-12 pr-14"
                                    autoComplete="current-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                                <div className="absolute inset-y-0 right-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            <div className="block">
                                <label className="flex items-center">
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
                                    <span className="ml-2 text-sm text-gray-600">
                                        Remember me
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end">
                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Forgot your password?
                                    </Link>
                                )}

                                <PrimaryButton
                                    className="ml-4"
                                    disabled={processing}
                                >
                                    Log in
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </section>
        </>
    );
}
