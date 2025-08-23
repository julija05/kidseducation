import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Mail, Phone, MapPin, Clock, Heart, Shield, Award, 
    Facebook, Instagram, Youtube, Linkedin, 
    ExternalLink, ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function ModernFooter() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSubscribing(true);
        
        try {
            const response = await fetch('/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSubscriptionStatus('success');
                setEmail('');
            } else {
                setSubscriptionStatus('error');
            }
            
            setTimeout(() => setSubscriptionStatus(null), 5000);
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            setSubscriptionStatus('error');
            setTimeout(() => setSubscriptionStatus(null), 5000);
        } finally {
            setIsSubscribing(false);
        }
    };

    const socialLinks = [
        { icon: Facebook, href: 'https://www.facebook.com/people/Abacoding/100089891705337/', label: t('footer.facebook'), disabled: false },
        { icon: Instagram, href: 'https://instagram.com/abacoding', label: t('footer.instagram'), disabled: false },
        { icon: Youtube, href: null, label: t('footer.youtube'), disabled: true },
        { icon: Linkedin, href: 'https://linkedin.com/company/abacoding', label: t('footer.linkedin'), disabled: false },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
            </div>

            <motion.div 
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {/* Main footer content */}
                <div className="py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
                        {/* Company Info */}
                        <motion.div 
                            className="lg:col-span-2 space-y-6"
                            variants={itemVariants}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                                        <span className="text-xl font-bold">A</span>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        Abacoding
                                    </h3>
                                </div>
                                <p className="text-lg text-blue-200 font-medium">
                                    {t('footer.company_tagline')}
                                </p>
                                <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
                                    {t('footer.company_description')}
                                </p>
                            </div>

                            {/* Mission */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-pink-400" />
                                    {t('footer.our_mission')}
                                </h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {t('footer.mission_statement')}
                                </p>
                            </div>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div variants={itemVariants}>
                            <h3 className="text-lg font-semibold text-white mb-6">
                                {t('footer.programs')}
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="/programs/mental-arithmetic-mastery" className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        {t('footer.mental_arithmetic')}
                                    </a>
                                </li>
                                <li>
                                    <a href="/programs/coding-for-kids-scratch" className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        {t('footer.coding_adventures')}
                                    </a>
                                </li>
                                <li>
                                    <a href="/programs" className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        {t('footer.all_programs')}
                                    </a>
                                </li>
                            </ul>

                            {/* Support Links */}
                            <h3 className="text-lg font-semibold text-white mb-6 mt-8">
                                {t('footer.support')}
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="/articles" className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        {t('footer.help_center')}
                                    </a>
                                </li>
                                <li>
                                    <a href="/contact" className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        {t('footer.contact_us')}
                                    </a>
                                </li>
                                <li>
                                    <a href="/about" className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        {t('footer.faq')}
                                    </a>
                                </li>
                            </ul>
                        </motion.div>

                        {/* Newsletter & Contact */}
                        <motion.div variants={itemVariants}>
                            {/* Newsletter Signup */}
                            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20 mb-8">
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    {t('footer.newsletter_title')}
                                </h3>
                                <p className="text-gray-300 text-sm mb-4">
                                    {t('footer.newsletter_description')}
                                </p>
                                
                                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={t('footer.newsletter_placeholder')}
                                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                            disabled={isSubscribing}
                                        />
                                    </div>
                                    
                                    <motion.button
                                        type="submit"
                                        disabled={isSubscribing || !email.trim()}
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isSubscribing ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                            />
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4" />
                                                {t('footer.subscribe')}
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                {/* Subscription status */}
                                {subscriptionStatus && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm ${
                                            subscriptionStatus === 'success' 
                                                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                        }`}
                                    >
                                        {subscriptionStatus === 'success' ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4" />
                                        )}
                                        {subscriptionStatus === 'success' 
                                            ? t('footer.newsletter_success')
                                            : t('footer.newsletter_error')
                                        }
                                    </motion.div>
                                )}

                                <p className="text-xs text-gray-400 mt-3">
                                    {t('footer.newsletter_privacy')}
                                </p>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">
                                    {t('footer.contact_info')}
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                        <a href="mailto:abacoding@abacoding.com" className="hover:text-white transition-colors">
                                            abacoding@abacoding.com
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Phone className="w-4 h-4 text-green-400" />
                                        <a href="tel:+15551234567" className="hover:text-white transition-colors">
                                            +1 (555) 123-4567
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-3 text-gray-300">
                                        <Clock className="w-4 h-4 text-yellow-400 mt-0.5" />
                                        <span>{t('footer.hours_weekday')}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Trust indicators */}
                <motion.div 
                    className="border-t border-white/10 py-8"
                    variants={itemVariants}
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="text-center">
                            <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-300">{t('footer.secure_platform')}</p>
                        </div>
                        <div className="text-center">
                            <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-300">{t('footer.safe_environment')}</p>
                        </div>
                        <div className="text-center">
                            <CheckCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-300">{t('footer.data_protected')}</p>
                        </div>
                        <div className="text-center">
                            <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-300">{t('footer.trusted_by_families')}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Social links */}
                <motion.div 
                    className="border-t border-white/10 py-8"
                    variants={itemVariants}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {t('footer.follow_us')}
                            </h3>
                            <p className="text-gray-300 text-sm">
                                {t('footer.social_description')}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social, index) => (
                                social.disabled ? (
                                    <motion.div
                                        key={index}
                                        aria-label={`${social.label} (Coming Soon)`}
                                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center cursor-not-allowed opacity-50"
                                        title={`${social.label} - Coming Soon`}
                                    >
                                        <social.icon className="w-5 h-5 text-gray-500" />
                                    </motion.div>
                                ) : (
                                    <motion.a
                                        key={index}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <social.icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                                    </motion.a>
                                )
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Bottom footer */}
                <motion.div 
                    className="border-t border-white/10 py-6"
                    variants={itemVariants}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
                            <p>{t('footer.copyright', { year: '2024' })}</p>
                            <div className="hidden md:block w-1 h-1 bg-gray-600 rounded-full" />
                            <p className="flex items-center gap-1">
                                {t('footer.built_with_love')}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                            <a href="/privacy-policy" className="hover:text-white transition-colors">
                                {t('footer.privacy_policy')}
                            </a>
                            <a href="/terms-of-service" className="hover:text-white transition-colors">
                                {t('footer.terms_of_service')}
                            </a>
                            <span>Version 2.1.0</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </footer>
    );
}