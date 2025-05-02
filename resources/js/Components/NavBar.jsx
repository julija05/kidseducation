import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import Logo from "../../assets/logo.png";
import { Menu, X } from "lucide-react";

const NavBar = React.memo(() => {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <header className="bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link
                    href={route("landing.index")}
                    className="font-extrabold text-purple-800 drop-shadow-lg flex items-center space-x-2"
                >
                    <span className="text-lg md:text-2xl"> Abacoding</span>
                </Link>

                {/* Show Menu icon only when nav is closed */}
                {!isOpen && (
                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-purple-800 focus:outline-none"
                    >
                        <Menu size={28} />
                    </button>
                )}

                {/* Navigation Links */}
                <div
                    className={`${
                        isOpen ? "block" : "hidden"
                    } md:flex md:items-center md:w-auto md:space-x-6 mt-4 md:mt-0 w-full`}
                >
                    <nav className="relative flex flex-col md:flex-row bg-white md:bg-transparent p-4 md:p-0 rounded-lg shadow-md md:shadow-none space-y-4 md:space-y-0 md:space-x-6 text-purple-800 font-medium text-lg">
                        {/* X Icon in top-right of mobile nav */}
                        <button
                            onClick={toggleMenu}
                            className="absolute top-2 right-2 md:hidden text-purple-800"
                        >
                            <X size={24} />
                        </button>

                        <Link
                            href={route("landing.index")}
                            className="hover:text-purple-600 transition"
                        >
                            Home
                        </Link>
                        <Link
                            href={route("programs.index")}
                            className="hover:text-purple-600 transition"
                        >
                            Programs
                        </Link>
                        <Link
                            href={route("about.index")}
                            className="hover:text-purple-600 transition"
                        >
                            About
                        </Link>
                        <Link
                            href={""}
                            className="hover:text-purple-600 transition"
                        >
                            News
                        </Link>
                        <Link
                            href={route("contact.index")}
                            className="hover:text-purple-600 transition"
                        >
                            Contact
                        </Link>
                        {/* <Link
                            href={route("signupkid.index")}
                            className="hover:text-purple-600 transition"
                        >
                            Sign up your kid
                        </Link> */}
                        {auth.user ? (
                            <Link
                                href={route("dashboard")}
                                className="hover:text-purple-600 transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route("login")}
                                    className="hover:text-purple-600 transition"
                                >
                                    Log in
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
});

export default NavBar;
