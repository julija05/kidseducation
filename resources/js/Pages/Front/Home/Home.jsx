import React, { useEffect, useState, useRef } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { 
    PlayCircle, 
    Star, 
    Users, 
    Award, 
    BookOpen, 
    Code, 
    Calculator,
    Sparkles,
    ChevronRight,
    Check,
    TrendingUp,
    Heart,
    Zap
} from "lucide-react";
import kid from "../../../../assets/Abacoding.png";
import learningMap from "../../../../assets/learning_map.png";
import learningMapCoding from "../../../../assets/lerning-map-coding.png";
import { useTranslation } from "@/hooks/useTranslation";

import GuestFrontLayout from "@/Layouts/GuessFrontLayout";

// Custom hook for counting animation
const useCounter = (target, isInView) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        
        const timer = setInterval(() => {
            setCount(prev => {
                if (prev < target) {
                    const increment = Math.ceil((target - prev) / 20);
                    return Math.min(prev + increment, target);
                }
                return target;
            });
        }, 50);

        return () => clearInterval(timer);
    }, [target, isInView]);

    return count;
};

const Home = ({ auth }) => {
    const { programs = [], pageTitle, content } = usePage().props;
    const { t } = useTranslation();
    
    // Refs for scroll animations
    const heroRef = useRef(null);
    const statsRef = useRef(null);
    const featuresRef = useRef(null);
    
    // Scroll progress for parallax effects
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    
    // In-view detection
    const isStatsInView = useInView(statsRef, { once: true, threshold: 0.1 });
    const isFeaturesInView = useInView(featuresRef, { once: true });
    
    // Animated counters
    const studentsCount = useCounter(150, isStatsInView);
    const programsCount = useCounter(2, isStatsInView);
    const successRate = useCounter(98, isStatsInView);
    
    // Modern animated text arrays
    const [currentSlogan, setCurrentSlogan] = useState(0);
    const modernSlogans = [
        t('home.slogan_shine'),
        t('home.slogan_future'), 
        t('home.slogan_smart'),
        t('home.slogan_magical')
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlogan(prev => (prev + 1) % modernSlogans.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title={t('home')} />
            <GuestFrontLayout auth={auth}>
                <div className="relative overflow-hidden">
                {/* Modern Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative z-10 max-w-7xl mx-auto text-center">
                    
                    {/* Floating Background Elements */}
                    <div className="absolute inset-0 overflow-hidden -z-10">
                        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                    </div>

                    {/* Floating Kid Photos */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Happy Kids Group - Top Left */}
                        <motion.div
                            className="absolute top-20 left-8 hidden lg:block"
                            initial={{ opacity: 0, x: -50, y: -50 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ delay: 1.2, duration: 1, type: "spring" }}
                        >
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl transform hover:scale-110 transition-transform duration-300">
                                    <img 
                                        src="/images/kids/happy-kids-group.jpg" 
                                        alt="Happy children learning together"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Star size={12} className="text-yellow-600 fill-current" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Kids Learning - Top Right */}
                        <motion.div
                            className="absolute top-32 right-12 hidden lg:block"
                            initial={{ opacity: 0, x: 50, y: -50 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ delay: 1.4, duration: 1, type: "spring" }}
                        >
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl transform hover:scale-110 transition-transform duration-300">
                                    <img 
                                        src="/images/kids/kids-learning.jpg" 
                                        alt="Children in classroom learning"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                                    <Check size={10} className="text-green-600" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Kids Studying - Bottom Left */}
                        <motion.div
                            className="absolute bottom-32 left-2 hidden lg:block"
                            initial={{ opacity: 0, x: -50, y: 50 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ delay: 1.6, duration: 1, type: "spring" }}
                        >
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl transform hover:scale-110 transition-transform duration-300">
                                    <img 
                                        src="/images/kids/kids-studying.jpg" 
                                        alt="Girls studying together"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -top-1 -left-1 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center">
                                    <Heart size={12} className="text-pink-600 fill-current" />
                                </div>
                            </div>
                        </motion.div>


                        <motion.div
                            className="absolute bottom-40 right-20 hidden lg:block"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 2.2, duration: 0.6 }}
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                                <Sparkles size={16} className="text-white" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <motion.div
                        className="text-center max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Dynamic Badge */}
                        <motion.div
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200 mb-8 max-w-md mx-auto"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <Sparkles className="text-purple-600 mr-2 flex-shrink-0" size={20} />
                            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center leading-tight">
                                {t('home.trusted_by_families', { count: 50 })}
                            </span>
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1 
                            className="text-6xl md:text-8xl font-black mb-6 leading-tight"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                {t('home.unlock_potential')}
                            </span>
                            <br />
                            <motion.span 
                                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
                                key={currentSlogan}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                {t('home.child_potential')}
                            </motion.span>
                        </motion.h1>

                        {/* Dynamic Slogan */}
                        <motion.div
                            className="h-16 flex items-center justify-center mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <motion.p
                                key={currentSlogan}
                                className="text-2xl md:text-3xl font-bold text-gray-700"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                {modernSlogans[currentSlogan]}
                            </motion.p>
                        </motion.div>

                        {/* Subtitle */}
                        <motion.p
                            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        >
                            {t('home.transform_future_text')} 
                            <span className="font-semibold text-purple-600"> {t('home.math_coding')}</span> {t('home.programs_text')} 
                            {t('home.learning_meets_fun')} <span className="font-semibold text-pink-600">{t('home.fun')}</span> {t('home.and_text')} 
                            <span className="font-semibold text-blue-600"> {t('home.creativity')}</span> {t('home.knows_no_bounds')}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        >
                            <Link
                                href={route("programs.index")}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                            >
                                <span>{t('home.start_learning_now')}</span>
                                <ChevronRight size={20} />
                            </Link>
                            <Link
                                href="#programs"
                                className="border-2 border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                            >
                                <PlayCircle size={20} />
                                <span>{t('home.watch_demo')}</span>
                            </Link>
                        </motion.div>

                        {/* Modern Animated Stats */}
                        <motion.div 
                            ref={statsRef}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 w-full"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        >
                            <motion.div 
                                className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl px-6 py-6 text-center group hover:scale-105 transition-all duration-300"
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-center justify-center mb-2">
                                    <Users className="text-pink-600 mr-2" size={24} />
                                    <h3 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                        {studentsCount}+
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-700 font-semibold">
                                    {t('home.happy_learners')}
                                </p>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl px-6 py-6 text-center group hover:scale-105 transition-all duration-300"
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-center justify-center mb-2">
                                    <BookOpen className="text-blue-600 mr-2" size={24} />
                                    <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                        {programsCount}+
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-700 font-semibold">
                                    {t('home.active_users')}
                                </p>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl px-6 py-6 text-center group hover:scale-105 transition-all duration-300"
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-center justify-center mb-2">
                                    <Heart className="text-emerald-600 mr-2" size={24} />
                                    <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                        {successRate}%
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-700 font-semibold">
                                    {t('home.parent_satisfaction')}
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Modern Visual Separator */}
                <div className="h-32 bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce animation-delay-200"></div>
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce animation-delay-400"></div>
                    </div>
                </div>

                {/* Modern Programs Showcase */}
                <section id="programs" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            className="text-center mb-20"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
                                {t('home.transform_learning')}
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                {t('home.revolutionary_programs')}
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            {/* Math Mastery Program */}
                            <motion.div
                                className="group"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 mr-4">
                                            <Calculator className="text-white" size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold text-gray-800">{t('home.math_mastery')}</h3>
                                            <p className="text-gray-600">{t('home.abacus_subtitle')}</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                                        {t('home.math_description')}
                                    </p>

                                    <div className="space-y-3 mb-8">
                                        {[
                                            { icon: Zap, text: t('home.lightning_calculations') },
                                            { icon: TrendingUp, text: t('home.improved_performance') },
                                            { icon: Award, text: t('home.enhanced_memory') },
                                            { icon: Sparkles, text: t('home.visual_learning') }
                                        ].map((benefit, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex items-center space-x-3"
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                            >
                                                <benefit.icon className="text-blue-500" size={20} />
                                                <span className="text-gray-700">{benefit.text}</span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-blue-100 text-sm">{t('home.perfect_for_ages')}</p>
                                                <p className="text-2xl font-bold">{t('home.math_age_range')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-blue-100 text-sm">{t('home.duration')}</p>
                                                <p className="text-2xl font-bold">{t('home.math_levels')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Coding Adventures Program */}
                            <motion.div
                                className="group"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-3xl p-8 border border-pink-100 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl p-4 mr-4">
                                            <Code className="text-white" size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold text-gray-800">{t('home.coding_adventures')}</h3>
                                            <p className="text-gray-600">{t('home.scratch_subtitle')}</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                                        {t('home.coding_description')}
                                    </p>

                                    <div className="space-y-3 mb-8">
                                        {[
                                            { icon: Sparkles, text: t('home.creative_game_creation') },
                                            { icon: Zap, text: t('home.logical_thinking') },
                                            { icon: Award, text: t('home.problem_solving') },
                                            { icon: TrendingUp, text: t('home.future_tech_skills') }
                                        ].map((benefit, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex items-center space-x-3"
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                            >
                                                <benefit.icon className="text-pink-500" size={20} />
                                                <span className="text-gray-700">{benefit.text}</span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl p-6 text-white">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-pink-100 text-sm">{t('home.perfect_for_ages')}</p>
                                                <p className="text-2xl font-bold">{t('home.coding_age_range')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-pink-100 text-sm">{t('home.projects')}</p>
                                                <p className="text-2xl font-bold">{t('home.coding_games')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Results Preview */}
                        <motion.div
                            className="mt-20 text-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl p-12 border border-emerald-100">
                                <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-6">
                                    {t('home.amazing_results')}
                                </h3>
                                <div className="grid md:grid-cols-3 gap-8 text-center">
                                    <div>
                                        <div className="text-5xl font-bold text-emerald-600 mb-2">3x</div>
                                        <p className="text-gray-700">{t('home.faster_calculation')}</p>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-bold text-blue-600 mb-2">95%</div>
                                        <p className="text-gray-700">{t('home.improvement_confidence')}</p>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-bold text-purple-600 mb-2">100+</div>
                                        <p className="text-gray-700">{t('home.creative_projects')}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-24 px-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                                {t('home.what_parents_say')}
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                {t('home.testimonials_description')}
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    name: "Sarah Johnson",
                                    role: "Tech Executive & Mom",
                                    content: "My daughter Emma went from struggling with basic math to solving complex problems in her head. The transformation has been absolutely incredible - she's more confident in school and actually enjoys math now!",
                                    rating: 5,
                                    gradient: "from-pink-500 to-rose-500",
                                    achievement: "Improved math grades by 2 full levels"
                                },
                                {
                                    name: "Michael Chen", 
                                    role: "Software Engineer & Dad",
                                    content: "As a programmer myself, I was amazed by how quickly my 7-year-old picked up logical thinking through Scratch. He's already building interactive stories and games - his creativity has no limits!",
                                    rating: 5,
                                    gradient: "from-blue-500 to-cyan-500",
                                    achievement: "Built 15+ games and animations"
                                },
                                {
                                    name: "Dr. Amanda Rodriguez",
                                    role: "Pediatrician & Mother of 3",
                                    content: "All three of my kids are enrolled and thriving! The structured approach builds both academic skills and self-confidence. It's the best investment we've made in their education.",
                                    rating: 5,
                                    gradient: "from-purple-500 to-violet-500",
                                    achievement: "3 children, all honor roll students"
                                }
                            ].map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2, duration: 0.8 }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                >
                                    <div className="flex items-center mb-4">
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center text-white font-bold text-xl`}>
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                                            <p className="text-sm text-gray-600">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="text-yellow-400 fill-current" size={20} />
                                        ))}
                                    </div>
                                    
                                    <p className="text-gray-700 leading-relaxed italic mb-4">
                                        "{testimonial.content}"
                                    </p>
                                    
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 border border-green-200">
                                        <div className="flex items-center space-x-2">
                                            <Award className="text-green-600" size={16} />
                                            <span className="text-sm font-semibold text-green-700">{testimonial.achievement}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300 rounded-full blur-xl opacity-40 animate-bounce"></div>
                    <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-300 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                </section>

                {/* Features Highlights */}
                <section className="py-24 px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-6">
                                {t('home.why_choose_abacoding')}
                            </h2>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: Zap, title: t('home.fast_learning'), desc: t('home.fast_learning_desc'), color: "text-yellow-500" },
                                { icon: Award, title: t('home.expert_teachers'), desc: t('home.expert_teachers_desc'), color: "text-blue-500" },
                                { icon: TrendingUp, title: t('home.proven_results'), desc: t('home.proven_results_desc'), color: "text-emerald-500" },
                                { icon: Sparkles, title: t('home.fun_engaging'), desc: t('home.fun_engaging_desc'), color: "text-purple-500" }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="text-center group"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full group-hover:shadow-xl transition-all duration-300">
                                        <feature.icon className={`${feature.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`} size={48} />
                                        <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-center px-6 py-24 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
                        <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
                        <div className="absolute bottom-20 left-32 w-24 h-24 bg-white rounded-full"></div>
                        <div className="absolute bottom-32 right-10 w-12 h-12 bg-white rounded-full"></div>
                    </div>
                    
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <motion.h2
                            className="text-5xl md:text-6xl font-bold text-white mb-8"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                        >
                            {t('home.ready_get_started')}
                        </motion.h2>
                        <motion.p
                            className="text-xl text-white/90 mb-12 leading-relaxed"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 1 }}
                        >
                            {t('home.join_happy_parents')}
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <Link 
                                href={route("programs.index")}
                                className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl inline-flex items-center space-x-2"
                            >
                                <span>{t('home.enroll_now')}</span>
                                <ChevronRight size={20} />
                            </Link>
                            <Link 
                                href={route("about.index")}
                                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 hover:scale-105"
                            >
                                {t('home.learn_more')}
                            </Link>
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

                    .animation-delay-200 {
                        animation-delay: 0.2s;
                    }
                    
                    .animation-delay-400 {
                        animation-delay: 0.4s;
                    }
                `
            }} />
        </>
    );
};

export default Home;
