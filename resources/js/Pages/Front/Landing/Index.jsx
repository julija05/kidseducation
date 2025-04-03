import { Head, Link, usePage } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";
import { Footer } from "@/Components/Footer";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";
import { motion } from "framer-motion";
import Home from "../Home/Home";
import About from "../About/About";
import Contact from "../Contact/Contact";
import SignupKid from "../SignupKid/SignupKid";

export default function Index({ auth }) {
    return (
        <>
            {/* <GuestFrontLayout auth={auth}>
                <Home />
                <About />
                <Contact />
                <SignupKid />
                <Footer />
            </GuestFrontLayout> */}
        </>
    );
}
