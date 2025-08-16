import React from "react";
import { Link } from "@inertiajs/react";

const Footer = () => {
    return (
        <>
            <div>
                <footer className="bg-gray-800 text-white py-8">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="mb-4 md:mb-0">
                                <p className="text-lg font-semibold">Abacoding</p>
                                <p className="text-gray-400">Learning made fun and interactive</p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                                <div className="flex items-center gap-6">
                                    <Link 
                                        href={route('help.index')} 
                                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                                    >
                                        Help & Support
                                    </Link>
                                    <Link 
                                        href={route('legal.privacy')} 
                                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                                    >
                                        Privacy Policy
                                    </Link>
                                    <Link 
                                        href={route('legal.terms')} 
                                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                                    >
                                        Terms of Service
                                    </Link>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-gray-400 text-sm">&copy; 2025 Abacoding. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export { Footer };
