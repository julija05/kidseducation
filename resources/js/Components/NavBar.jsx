import React from "react";
import { Link } from "@inertiajs/react";

const NavBar = ({ auth }) => {
    return (
        <header className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Abacoding</h1>
                <nav className="flex flex-1 justify-end space-x-3">
                    <Link
                        href={route("landing.index")}
                        className="rounded-md px-3 py-2 text-white hover:text-gray-200 transition"
                    >
                        Home
                    </Link>
                    <Link
                        href={route("about.index")}
                        className="rounded-md px-3 py-2 text-white hover:text-gray-200 transition"
                    >
                        About
                    </Link>
                    <Link
                        href={route("contact.index")}
                        className="rounded-md px-3 py-2 text-white hover:text-gray-200 transition"
                    >
                        Contact
                    </Link>
                    <Link
                        href={route("signupkid.index")}
                        className="rounded-md px-3 py-2 text-white hover:text-gray-200 transition"
                    >
                        Sign up your kid
                    </Link>
                    {auth.user ? (
                        <Link
                            href={route("dashboard")}
                            className="rounded-md px-3 py-2 text-white hover:text-gray-200 transition"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route("login")}
                                className="rounded-md px-3 py-2 text-white hover:text-gray-200 transition"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route("register")}
                                className="rounded-md px-3 py-2 text-white hover:text-gray-200 transition"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default NavBar;
