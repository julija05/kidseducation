import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import undrawImage from "../../../../assets/people.svg";
import { Link, usePage } from "@inertiajs/react";

export default function About() {
    const { programs, pageTitle, content } = usePage().props;
    console.log(programs, "programs");
    console.log(programs, "programsAbout");
    const [missionRef, missionInView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const [programsRef, programsInView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <section
            id="about"
            className="relative min-h-screen py-16 bg-white text-gray-800"
        >
            <div className="container mx-auto px-6 lg:px-12">
                {/* Section Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 2 }}
                    className="text-4xl font-bold text-center mb-12"
                >
                    About Us
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left Side: Mission */}
                    <motion.div
                        ref={missionRef}
                        initial={{ opacity: 0, x: -50 }}
                        animate={missionInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 2 }}
                        className="space-y-6"
                    >
                        <h3 className="text-2xl font-semibold text-green-400">
                            Our Mission
                        </h3>
                        <p className="text-lg leading-relaxed">
                            We are dedicated to nurturing young minds through
                            interactive and engaging learning experiences. Our
                            mission is to foster creativity, critical thinking,
                            and a lifelong love of learning in every child.
                        </p>
                    </motion.div>

                    {/* Right Side: Illustration */}
                    <motion.div
                        ref={missionRef}
                        initial={{ opacity: 0, x: 50 }}
                        animate={missionInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 2 }}
                    >
                        <img
                            src={undrawImage}
                            alt="Mission Illustration"
                            className="w-full h-auto rounded-lg shadow-lg"
                        />
                    </motion.div>
                </div>

                {/* Programs Section */}
                <div className="mt-16">
                    <h3 className="text-2xl font-semibold text-blue-500 text-center mb-8">
                        Our Programs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {programs.map((program) => (
                            <Link
                                key={program.id}
                                href={route("programs.show", program.id)}
                                className="block transition-transform duration-200 hover:scale-[1.02]"
                            >
                                <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg">
                                    <h3 className="text-xl font-semibold mb-2">
                                        {program.name}
                                    </h3>
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {program.description}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-600 font-bold">
                                            ${program.price}
                                        </span>
                                        <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                                            {program.duration}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
