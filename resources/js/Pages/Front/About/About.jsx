import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { 
    Heart, 
    Users, 
    Award, 
    BookOpen, 
    Star, 
    Zap,
    Target,
    Globe,
    Sparkles,
    Shield,
    TrendingUp,
    ChevronDown,
    ChevronRight,
    PlayCircle
} from "lucide-react";
import { useState } from "react";

export default function About({ auth }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('mission');
    const [activeFAQ, setActiveFAQ] = useState(null);
    
    const [missionRef, missionInView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <>
            <Head title={t('about')} />
            <GuestFrontLayout auth={auth}>
            <div className="bg-white text-gray-800 overflow-hidden">
                {/* Modern Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto text-center">
                        {/* Badge */}
                        <motion.div
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200 mb-8"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Heart className="text-purple-600 mr-2" size={20} />
                            <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Empowering Young Minds Since 2020
                            </span>
                        </motion.div>

                        {/* Main Headlines */}
                        <motion.h1
                            className="text-6xl md:text-8xl font-black mb-8 leading-tight"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Where Dreams
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                Meet Discovery
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            We're not just an education platform – we're architects of curiosity, 
                            builders of confidence, and champions of every child's unlimited potential.
                            <span className="font-semibold text-purple-600"> Your child's future starts here.</span>
                        </motion.p>

                        {/* Modern Stats Grid */}
                        <motion.div
                            className="grid md:grid-cols-4 gap-8 mb-16"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        >
                            {[
                                { icon: Users, number: "2000+", label: "Happy Families", color: "text-blue-600" },
                                { icon: Award, number: "98%", label: "Success Rate", color: "text-emerald-600" },
                                { icon: Globe, number: "15+", label: "Countries", color: "text-purple-600" },
                                { icon: BookOpen, number: "500K+", label: "Lessons Completed", color: "text-pink-600" }
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <stat.icon className={`${stat.color} mx-auto mb-3`} size={32} />
                                    <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.number}</div>
                                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        >
                            <motion.button
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 inline-flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Start Your Journey</span>
                                <ChevronRight size={20} />
                            </motion.button>
                            <motion.button
                                className="border-2 border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 inline-flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <PlayCircle size={20} />
                                <span>Watch Our Story</span>
                            </motion.button>
                        </motion.div>
                    </div>
                </section>

                {/* Modern Mission & Values Section */}
                <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <motion.div
                            className="text-center mb-20"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
                                Our DNA
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Built on values that transform learning into an adventure of discovery, 
                                creativity, and boundless growth.
                            </p>
                        </motion.div>

                        {/* Interactive Tabs */}
                        <motion.div
                            className="flex flex-wrap justify-center gap-4 mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            {[
                                { id: 'mission', label: 'Our Mission', icon: Target },
                                { id: 'vision', label: 'Our Vision', icon: Star },
                                { id: 'values', label: 'Our Values', icon: Heart }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                                : 'bg-white text-gray-600 hover:text-purple-600 shadow-md hover:shadow-lg border border-gray-200'
                                        }`}
                                        onClick={() => setActiveTab(tab.id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Icon size={20} />
                                        <span>{tab.label}</span>
                                    </motion.button>
                                );
                            })}
                        </motion.div>

                        {/* Tab Content */}
                        <motion.div
                            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            {activeTab === 'mission' && (
                                <motion.div
                                    className="text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Target className="text-purple-600 mx-auto mb-6" size={64} />
                                    <h3 className="text-4xl font-bold text-gray-800 mb-6">Igniting Lifelong Learning</h3>
                                    <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
                                        We believe every child is a natural genius waiting to be discovered. Our mission is to create 
                                        an environment where curiosity thrives, confidence builds, and learning becomes the greatest 
                                        adventure of all. Through innovative programs that blend ancient wisdom with modern technology, 
                                        we unlock each child's unique potential and prepare them for a future without limits.
                                    </p>
                                </motion.div>
                            )}

                            {activeTab === 'vision' && (
                                <motion.div
                                    className="text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Star className="text-blue-600 mx-auto mb-6" size={64} />
                                    <h3 className="text-4xl font-bold text-gray-800 mb-6">A World of Brilliant Minds</h3>
                                    <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
                                        We envision a world where every child has access to transformative education that celebrates 
                                        their individuality while building essential skills for tomorrow. A world where learning is 
                                        joyful, meaningful, and deeply connected to real-life success. We're building the foundation 
                                        for the next generation of innovators, creators, and leaders who will shape our future.
                                    </p>
                                </motion.div>
                            )}

                            {activeTab === 'values' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Heart className="text-pink-600 mx-auto mb-6" size={64} />
                                    <h3 className="text-4xl font-bold text-gray-800 mb-8 text-center">What Drives Us Forward</h3>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {[
                                            { icon: Sparkles, title: "Innovation", desc: "Pioneering educational methods that inspire wonder" },
                                            { icon: Shield, title: "Safety First", desc: "Creating secure, nurturing environments for growth" },
                                            { icon: Users, title: "Inclusivity", desc: "Celebrating every child's unique journey and style" },
                                            { icon: TrendingUp, title: "Excellence", desc: "Delivering world-class education with proven results" },
                                            { icon: Heart, title: "Compassion", desc: "Leading with empathy, understanding, and kindness" },
                                            { icon: Zap, title: "Empowerment", desc: "Building confidence that lasts a lifetime" }
                                        ].map((value, index) => (
                                            <motion.div
                                                key={index}
                                                className="text-center p-6 rounded-2xl hover:bg-gradient-to-br from-purple-50 to-blue-50 transition-all duration-300"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <value.icon className="text-purple-600 mx-auto mb-4" size={40} />
                                                <h4 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h4>
                                                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* Modern Impact Section */}
                <section className="py-24 px-6 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
                        <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
                        <div className="absolute bottom-20 left-32 w-40 h-40 bg-white rounded-full"></div>
                        <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-5xl md:text-6xl font-extrabold mb-8">
                                Creating Real Impact
                            </h2>
                            <p className="text-xl mb-16 max-w-3xl mx-auto leading-relaxed opacity-90">
                                Every day, we witness the transformation of young minds into confident, creative, 
                                and capable individuals ready to change the world.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                {
                                    icon: TrendingUp,
                                    title: "Academic Excellence",
                                    description: "95% of our students show significant improvement in math performance within the first 3 months",
                                    metric: "3x faster learning"
                                },
                                {
                                    icon: Sparkles,
                                    title: "Creative Confidence",
                                    description: "Children develop problem-solving skills and creative thinking that extends far beyond academics",
                                    metric: "100+ projects created"
                                },
                                {
                                    icon: Globe,
                                    title: "Global Community",
                                    description: "Connecting families worldwide in a shared mission to nurture the next generation of leaders",
                                    metric: "15+ countries served"
                                }
                            ].map((impact, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2, duration: 0.8 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <impact.icon className="mx-auto mb-6 text-yellow-300" size={48} />
                                    <h3 className="text-2xl font-bold mb-4">{impact.title}</h3>
                                    <p className="opacity-90 leading-relaxed mb-6">{impact.description}</p>
                                    <div className="text-3xl font-bold text-yellow-300">{impact.metric}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Modern Interactive FAQ Section */}
                <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
                                Questions? We've Got Answers
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                Everything you need to know about our programs, approach, and community.
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {[
                                {
                                    question: "What makes Abacoding different from other educational programs?",
                                    answer: "Our unique blend of ancient abacus wisdom with modern coding creativity creates an unparalleled learning experience. We don't just teach math and programming – we build cognitive skills, confidence, and creativity that serve children for life. Our personalized approach ensures every child learns at their own pace while having fun."
                                },
                                {
                                    question: "What age groups do you serve, and how do you adapt to different learning styles?",
                                    answer: "We welcome children ages 5-14 across all our programs. Our expert instructors are trained to recognize different learning styles – visual, auditory, kinesthetic, and logical learners all thrive in our environment. We use gamification, storytelling, hands-on activities, and interactive technology to ensure every child finds their perfect learning path."
                                },
                                {
                                    question: "Do I need any prior experience or special equipment to get started?",
                                    answer: "Absolutely not! Our programs are designed for complete beginners. We provide all necessary materials and guide families through every step. For our coding programs, a basic computer with internet access is all you need. Our abacus programs include physical abacus tools as part of the enrollment."
                                },
                                {
                                    question: "How do you track progress and communicate with parents?",
                                    answer: "We believe parents are crucial partners in their child's learning journey. You'll receive regular progress reports, have access to our parent dashboard, and get personalized insights about your child's development. We also offer monthly parent workshops and one-on-one consultations to ensure you're equipped to support your child's growth at home."
                                },
                                {
                                    question: "What kind of results can we expect, and how quickly?",
                                    answer: "Most families notice improvements in confidence and enthusiasm within the first few weeks. Academic improvements typically become apparent within 2-3 months. However, every child is unique – some show dramatic changes quickly, while others develop more gradually. What's consistent is that children develop a genuine love for learning that lasts a lifetime."
                                },
                                {
                                    question: "How flexible are your programs for busy family schedules?",
                                    answer: "We understand modern families are busy! That's why we offer flexible scheduling options, including weekend and evening sessions. Our online components can be accessed anytime, and we provide makeup sessions for missed classes. We work with you to create a learning schedule that fits your family's lifestyle."
                                }
                            ].map((faq, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                >
                                    <motion.button
                                        className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-purple-50 transition-all duration-300 group"
                                        onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <span className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 pr-4">
                                            {faq.question}
                                        </span>
                                        <motion.div
                                            animate={{ rotate: activeFAQ === index ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-purple-600 flex-shrink-0"
                                        >
                                            <ChevronDown size={24} />
                                        </motion.div>
                                    </motion.button>
                                    
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ 
                                            height: activeFAQ === index ? 'auto' : 0,
                                            opacity: activeFAQ === index ? 1 : 0
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6">
                                            <p className="text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            className="text-center mt-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <p className="text-lg text-gray-600 mb-6">
                                Still have questions? We're here to help!
                            </p>
                            <motion.button
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Contact Our Team</span>
                                <ChevronRight size={20} />
                            </motion.button>
                        </motion.div>
                    </div>
                </section>

                {/* Modern Call to Action */}
                <section className="relative py-24 px-6 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-400/20 to-purple-400/20 animate-pulse"></div>
                        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce"></div>
                        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-5xl md:text-6xl font-extrabold mb-8">
                                Ready to Begin This Amazing Journey?
                            </h2>
                            <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed opacity-90">
                                Join thousands of families who've discovered the joy of learning with us. 
                                Your child's extraordinary future starts with a single step.
                            </p>
                        </motion.div>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <motion.button
                                className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-full text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 inline-flex items-center space-x-2"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Sparkles size={20} />
                                <span>Explore Our Programs</span>
                            </motion.button>
                            <motion.button
                                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 inline-flex items-center space-x-2"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <PlayCircle size={20} />
                                <span>Book a Free Demo</span>
                            </motion.button>
                        </motion.div>

                        <motion.div
                            className="mt-16 grid md:grid-cols-3 gap-8 text-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-3xl font-bold mb-2">100%</div>
                                <div className="text-sm opacity-90">Risk-free trial</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-3xl font-bold mb-2">24/7</div>
                                <div className="text-sm opacity-90">Parent support</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-3xl font-bold mb-2">98%</div>
                                <div className="text-sm opacity-90">Satisfaction rate</div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
            </GuestFrontLayout>
            
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes blob {
                        0% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(30px, -50px) scale(1.1); }
                        66% { transform: translate(-20px, 20px) scale(0.9); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    
                    .animate-blob {
                        animation: blob 7s infinite;
                    }
                    
                    .animation-delay-2000 {
                        animation-delay: 2s;
                    }
                    
                    .animation-delay-4000 {
                        animation-delay: 4s;
                    }
                `
            }} />
        </>
    );
}
