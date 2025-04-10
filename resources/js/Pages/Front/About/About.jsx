import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import undrawImage from "../../../../assets/people.svg";

export default function About() {
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
                    About us
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
                        Our Programs are
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Program 1 */}
                        <motion.div
                            ref={programsRef}
                            initial={{ opacity: 0, y: 30 }}
                            animate={programsInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="p-6 bg-green-400 text-white rounded-lg shadow-lg"
                        >
                            <h4 className="text-xl font-bold mb-4">
                                Creative Arts
                            </h4>
                            <p>
                                Unlock your child’s creativity with hands-on art
                                and craft activities designed to inspire
                                imagination.
                            </p>
                        </motion.div>

                        {/* Program 2 */}
                        <motion.div
                            ref={programsRef}
                            initial={{ opacity: 0, y: 30 }}
                            animate={programsInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="p-6 bg-blue-500 text-white rounded-lg shadow-lg"
                        >
                            <h4 className="text-xl font-bold mb-4">
                                Math Explorers
                            </h4>
                            <p>
                                Develop problem-solving skills through
                                interactive math games and puzzles that make
                                learning fun.
                            </p>
                        </motion.div>

                        {/* Program 3 */}
                        <motion.div
                            ref={programsRef}
                            initial={{ opacity: 0, y: 30 }}
                            animate={programsInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="p-6 bg-green-400 text-white rounded-lg shadow-lg"
                        >
                            <h4 className="text-xl font-bold mb-4">
                                Junior Scientists
                            </h4>
                            <p>
                                Inspire curiosity with exciting science
                                experiments that encourage exploration and
                                discovery.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
