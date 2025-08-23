import React, { useState, useEffect } from "react";
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
export default function About({ auth }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('mission');
    const [activeFAQ, setActiveFAQ] = useState(null);

    // Handle scrolling to section based on URL hash
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100); // Small delay to ensure page is fully loaded
            }
        }
    }, []);
    
    const [missionRef, missionInView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <>
            <Head title={t('about.page_title')} />
            <GuestFrontLayout auth={auth}>
            <div className="bg-white text-gray-800 overflow-hidden">
                {/* Modern Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24 overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto text-center">
                        {/* Badge */}
                        <motion.div
                            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200 mb-6 sm:mb-8 max-w-xs sm:max-w-md mx-auto"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Heart className="text-purple-600 mr-2 flex-shrink-0" size={16} />
                            <span className="text-xs sm:text-sm font-semibold text-purple-600 sm:bg-gradient-to-r sm:from-purple-600 sm:to-blue-600 sm:bg-clip-text sm:text-transparent text-center leading-tight">
                                {t('about.hero_badge')}
                            </span>
                        </motion.div>

                        {/* Main Headlines */}
                        <motion.h1
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-6 sm:mb-8 leading-tight px-4"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <span className="block text-gray-900 sm:bg-gradient-to-r sm:from-gray-900 sm:to-gray-700 sm:bg-clip-text sm:text-transparent">
                                {t('about.hero_title_1')}
                            </span>
                            <span className="block text-gray-900 sm:bg-gradient-to-r sm:from-purple-600 sm:via-pink-600 sm:to-blue-600 sm:bg-clip-text sm:text-transparent">
                                {t('about.hero_title_2')}
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            {t('about.hero_subtitle')}
                            <span className="font-semibold text-purple-600"> {t('about.hero_subtitle_accent')}</span>
                        </motion.p>

                        {/* Modern Stats Grid */}
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 px-4"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        >
                            {[
                                { icon: Users, number: "2000+", label: t('about.happy_families'), color: "text-blue-600" },
                                { icon: Award, number: "98%", label: t('about.success_rate'), color: "text-emerald-600" },
                                { icon: Globe, number: "15+", label: t('about.countries'), color: "text-purple-600" },
                                { icon: BookOpen, number: "500K+", label: t('about.lessons_completed'), color: "text-pink-600" }
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <stat.icon className={`${stat.color} mx-auto mb-2 sm:mb-3`} size={28} />
                                    <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>{stat.number}</div>
                                    <div className="text-xs sm:text-sm text-gray-600 font-medium text-center leading-tight">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        >
                            <motion.button
                                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 inline-flex items-center justify-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.location.href = route('programs.index')}
                            >
                                <span>{t('about.start_journey')}</span>
                                <ChevronRight size={18} />
                            </motion.button>
                            <motion.button
                                className="w-full sm:w-auto border-2 border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg transition-all duration-300 inline-flex items-center justify-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <PlayCircle size={18} />
                                <span>{t('about.watch_story')}</span>
                            </motion.button>
                        </motion.div>
                    </div>
                </section>

                {/* Modern Mission & Values Section */}
                <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <motion.div
                            className="text-center mb-12 sm:mb-16 lg:mb-20"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 sm:bg-gradient-to-r sm:from-purple-600 sm:to-blue-600 sm:bg-clip-text sm:text-transparent mb-6 sm:mb-8 px-4">
                                {t('about.our_dna')}
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                                {t('about.dna_subtitle')}
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
                                { id: 'mission', label: t('about.mission'), icon: Target },
                                { id: 'vision', label: t('about.vision'), icon: Star },
                                { id: 'values', label: t('about.values'), icon: Heart }
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
                                    <h3 className="text-4xl font-bold text-gray-800 mb-6">{t('about.mission_title')}</h3>
                                    <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
                                        {t('about.mission_description')}
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
                                    <h3 className="text-4xl font-bold text-gray-800 mb-6">{t('about.vision_title')}</h3>
                                    <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
                                        {t('about.vision_description')}
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
                                    <h3 className="text-4xl font-bold text-gray-800 mb-8 text-center">{t('about.values_title')}</h3>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {[
                                            { icon: Sparkles, title: t('about.innovation'), desc: t('about.innovation_desc') },
                                            { icon: Shield, title: t('about.safety_first'), desc: t('about.safety_desc') },
                                            { icon: Users, title: t('about.inclusivity'), desc: t('about.inclusivity_desc') },
                                            { icon: TrendingUp, title: t('about.excellence'), desc: t('about.excellence_desc') },
                                            { icon: Heart, title: t('about.compassion'), desc: t('about.compassion_desc') },
                                            { icon: Zap, title: t('about.empowerment'), desc: t('about.empowerment_desc') }
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
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 sm:mb-8 px-4">
                                {t('about.creating_impact')}
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl mb-12 sm:mb-16 max-w-3xl mx-auto leading-relaxed opacity-90 px-4">
                                {t('about.impact_subtitle')}
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                {
                                    icon: TrendingUp,
                                    title: t('about.academic_excellence'),
                                    description: t('about.academic_desc'),
                                    metric: t('about.academic_metric')
                                },
                                {
                                    icon: Sparkles,
                                    title: t('about.creative_confidence'),
                                    description: t('about.creative_desc'),
                                    metric: t('about.creative_metric')
                                },
                                {
                                    icon: Globe,
                                    title: t('about.global_community'),
                                    description: t('about.global_desc'),
                                    metric: t('about.global_metric')
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
                <section id="faq" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-white">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            className="text-center mb-12 sm:mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 sm:bg-gradient-to-r sm:from-purple-600 sm:to-blue-600 sm:bg-clip-text sm:text-transparent mb-6 sm:mb-8 px-4">
                                {t('about.faq_title')}
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
                                {t('about.faq_subtitle')}
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            {[
                                {
                                    question: t('about.faq_1_q'),
                                    answer: t('about.faq_1_a')
                                },
                                {
                                    question: t('about.faq_2_q'),
                                    answer: t('about.faq_2_a')
                                },
                                {
                                    question: t('about.faq_3_q'),
                                    answer: t('about.faq_3_a')
                                },
                                {
                                    question: t('about.faq_4_q'),
                                    answer: t('about.faq_4_a')
                                },
                                {
                                    question: t('about.faq_5_q'),
                                    answer: t('about.faq_5_a')
                                },
                                {
                                    question: t('about.faq_6_q'),
                                    answer: t('about.faq_6_a')
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
                                {t('about.still_questions')}
                            </p>
                            <motion.button
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.location.href = route('contact.index')}
                            >
                                <span>{t('about.contact_team')}</span>
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
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 sm:mb-8 px-4">
                                {t('about.ready_journey')}
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed opacity-90 px-4">
                                {t('about.cta_subtitle')}
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
                                onClick={() => window.location.href = route('programs.index')}
                            >
                                <Sparkles size={20} />
                                <span>{t('about.explore_programs')}</span>
                            </motion.button>
                            <motion.button
                                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 inline-flex items-center space-x-2"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.location.href = route('demo.access', { program: 'mental-arithmetic-mastery' })}
                            >
                                <PlayCircle size={20} />
                                <span>{t('about.try_demo')}</span>
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
                                <div className="text-sm opacity-90">{t('about.risk_free_trial')}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-3xl font-bold mb-2">24/7</div>
                                <div className="text-sm opacity-90">{t('about.parent_support')}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-3xl font-bold mb-2">98%</div>
                                <div className="text-sm opacity-90">{t('about.satisfaction_rate')}</div>
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
