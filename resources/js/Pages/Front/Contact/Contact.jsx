import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";
import axios from "@/config/axios";
import { useTranslation } from "@/hooks/useTranslation";
import { 
    Mail, 
    Phone, 
    MapPin, 
    Clock, 
    Send, 
    MessageCircle, 
    Heart,
    Star,
    Globe,
    Shield,
    Zap,
    Users,
    CheckCircle,
    AlertCircle,
    Facebook,
    Instagram,
    Linkedin,
    ChevronRight,
    Sparkles
} from "lucide-react";

export default function ContactUs({ auth }) {
    const { t } = useTranslation();
    const [contactRef, contactInView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const [responseMessage, setResponseMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");
        setErrors({});

        try {
            console.log(formData, "formdata");
            const response = await axios.post("/contact", formData);
            setSuccessMessage(
                response.data.message || t('contact.message_sent_success')
            );
            setFormData({ name: "", email: "", message: "" });
            // Reset form
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            if (error.response?.status === 422) {
                // Validation error
                setErrors(error.response.data.errors);
            } else {
                // Other errors
                setErrorMessage(
                    t('contact.form_error')
                );
            }
        }
    };

    return (
        <>
            <Head title={t('contact.page_title')} />
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
                                <MessageCircle className="text-purple-600 mr-2 flex-shrink-0" size={16} />
                                <span className="text-xs sm:text-sm font-semibold text-purple-600 sm:bg-gradient-to-r sm:from-purple-600 sm:to-blue-600 sm:bg-clip-text sm:text-transparent text-center leading-tight">
                                    {t('contact.hero_badge')}
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
                                    {t('contact.hero_title_1')}
                                </span>
                                <span className="block text-gray-900 sm:bg-gradient-to-r sm:from-purple-600 sm:via-pink-600 sm:to-blue-600 sm:bg-clip-text sm:text-transparent">
                                    {t('contact.hero_title_2')}
                                </span>
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p
                                className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                {t('contact.hero_subtitle')}
                                <span className="font-semibold text-purple-600"> {t('contact.hero_subtitle_accent')}</span>
                            </motion.p>

                            {/* Quick Contact Options */}
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 px-4"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                            >
                                {[
                                    { icon: Sparkles, title: t('contact.schedule_demo'), desc: t('contact.schedule_demo_desc'), action: t('contact.schedule_demo_action'), onClick: () => window.location.href = route('demo.access', { program: 'mental-arithmetic-mastery' }) },
                                    { icon: Mail, title: t('contact.email_support'), desc: t('contact.email_support_desc'), action: t('contact.email_support_action'), onClick: () => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' }) },
                                    { icon: MessageCircle, title: t('contact.live_chat'), desc: t('contact.live_chat_desc'), action: t('contact.live_chat_action'), onClick: () => window.dispatchEvent(new CustomEvent('openChat')) }
                                ].map((option, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        onClick={option.onClick}
                                    >
                                        <option.icon className="text-purple-600 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" size={24} />
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 text-center">{option.title}</h3>
                                        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 text-center leading-relaxed">{option.desc}</p>
                                        <div className="text-purple-600 font-semibold text-xs sm:text-sm group-hover:text-purple-700 flex items-center justify-center">
                                            <span>{option.action}</span>
                                            <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </section>

                    {/* Modern Contact Form Section */}
                    <section id="contact-form" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-white">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                                {/* Contact Form */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-gray-100"
                                >
                                    <div className="text-center mb-6 sm:mb-8">
                                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 sm:bg-gradient-to-r sm:from-purple-600 sm:to-blue-600 sm:bg-clip-text sm:text-transparent mb-3 sm:mb-4">
                                            {t('contact.send_message_title')}
                                        </h2>
                                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                            {t('contact.form_subtitle')}
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Name Field */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {t('contact.your_name')} {t('contact.required_field')}
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 ${
                                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                                placeholder={t('contact.your_name_placeholder')}
                                            />
                                            {errors.name && (
                                                <motion.p
                                                    className="text-red-500 text-sm mt-2 flex items-center"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle size={16} className="mr-1" />
                                                    {errors.name[0]}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {t('contact.email_address')} {t('contact.required_field')}
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 ${
                                                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                                placeholder={t('contact.email_placeholder')}
                                            />
                                            {errors.email && (
                                                <motion.p
                                                    className="text-red-500 text-sm mt-2 flex items-center"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle size={16} className="mr-1" />
                                                    {errors.email[0]}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Message Field */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {t('contact.your_message')} {t('contact.required_field')}
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                rows={5}
                                                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 resize-none ${
                                                    errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                                placeholder={t('contact.message_placeholder')}
                                            />
                                            {errors.message && (
                                                <motion.p
                                                    className="text-red-500 text-sm mt-2 flex items-center"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle size={16} className="mr-1" />
                                                    {errors.message[0]}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Success/Error Messages */}
                                        {successMessage && (
                                            <motion.div
                                                className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <CheckCircle className="text-green-600 mr-3" size={20} />
                                                <p className="text-green-800 font-medium">{successMessage}</p>
                                            </motion.div>
                                        )}

                                        {errorMessage && (
                                            <motion.div
                                                className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <AlertCircle className="text-red-600 mr-3" size={20} />
                                                <p className="text-red-800 font-medium">{errorMessage}</p>
                                            </motion.div>
                                        )}

                                        {/* Submit Button */}
                                        <motion.button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2"
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Send size={18} />
                                            <span>{t('contact.send_message')}</span>
                                        </motion.button>
                                    </form>
                                </motion.div>

                                {/* Contact Information */}
                                <motion.div
                                    id="get-in-touch"
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center lg:text-left">
                                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 sm:bg-gradient-to-r sm:from-purple-600 sm:to-blue-600 sm:bg-clip-text sm:text-transparent mb-4 sm:mb-6">
                                            {t('contact.get_in_touch')}
                                        </h2>
                                        <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-8 sm:mb-12">
                                            {t('contact.contact_subtitle')}
                                        </p>
                                    </div>

                                    {/* Contact Info Cards */}
                                    <div className="space-y-4 sm:space-y-6">
                                        {[
                                            {
                                                icon: Mail,
                                                title: t('contact.email_us'),
                                                info: t('contact.email_info'),
                                                desc: t('contact.email_desc'),
                                                color: "text-blue-600",
                                                bg: "bg-blue-50",
                                                border: "border-blue-200"
                                            },
                                            {
                                                icon: Phone,
                                                title: t('contact.call_us'),
                                                info: t('contact.phone_info'),
                                                desc: t('contact.phone_desc'),
                                                color: "text-emerald-600",
                                                bg: "bg-emerald-50",
                                                border: "border-emerald-200"
                                            },
                                            {
                                                icon: Clock,
                                                title: t('contact.response_time'),
                                                info: t('contact.response_info'),
                                                desc: t('contact.response_desc'),
                                                color: "text-purple-600",
                                                bg: "bg-purple-50",
                                                border: "border-purple-200"
                                            }
                                        ].map((contact, index) => (
                                            <motion.div
                                                key={index}
                                                className={`${contact.bg} ${contact.border} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                            >
                                                <div className="flex items-start space-x-3 sm:space-x-4">
                                                    <div className={`${contact.color} p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white shadow-sm flex-shrink-0`}>
                                                        <contact.icon size={20} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{contact.title}</h3>
                                                        <p className={`${contact.color} font-semibold text-base sm:text-lg mb-1 break-words`}>{contact.info}</p>
                                                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{contact.desc}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Social Media */}
                                    <motion.div
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.6 }}
                                    >
                                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t('contact.follow_journey')}</h3>
                                        <p className="mb-4 sm:mb-6 opacity-90 text-sm sm:text-base leading-relaxed">{t('contact.social_subtitle')}</p>
                                        
                                        <div className="flex justify-center space-x-4 sm:space-x-6">
                                            {[
                                                { icon: Facebook, color: "hover:bg-blue-700", url: "https://www.facebook.com/people/Abacoding/100089891705337/" },
                                                { icon: Instagram, color: "hover:bg-pink-700", url: "https://instagram.com/abacoding" },
                                                { icon: Linkedin, color: "hover:bg-blue-800", url: "https://linkedin.com/company/abacoding" }
                                            ].map((social, index) => (
                                                <motion.button
                                                    key={index}
                                                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 ${social.color} transition-all duration-300`}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => window.open(social.url, '_blank', 'noopener,noreferrer')}
                                                >
                                                    <social.icon size={20} />
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* Why Choose Us to Contact Section */}
                    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
                        <div className="max-w-6xl mx-auto text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 sm:mb-8 px-4">
                                    {t('contact.why_choose_title')}
                                </h2>
                                <p className="text-base sm:text-lg md:text-xl mb-12 sm:mb-16 max-w-3xl mx-auto leading-relaxed opacity-90 px-4">
                                    {t('contact.why_choose_subtitle')}
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 px-4">
                                {[
                                    { icon: Heart, title: t('contact.personal_care'), desc: t('contact.personal_care_desc') },
                                    { icon: Star, title: t('contact.proven_results'), desc: t('contact.proven_results_desc') },
                                    { icon: Shield, title: t('contact.trusted_approach'), desc: t('contact.trusted_approach_desc') },
                                    { icon: Zap, title: t('contact.quick_response'), desc: t('contact.quick_response_desc') }
                                ].map((reason, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.2, duration: 0.8 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <reason.icon className="mx-auto mb-3 sm:mb-4 text-yellow-300" size={32} />
                                        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-center">{reason.title}</h3>
                                        <p className="opacity-90 leading-relaxed text-xs sm:text-sm text-center">{reason.desc}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                className="mt-12 sm:mt-16 px-4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                <p className="text-lg sm:text-xl md:text-2xl font-semibold mb-6 sm:mb-8 leading-relaxed">
                                    {t('contact.ready_question')}
                                </p>
                                <motion.button
                                    className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 inline-flex items-center space-x-2"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.dispatchEvent(new CustomEvent('openChat'))}
                                >
                                    <Sparkles size={18} />
                                    <span>{t('contact.start_conversation')}</span>
                                </motion.button>
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
