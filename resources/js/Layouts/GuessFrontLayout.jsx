import React from "react";
import NavBar from "@/Components/NavBar";
import { Footer } from "@/Components/Footer";

export default function GuestFrontLayout({ children, auth }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <NavBar auth={auth} />

            {/* Main Content - hero section fills the remaining space */}
            <div className="flex-grow flex items-center justify-center relative">
                <main className="w-full">{children}</main>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
