import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../assets/logo.png";
import { Menu, X, Home, BookOpen, User, HelpCircle, Mail, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "../hooks/useTranslation";
import { useRouteWithLocale } from "../Utils/routeHelpers";

const NavBar = React.memo(() => {
    const page = usePage();
    const { auth, url } = page.props;
    const currentUrl = url || window.location.pathname;
    const { t } = useTranslation();
    const { routeWithLocale } = useRouteWithLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for navbar background
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    // Navigation items with icons - now preserving locale parameters
    const navItems = [
        { href: routeWithLocale("landing.index"), label: t('nav.home'), icon: Home },
        { href: routeWithLocale("programs.index"), label: t('nav.programs'), icon: BookOpen },
        { href: routeWithLocale("about.index"), label: t('nav.about'), icon: User },
        { href: routeWithLocale("articles.index"), label: t('nav.help'), icon: HelpCircle },
        { href: routeWithLocale("contact.index"), label: t('nav.contact'), icon: Mail },
    ];

    const authItems = auth?.user 
        ? [{ href: routeWithLocale("dashboard"), label: t('nav.dashboard'), icon: LayoutDashboard }]
        : [
            { href: routeWithLocale("login"), label: t('nav.login'), icon: LogIn },
            { href: routeWithLocale("register"), label: t('nav.register'), icon: UserPlus }
          ];

    const isActive = (href) => {
        if (!currentUrl || !href) return false;
        
        try {
            // Parse URLs to handle query parameters properly
            const currentUrlObj = new URL(currentUrl, window.location.origin);
            const hrefObj = new URL(href, window.location.origin);
            
            // Normalize pathnames by removing trailing slashes
            const currentPathname = currentUrlObj.pathname.replace(/\/$/, '') || '/';
            const hrefPathname = hrefObj.pathname.replace(/\/$/, '') || '/';
            
            // For root/home path, only match exactly
            if (hrefPathname === '/' || hrefPathname === '') {
                return currentPathname === '/' || currentPathname === '';
            }
            
            // For other paths, use exact match or startsWith for nested routes
            return currentPathname === hrefPathname || 
                   currentPathname.startsWith(hrefPathname + '/');
        } catch (error) {
            // Fallback to simple string comparison if URL parsing fails
            const normalizedCurrentUrl = currentUrl.replace(/\/$/, '') || '/';
            const normalizedHref = href.replace(/\/$/, '') || '/';
            
            if (normalizedHref === '/' || normalizedHref === '') {
                return normalizedCurrentUrl === '/' || normalizedCurrentUrl === '';
            }
            
            return normalizedCurrentUrl === normalizedHref || 
                   normalizedCurrentUrl.startsWith(normalizedHref + '/');
        }
    };

    return (
        <>
            <motion.header 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled 
                        ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/20' 
                        : 'bg-white/90 backdrop-blur-sm'
                }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex justify-between items-center h-16 lg:h-20">
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Link
                                href={routeWithLocale("landing.index")}
                                className="flex items-center space-x-2 font-bold text-xl lg:text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                            >
                                <span>Abacoding</span>
                            </Link>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <motion.nav 
                            className="hidden lg:flex items-center space-x-1"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {navItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div key={item.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative group ${
                                                isActive(item.href)
                                                    ? 'text-purple-600 bg-purple-50'
                                                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                            {isActive(item.href) && (
                                                <motion.div
                                                    className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-600 rounded-full"
                                                    layoutId="activeIndicator"
                                                    style={{ x: '-50%' }}
                                                />
                                            )}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.nav>

                        {/* Desktop Auth & Language */}
                        <motion.div 
                            className="hidden lg:flex items-center space-x-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {authItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div key={item.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                                item.href === route("register")
                                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                                                    : isActive(item.href)
                                                    ? 'text-purple-600 bg-purple-50'
                                                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                            <div className="ml-2">
                                <LanguageSelector />
                            </div>
                        </motion.div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            className="lg:hidden p-2 rounded-full text-gray-700 hover:text-purple-600 hover:bg-gray-100 transition-colors duration-200"
                            onClick={toggleMenu}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <AnimatePresence mode="wait">
                                {isOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X size={24} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Menu size={24} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleMenu}
                        />
                        
                        {/* Mobile Menu */}
                        <motion.div
                            className="fixed top-16 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200/20 lg:hidden max-h-[calc(100vh-6rem)] overflow-y-auto"
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <div className="p-6 space-y-4">
                                {/* Navigation Items */}
                                <div className="space-y-2">
                                    {navItems.map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <motion.div
                                                key={item.href}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * index }}
                                            >
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                                                        isActive(item.href)
                                                            ? 'text-purple-600 bg-purple-50 border-l-4 border-purple-600'
                                                            : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                                                    }`}
                                                    onClick={toggleMenu}
                                                >
                                                    <Icon size={20} />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-100" />

                                {/* Auth Items */}
                                <div className="space-y-2">
                                    {authItems.map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <motion.div
                                                key={item.href}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * (navItems.length + index) }}
                                            >
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                                                        item.href === route("register")
                                                            ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                                                            : isActive(item.href)
                                                            ? 'text-purple-600 bg-purple-50 border-l-4 border-purple-600'
                                                            : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                                                    }`}
                                                    onClick={toggleMenu}
                                                >
                                                    <Icon size={20} />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Language Selector */}
                                <motion.div
                                    className="pt-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <LanguageSelector isMobile={true} />
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Spacer to prevent content overlap */}
            <div className="h-16 lg:h-20" />
        </>
    );
});

export default NavBar;
