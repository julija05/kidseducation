import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import undrawImage from "../../../../assets/people.png";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";
import ourMission from "../../../../assets/Mission.png";
import whyUs from "../../../../assets/kids-happy.png";

export default function About({ auth }) {
    const [missionRef, missionInView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <GuestFrontLayout auth={auth}>
            <div className="bg-white text-gray-800 overflow-hidden">
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col md:flex-row items-center justify-between px-6 py-24 relative z-10 max-w-7xl mx-auto gap-12">
                    {/* Text Content */}
                    <div className="md:w-1/2 text-center md:text-left">
                        <motion.h2
                            className="text-5xl md:text-6xl font-extrabold mb-20 z-10 relative"
                            initial={{ opacity: 0, y: -30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Who we are
                            </span>
                        </motion.h2>
                        <motion.p
                            className="text-xl text-gray-800 mt-4 leading-relaxed"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 1 }}
                        >
                            We’re passionate about helping kids develop
                            problem-solving and creative thinking skills from a
                            young age. Our programs are carefully designed to
                            make learning fun, engaging, and meaningful.
                        </motion.p>
                    </div>

                    {/* Decorative + Image */}
                    <div className="md:w-1/2 relative flex justify-center items-center">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-60 animate-spin-slow" />
                        <div className="absolute bottom-0 right-10 w-60 h-60 bg-green-300 rounded-full blur-2xl opacity-50 animate-pulse" />
                        <div className="absolute top-20 left-20 w-24 h-24 bg-purple-300 rotate-12 blur-xl opacity-60 animate-bounce" />

                        <img
                            src={undrawImage}
                            alt="Team Illustration"
                            className="relative z-10 w-full max-w-sm md:max-w-md"
                        />
                    </div>
                </section>

                {/* Mission Section */}
                <section className="relative bg-gray-100 py-32 px-6 overflow-hidden">
                    {/* Top Separator */}
                    <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 z-0">
                        <svg
                            viewBox="0 0 500 150"
                            preserveAspectRatio="none"
                            className="w-full h-20"
                        >
                            <path
                                d="M0.00,49.98 C150.00,150.00 349.53,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                                style={{ stroke: "none", fill: "#ffffff" }}
                            ></path>
                        </svg>
                    </div>

                    {/* Content Flex Container */}
                    <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-60 animate-spin-slow" />
                        <div className="absolute bottom-0 right-10 w-60 h-60 bg-green-300 rounded-full blur-2xl opacity-50 animate-pulse" />
                        <div className="absolute top-20 left-20 w-24 h-24 bg-purple-300 rotate-12 blur-xl opacity-60 animate-bounce" />
                        {/* Image Left */}
                        <motion.div
                            className="w-full md:w-1/2"
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <img
                                src={ourMission}
                                alt="Children learning happily"
                                className="rounded-2xl  w-full object-cover"
                            />
                        </motion.div>

                        {/* Text Right */}
                        <motion.div
                            ref={missionRef}
                            initial={{ opacity: 0, x: 40 }}
                            animate={missionInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 1 }}
                            className="w-full md:w-1/2 text-center md:text-left"
                        >
                            <h2 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow">
                                Our Mission
                            </h2>
                            <p className="text-lg text-gray-800 leading-relaxed">
                                We are dedicated to nurturing young minds
                                through interactive and engaging learning
                                experiences. Our mission is to foster
                                creativity, critical thinking, and a lifelong
                                love of learning in every child.
                            </p>
                        </motion.div>
                    </div>

                    {/* Bottom Separator */}
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
                        <svg
                            viewBox="0 0 500 150"
                            preserveAspectRatio="none"
                            className="w-full h-20"
                        >
                            <path
                                d="M0.00,49.98 C150.00,150.00 349.53,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                                style={{ stroke: "none", fill: "#ffffff" }}
                            ></path>
                        </svg>
                    </div>
                </section>

                {/* Why Us Section */}
                <section className="bg-white py-24 px-6">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        {/* Text Left */}
                        <motion.div
                            className="w-full md:w-1/2 text-center md:text-left"
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <h2 className="text-5xl font-extrabold mb-6 p-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow">
                                Why Choose Us?
                            </h2>
                            <div className="text-lg text-gray-800 leading-relaxed space-y-6">
                                <p>
                                    At our learning center, we don't just teach
                                    – we inspire. Whether your child is learning
                                    mental math with our proven{" "}
                                    <strong>Abacus method</strong> or exploring
                                    the world of{" "}
                                    <strong>coding through Scratch</strong>,
                                    they’ll gain skills that boost confidence
                                    and spark curiosity.
                                </p>
                                <p>
                                    Our experienced educators use fun, hands-on
                                    techniques to turn learning into an
                                    adventure. Every lesson is crafted to keep
                                    kids engaged, empowered, and excited to come
                                    back.
                                </p>
                                <p>
                                    With small group sizes, personalized
                                    attention, and a focus on developing
                                    real-world skills, we help kids thrive
                                    academically and personally.
                                </p>
                            </div>
                        </motion.div>

                        {/* Image Right */}
                        <motion.div
                            className="w-full md:w-1/2"
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-60 animate-spin-slow" />
                            <div className="absolute bottom-0 right-10 w-60 h-60 bg-green-300 rounded-full blur-2xl opacity-50 animate-pulse" />
                            <div className="absolute top-20 left-20 w-24 h-24 bg-purple-300 rotate-12 blur-xl opacity-60 animate-bounce" />
                            <img
                                src={whyUs}
                                alt="Happy children learning"
                                className="rounded-2xl  w-full object-cover"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="relative bg-gray-100 py-24 px-6 text-left overflow-hidden">
                    {/* Top Separator */}
                    <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 z-0">
                        <svg
                            viewBox="0 0 500 150"
                            preserveAspectRatio="none"
                            className="w-full h-20"
                        >
                            <path
                                d="M0.00,49.98 C150.00,150.00 349.53,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                                style={{ stroke: "none", fill: "#ffffff" }}
                            ></path>
                        </svg>
                    </div>

                    <motion.h2
                        className="text-5xl font-extrabold mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow relative z-10"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        Frequently Asked Questions
                    </motion.h2>

                    <div className="max-w-4xl mx-auto space-y-8">
                        <motion.div
                            className="bg-white p-6 rounded-xl shadow-md"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                        >
                            <h3 className="text-xl font-semibold mb-2">
                                What is Abacus learning?
                            </h3>
                            <p>
                                Abacus learning is a fun and effective way to
                                develop strong mental arithmetic skills.
                                Children use a physical or visual abacus to
                                perform complex calculations using only their
                                minds—boosting focus, memory, and brain
                                development.
                            </p>
                        </motion.div>

                        <motion.div
                            className="bg-white p-6 rounded-xl shadow-md"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <h3 className="text-xl font-semibold mb-2">
                                What age is best for starting the programs?
                            </h3>
                            <p>
                                Our Abacus and Scratch coding programs are
                                designed for kids aged 5 to 12. We adjust our
                                teaching approach to suit your child’s age and
                                learning pace.
                            </p>
                        </motion.div>

                        <motion.div
                            className="bg-white p-6 rounded-xl shadow-md"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <h3 className="text-xl font-semibold mb-2">
                                Do kids need any prior experience?
                            </h3>
                            <p>
                                Not at all! Both programs are beginner-friendly.
                                Whether your child is completely new to math or
                                has never written a line of code, they’ll start
                                at the perfect level for them.
                            </p>
                        </motion.div>

                        <motion.div
                            className="bg-white p-6 rounded-xl shadow-md"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <h3 className="text-xl font-semibold mb-2">
                                How can I enroll my child?
                            </h3>
                            <p>
                                It’s simple! Just head over to our{" "}
                                <a
                                    href="/programs"
                                    className="text-blue-600 underline hover:text-blue-800"
                                >
                                    Programs
                                </a>{" "}
                                page and fill out the enrollment form. We’ll
                                contact you shortly with the next steps.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="bg-yellow-100 text-center px-6 py-20">
                    <motion.h2
                        className="text-4xl font-bold mb-6"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        Want to Know More?
                    </motion.h2>
                    <motion.p
                        className="text-lg mb-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 1 }}
                    >
                        Discover how we help children thrive through joyful
                        learning.
                    </motion.p>
                    <motion.a
                        href="/programs"
                        className="bg-yellow-400 hover:bg-yellow-300 text-white font-semibold py-3 px-8 rounded-2xl text-lg transition inline-block"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Explore Programs
                    </motion.a>
                </section>
            </div>
        </GuestFrontLayout>
    );
}
