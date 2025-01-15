import { Head, Link } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";
import { Footer } from "@/Components/Footer";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";
import { motion } from "framer-motion";
import Home from "../Home/Home";
import About from "../About/About";
import Contact from "../Contact/Contact";
import SignupKid from "../SignupKid/SignupKid";

export default function Index({ auth }) {
    const handleImageError = () => {
        document
            .getElementById("screenshot-container")
            ?.classList.add("!hidden");
        document.getElementById("docs-card")?.classList.add("!row-span-1");
        document
            .getElementById("docs-card-content")
            ?.classList.add("!flex-row");
        document.getElementById("background")?.classList.add("!hidden");
    };

    return (
        <>
            <div>
                <NavBar auth={auth} />
                <Home />

                <About />
                <Contact />
                <SignupKid />
                <Footer />
            </div>
        </>
    );
}
