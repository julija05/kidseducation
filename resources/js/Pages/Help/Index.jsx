import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import NavBar from "@/Components/NavBar";
import { 
    HelpCircle, 
    BookOpen, 
    Video, 
    MessageCircle, 
    Search, 
    ChevronDown, 
    ChevronRight,
    Users,
    Settings,
    CreditCard,
    Shield,
    Smartphone,
    Monitor,
    Mail,
    Phone,
    Clock,
    Star,
    Zap,
    Target,
    PlayCircle
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function HelpIndex({ auth }) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [openFAQ, setOpenFAQ] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("all");

    const helpCategories = [
        {
            id: "getting-started",
            title: "Getting Started",
            icon: <PlayCircle className="w-6 h-6" />,
            color: "from-blue-500 to-cyan-500",
            bgColor: "from-blue-50 to-cyan-50",
            description: "Learn the basics of using Abacoding",
            articles: [
                { title: "Creating Your Account", time: "2 min read" },
                { title: "Choosing Your First Program", time: "3 min read" },
                { title: "Understanding the Dashboard", time: "4 min read" },
                { title: "Setting Up Your Profile", time: "2 min read" }
            ]
        },
        {
            id: "programs",
            title: "Programs & Lessons",
            icon: <BookOpen className="w-6 h-6" />,
            color: "from-purple-500 to-pink-500",
            bgColor: "from-purple-50 to-pink-50",
            description: "Everything about our educational programs",
            articles: [
                { title: "Program Enrollment Process", time: "3 min read" },
                { title: "Tracking Your Progress", time: "2 min read" },
                { title: "Accessing Lesson Resources", time: "4 min read" },
                { title: "Completing Assignments", time: "5 min read" }
            ]
        },
        {
            id: "account",
            title: "Account Management",
            icon: <Settings className="w-6 h-6" />,
            color: "from-emerald-500 to-teal-500",
            bgColor: "from-emerald-50 to-teal-50",
            description: "Manage your account settings and preferences",
            articles: [
                { title: "Updating Personal Information", time: "2 min read" },
                { title: "Changing Password", time: "1 min read" },
                { title: "Language Preferences", time: "2 min read" },
                { title: "Notification Settings", time: "3 min read" }
            ]
        },
        {
            id: "billing",
            title: "Billing & Payments",
            icon: <CreditCard className="w-6 h-6" />,
            color: "from-orange-500 to-red-500",
            bgColor: "from-orange-50 to-red-50",
            description: "Payment methods, billing, and subscription info",
            articles: [
                { title: "Payment Methods", time: "3 min read" },
                { title: "Subscription Plans", time: "4 min read" },
                { title: "Refund Policy", time: "2 min read" },
                { title: "Billing History", time: "2 min read" }
            ]
        },
        {
            id: "technical",
            title: "Technical Support",
            icon: <Monitor className="w-6 h-6" />,
            color: "from-violet-500 to-purple-500",
            bgColor: "from-violet-50 to-purple-50",
            description: "Troubleshooting and technical assistance",
            articles: [
                { title: "System Requirements", time: "2 min read" },
                { title: "Browser Compatibility", time: "3 min read" },
                { title: "Video Streaming Issues", time: "4 min read" },
                { title: "Mobile App Guide", time: "5 min read" }
            ]
        },
        {
            id: "privacy",
            title: "Privacy & Security",
            icon: <Shield className="w-6 h-6" />,
            color: "from-indigo-500 to-blue-500",
            bgColor: "from-indigo-50 to-blue-50",
            description: "Your privacy and security information",
            articles: [
                { title: "Data Protection", time: "3 min read" },
                { title: "Account Security", time: "4 min read" },
                { title: "Privacy Settings", time: "2 min read" },
                { title: "COPPA Compliance", time: "3 min read" }
            ]
        }
    ];

    const faqs = [
        {
            id: 1,
            question: "How do I enroll in a program?",
            answer: "To enroll in a program, navigate to the Programs page, select your desired program, and click 'Join Waiting List'. After creating an account, you'll be added to our waiting list and contacted with enrollment details.",
            category: "programs"
        },
        {
            id: 2,
            question: "What age groups is Abacoding suitable for?",
            answer: "Abacoding is designed for children of all ages, with programs specifically tailored to different age groups and skill levels. Our content is COPPA-compliant and safe for children under 13.",
            category: "getting-started"
        },
        {
            id: 3,
            question: "Can I try a program before enrolling?",
            answer: "Yes! We offer free demo access for one program at a time. The demo lasts 7 days and includes access to the first lesson of your chosen program.",
            category: "programs"
        },
        {
            id: 4,
            question: "How do I track my child's progress?",
            answer: "Parents can view their child's progress through the dashboard, which shows lesson completion rates, quiz scores, and overall program advancement.",
            category: "programs"
        },
        {
            id: 5,
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, PayPal, and other secure payment methods through our encrypted payment processors.",
            category: "billing"
        },
        {
            id: 6,
            question: "Is my child's data safe?",
            answer: "Absolutely. We implement industry-standard security measures and are fully COPPA-compliant. We never share personal information with third parties for marketing purposes.",
            category: "privacy"
        }
    ];

    const filteredFAQs = selectedCategory === "all" 
        ? faqs 
        : faqs.filter(faq => faq.category === selectedCategory);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <>
            <Head title="Help & Guides - Abacoding" />
            <NavBar auth={auth} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 relative overflow-hidden">
                {/* Enhanced decorative elements */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30 animate-pulse" 
                     style={{animationDelay: '2s'}} />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse" 
                     style={{animationDelay: '1s'}} />

                {/* Floating particles */}
                <motion.div
                    className="absolute top-32 right-32 w-4 h-4 bg-cyan-400 rounded-full"
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-64 left-32 w-3 h-3 bg-purple-400 rounded-full"
                    animate={{
                        y: [0, -20, 0],
                        x: [0, 15, 0],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />

                {/* Hero Section */}
                <section className="py-20 px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex justify-center mb-8">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 p-6 rounded-full shadow-2xl"
                            >
                                <HelpCircle className="w-16 h-16 text-white" />
                            </motion.div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                            Help & Guides
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Find answers, get support, and learn how to make the most of your Abacoding experience
                        </p>
                        <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full mx-auto"></div>
                    </motion.div>
                </section>

                {/* Search Section */}
                <motion.section 
                    className="py-12 px-4 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                                <input
                                    type="text"
                                    placeholder="Search for help articles, guides, or FAQs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 text-lg transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Quick Actions */}
                <motion.section 
                    className="py-12 px-4 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-6">
                            <motion.div 
                                className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30 text-center hover:bg-white/70 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <MessageCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Live Chat</h3>
                                <p className="text-gray-600 mb-4">Get instant help from our support team</p>
                                <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300">
                                    Start Chat
                                </button>
                            </motion.div>

                            <motion.div 
                                className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30 text-center hover:bg-white/70 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Email Support</h3>
                                <p className="text-gray-600 mb-4">Send us a detailed message</p>
                                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300">
                                    Send Email
                                </button>
                            </motion.div>

                            <motion.div 
                                className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30 text-center hover:bg-white/70 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Video className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Video Tutorials</h3>
                                <p className="text-gray-600 mb-4">Watch step-by-step guides</p>
                                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300">
                                    Watch Now
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Help Categories */}
                <motion.section 
                    className="py-16 px-4 relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="max-w-7xl mx-auto">
                        <motion.div className="text-center mb-12" variants={itemVariants}>
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">Browse by Category</h2>
                            <p className="text-xl text-gray-600">Find the help you need organized by topic</p>
                        </motion.div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {helpCategories.map((category, index) => (
                                <motion.div
                                    key={category.id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30 overflow-hidden group cursor-pointer"
                                >
                                    <div className={`bg-gradient-to-r ${category.bgColor} p-8 text-center relative overflow-hidden`}>
                                        <div className="absolute inset-0 opacity-10">
                                            <div className="absolute top-4 left-4 w-8 h-8 border-2 border-current rounded-full opacity-20"></div>
                                            <div className="absolute bottom-6 right-6 w-6 h-6 border border-current rotate-45 opacity-25"></div>
                                        </div>
                                        
                                        <motion.div 
                                            className={`bg-gradient-to-r ${category.color} inline-flex p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}
                                        >
                                            {category.icon}
                                            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </motion.div>
                                    </div>
                                    
                                    <div className="p-8">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-cyan-600 transition-colors duration-300">
                                            {category.title}
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            {category.description}
                                        </p>
                                        
                                        <div className="space-y-3">
                                            {category.articles.map((article, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700 hover:text-cyan-600 cursor-pointer transition-colors duration-200">
                                                        {article.title}
                                                    </span>
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {article.time}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <button className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                                            <span>View All Articles</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* FAQ Section */}
                <motion.section 
                    className="py-16 px-4 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
                            <p className="text-xl text-gray-600">Quick answers to common questions</p>
                        </div>

                        {/* FAQ Category Filter */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            <button
                                onClick={() => setSelectedCategory("all")}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                    selectedCategory === "all"
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                                        : "bg-white/50 text-gray-600 hover:bg-white/70"
                                }`}
                            >
                                All
                            </button>
                            {helpCategories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                        selectedCategory === category.id
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                                            : "bg-white/50 text-gray-600 hover:bg-white/70"
                                    }`}
                                >
                                    {category.title}
                                </button>
                            ))}
                        </div>

                        {/* FAQ List */}
                        <div className="space-y-4">
                            {filteredFAQs.map((faq) => (
                                <motion.div
                                    key={faq.id}
                                    className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 overflow-hidden"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <button
                                        onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/20 transition-colors duration-200"
                                    >
                                        <span className="font-semibold text-gray-800 text-lg">
                                            {faq.question}
                                        </span>
                                        <motion.div
                                            animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown className="w-5 h-5 text-gray-600" />
                                        </motion.div>
                                    </button>
                                    
                                    {openFAQ === faq.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="px-6 pb-4 border-t border-white/30"
                                        >
                                            <p className="text-gray-700 leading-relaxed pt-4">
                                                {faq.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Contact Support Section */}
                <motion.section 
                    className="py-16 px-4 relative z-10"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                >
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-10 shadow-xl border border-white/20">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                                Still Need Help?
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Can't find what you're looking for? Our support team is here to help you every step of the way.
                            </p>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200/50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-cyan-500 p-3 rounded-full">
                                            <Mail className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">Email Support</p>
                                            <p className="text-cyan-600">support@abacoding.com</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">Response within 24 hours</p>
                                </div>
                                
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-purple-500 p-3 rounded-full">
                                            <Phone className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-800">Phone Support</p>
                                            <p className="text-purple-600">1-800-ABACODING</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">Mon-Fri 9AM-6PM EST</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </>
    );
}