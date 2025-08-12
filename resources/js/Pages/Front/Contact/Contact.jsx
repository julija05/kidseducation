import React, { useState } from "react";
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
    Twitter,
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
                response.data.message || "Message sent successfully!"
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
                    "Something went wrong. Please try again later."
                );
            }
        }
    };

    return (
        <>
            <Head title={t('contact')} />
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
                                <MessageCircle className="text-purple-600 mr-2" size={20} />
                                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    We're Here to Help Your Family Succeed
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
                                    Let's Start This
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                    Amazing Journey
                                </span>
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p
                                className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                Have questions? Want to schedule a demo? Or ready to enroll? 
                                Our dedicated team is here to guide you every step of the way.
                                <span className="font-semibold text-purple-600"> Your child's future is our priority.</span>
                            </motion.p>

                            {/* Quick Contact Options */}
                            <motion.div
                                className="grid md:grid-cols-3 gap-6 mb-16"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                            >
                                {[
                                    { icon: Phone, title: "Quick Call", desc: "Speak with our experts instantly", action: "Call Now" },
                                    { icon: Mail, title: "Email Support", desc: "Detailed questions & enrollment", action: "Send Email" },
                                    { icon: MessageCircle, title: "Live Chat", desc: "Get immediate answers", action: "Start Chat" }
                                ].map((option, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <option.icon className="text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" size={32} />
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{option.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{option.desc}</p>
                                        <div className="text-purple-600 font-semibold text-sm group-hover:text-purple-700 flex items-center justify-center">
                                            <span>{option.action}</span>
                                            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </section>

                    {/* Modern Contact Form Section */}
                    <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid lg:grid-cols-2 gap-16 items-start">
                                {/* Contact Form */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100"
                                >
                                    <div className="text-center mb-8">
                                        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                                            Send Us a Message
                                        </h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            Fill out the form below and we'll get back to you within 24 hours with personalized guidance for your child's learning journey.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Name Field */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 ${
                                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                                placeholder="Enter your full name"
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
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 ${
                                                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                                placeholder="your.email@example.com"
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
                                                Your Message *
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                rows={5}
                                                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-300 resize-none ${
                                                    errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                                placeholder="Tell us about your child's age, interests, and what you'd like to know about our programs..."
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
                                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2"
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Send size={20} />
                                            <span>Send Message</span>
                                        </motion.button>
                                    </form>
                                </motion.div>

                                {/* Contact Information */}
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center lg:text-left">
                                        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                                            Get in Touch
                                        </h2>
                                        <p className="text-xl text-gray-600 leading-relaxed mb-12">
                                            We're here to answer your questions, schedule demos, and help you choose the perfect program for your child.
                                        </p>
                                    </div>

                                    {/* Contact Info Cards */}
                                    <div className="space-y-6">
                                        {[
                                            {
                                                icon: Mail,
                                                title: "Email Us",
                                                info: "abacoding@abacoding.com",
                                                desc: "For detailed inquiries & enrollment",
                                                color: "text-blue-600",
                                                bg: "bg-blue-50",
                                                border: "border-blue-200"
                                            },
                                            {
                                                icon: Phone,
                                                title: "Call Us",
                                                info: "+1 (555) 123-4567",
                                                desc: "Mon-Fri 9AM-6PM EST",
                                                color: "text-emerald-600",
                                                bg: "bg-emerald-50",
                                                border: "border-emerald-200"
                                            },
                                            {
                                                icon: Clock,
                                                title: "Response Time",
                                                info: "Within 24 Hours",
                                                desc: "We prioritize every inquiry",
                                                color: "text-purple-600",
                                                bg: "bg-purple-50",
                                                border: "border-purple-200"
                                            }
                                        ].map((contact, index) => (
                                            <motion.div
                                                key={index}
                                                className={`${contact.bg} ${contact.border} border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                            >
                                                <div className="flex items-start space-x-4">
                                                    <div className={`${contact.color} p-3 rounded-xl bg-white shadow-sm`}>
                                                        <contact.icon size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{contact.title}</h3>
                                                        <p className={`${contact.color} font-semibold text-lg mb-1`}>{contact.info}</p>
                                                        <p className="text-gray-600 text-sm">{contact.desc}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Social Media */}
                                    <motion.div
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.6 }}
                                    >
                                        <h3 className="text-2xl font-bold mb-4">Follow Our Journey</h3>
                                        <p className="mb-6 opacity-90">Join our community and see amazing student achievements!</p>
                                        
                                        <div className="flex justify-center space-x-6">
                                            {[
                                                { icon: Facebook, color: "hover:bg-blue-700" },
                                                { icon: Instagram, color: "hover:bg-pink-700" },
                                                { icon: Linkedin, color: "hover:bg-blue-800" },
                                                { icon: Twitter, color: "hover:bg-cyan-600" }
                                            ].map((social, index) => (
                                                <motion.button
                                                    key={index}
                                                    className={`p-3 rounded-xl bg-white/20 ${social.color} transition-all duration-300`}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <social.icon size={24} />
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* Why Choose Us to Contact Section */}
                    <section className="py-24 px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
                        <div className="max-w-6xl mx-auto text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-5xl font-extrabold mb-8">
                                    Why Families Choose to Connect With Us
                                </h2>
                                <p className="text-xl mb-16 max-w-3xl mx-auto leading-relaxed opacity-90">
                                    We're not just an education provider – we're your partners in your child's success story.
                                </p>
                            </motion.div>

                            <div className="grid md:grid-cols-4 gap-8">
                                {[
                                    { icon: Heart, title: "Personal Care", desc: "Every family gets individualized attention" },
                                    { icon: Star, title: "Proven Results", desc: "98% parent satisfaction rate" },
                                    { icon: Shield, title: "Trusted Approach", desc: "Safe, nurturing learning environment" },
                                    { icon: Zap, title: "Quick Response", desc: "Fast, helpful answers to all questions" }
                                ].map((reason, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.2, duration: 0.8 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <reason.icon className="mx-auto mb-4 text-yellow-300" size={40} />
                                        <h3 className="text-xl font-bold mb-3">{reason.title}</h3>
                                        <p className="opacity-90 leading-relaxed text-sm">{reason.desc}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                className="mt-16"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                <p className="text-2xl font-semibold mb-8">
                                    Ready to give your child the gift of extraordinary learning?
                                </p>
                                <motion.button
                                    className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-full text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 inline-flex items-center space-x-2"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Sparkles size={20} />
                                    <span>Start the Conversation</span>
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
