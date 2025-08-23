import Dropdown from "@/Components/Dropdown";
import { Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import { User, ChevronDown, Bell, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import StudentNotifications from "@/Components/Dashboard/StudentNotifications";
import AbacusSimulator from "@/Components/AbacusSimulator";
import StudentNavBar from "@/Components/StudentNavBar";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme, ThemeProvider } from "@/hooks/useTheme.jsx";
import ThemeManager from "@/Components/ThemeManager";
import { useAvatar } from "@/hooks/useAvatar.jsx";
import { useRouteWithLocale } from "@/Utils/routeHelpers";


export default function AuthenticatedLayout(props) {
    // Temporarily disable ThemeProvider to test if it's causing the loop
    return <AuthenticatedLayoutContentSimple {...props} />;
}

// Simplified version without theme system for testing
function AuthenticatedLayoutContentSimple({
    children,
    programConfig = null,
    showSideNavigation = false,
    customHeader = null,
}) {
    const { props } = usePage();
    const user = props.auth.user;
    const { t } = useTranslation();
    const { avatarData, renderAvatar } = useAvatar();
    const { routeWithLocale } = useRouteWithLocale();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showAbacus, setShowAbacus] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(() => {
        try {
            return document.documentElement.getAttribute('data-theme') || 'default';
        } catch {
            return 'default';
        }
    });
    
    // Check if user is a student (has student role)
    const isStudent = user.roles && user.roles.includes('student');
    
    // Listen for theme changes
    useEffect(() => {
        const handleThemeChange = () => {
            const newTheme = document.documentElement.getAttribute('data-theme') || 'default';
            setCurrentTheme(newTheme);
        };
        
        // Listen for data-theme attribute changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    handleThemeChange();
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        return () => observer.disconnect();
    }, []);
    
    // Get notification data from props if available
    const { notifications = [], unreadNotificationCount = 0, nextClass = null, enrolledProgram = null } = props;
    
    // Check if student is enrolled in Mental Arithmetic program
    const isMentalArithmeticStudent = isStudent && enrolledProgram && 
        (enrolledProgram.name === 'Mental Arithmetic Mastery' || 
         enrolledProgram.translated_name === 'Ментална Аритметика') && 
        enrolledProgram.approvalStatus === 'approved';

    // Simple theme using CSS custom properties
    const theme = {
        name: "Dashboard",
        color: programConfig?.color || null,
        lightColor: programConfig?.lightColor || null,
        borderColor: programConfig?.borderColor || null,
        textColor: programConfig?.textColor || null,
    };

    const handleMarkAllAsRead = () => {
        router.patch('/dashboard/notifications/mark-all-read', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // Define theme-specific gradients
    const themeGradients = {
        default: 'linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))',
        purple: 'linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119))',
        green: 'linear-gradient(to right, rgb(22, 163, 74), rgb(5, 150, 105))',
        orange: 'linear-gradient(to right, rgb(234, 88, 12), rgb(239, 68, 68))',
        teal: 'linear-gradient(to right, rgb(13, 148, 136), rgb(6, 182, 212))',
        dark: 'linear-gradient(to right, rgb(31, 41, 55), rgb(17, 24, 39))'
    };
    
    // Force a default gradient if no theme is detected
    const activeTheme = currentTheme || 'default';
    const headerStyle = {
        background: themeGradients[activeTheme] || themeGradients.default,
        backgroundImage: themeGradients[activeTheme] || themeGradients.default,
        minHeight: '80px',
        color: 'white !important'
    };
    

    return (
        <div className="min-h-screen bg-gray-50">
            <ThemeManager />
            {/* Modern Header */}
            <motion.header 
                className="backdrop-blur-lg shadow-xl border-b border-white/20 relative overflow-visible"
                style={{
                    background: `${themeGradients[activeTheme]}, rgba(255, 255, 255, 0.1)`,
                    backdropFilter: 'blur(16px)',
                    color: 'white',
                    minHeight: '70px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 100
                }}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Background decorative elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <motion.div 
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            {customHeader ? (
                                customHeader
                            ) : (
                                <StudentNavBar 
                                    panelType="dashboard"
                                    program={enrolledProgram}
                                />
                            )}
                        </motion.div>

                        <motion.div 
                            className="flex items-center gap-2 sm:gap-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {/* Modern Abacus Icon for Mental Arithmetic students */}
                            {isMentalArithmeticStudent && (
                                <motion.button
                                    onClick={() => setShowAbacus(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200 text-white text-sm border border-white/30 shadow-lg"
                                    title={t('dashboard.open_abacus_simulator')}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Calculator size={18} />
                                    <span className="hidden sm:inline font-medium">{t('dashboard.abacus')}</span>
                                </motion.button>
                            )}
                            
                            {/* Student Notifications */}
                            {isStudent && (
                                <StudentNotifications
                                    notifications={notifications}
                                    unreadCount={unreadNotificationCount}
                                    nextClass={null} // Don't show next class in header, only on dashboard
                                    headerMode={true}
                                    onMarkAllAsRead={handleMarkAllAsRead}
                                />
                            )}

                            {/* Modern User Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <motion.button
                                            type="button"
                                            className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 sm:py-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/30 hover:border-white/50 shadow-lg backdrop-blur-sm bg-white/10"
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs opacity-90">
                                                    {t('dashboard.welcome_back')},
                                                </p>
                                                <p className="font-semibold text-sm text-white">
                                                    {user.name}
                                                </p>
                                            </div>
                                            <motion.div 
                                                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40 shadow-lg"
                                                whileHover={{ rotate: 5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {avatarData && avatarData.type === 'emoji' ? (
                                                    <span className="text-lg sm:text-xl">{avatarData.value}</span>
                                                ) : (
                                                    <span className="text-lg sm:text-xl font-bold text-white">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                                                    </span>
                                                )}
                                            </motion.div>
                                            <motion.div
                                                animate={{ rotate: [0, 5, -5, 0] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <ChevronDown
                                                    size={14}
                                                    className="opacity-90 text-white hidden sm:block"
                                                />
                                            </motion.div>
                                        </motion.button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    {/* Avatar & User Info Section */}
                                    <div className="px-4 py-4 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <motion.div 
                                                className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-200 shadow-sm shrink-0"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {avatarData && avatarData.type === 'emoji' ? (
                                                    <span className="text-2xl">{avatarData.value}</span>
                                                ) : (
                                                    <span className="text-xl font-bold text-blue-700">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                                                    </span>
                                                )}
                                            </motion.div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 text-base truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {user.email}
                                                </p>
                                                <Link
                                                    href={routeWithLocale("profile.edit")}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 inline-flex items-center gap-1 touch-manipulation"
                                                >
                                                    🎭 {t('profile.change_avatar')}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Navigation Links */}
                                    <div className="py-2">
                                        <Dropdown.Link
                                            href={routeWithLocale("dashboard")}
                                            className="rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 mx-2"
                                        >
                                            🏠 {t('nav.dashboard')}
                                        </Dropdown.Link>
                                        {isStudent && (
                                            <Dropdown.Link
                                                href={routeWithLocale("my-schedule")}
                                                className="rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 mx-2"
                                            >
                                                📅 {t('nav.my_schedule')}
                                            </Dropdown.Link>
                                        )}
                                        <Dropdown.Link
                                            href={routeWithLocale("profile.edit")}
                                            className="rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 mx-2"
                                        >
                                            ⚙️ {t('nav.profile_settings')}
                                        </Dropdown.Link>
                                    </div>
                                    
                                    {/* Email Verification Status */}
                                    <div className="px-4 py-2 mx-2 my-1">
                                        {user.email_verified_at ? (
                                            <div className="flex items-center gap-2 px-3 py-3 bg-green-50 rounded-lg border border-green-200">
                                                <span className="inline-flex items-center gap-1 text-green-700 text-sm font-medium">
                                                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('verification.verified')}
                                                </span>
                                            </div>
                                        ) : (
                                            <Link
                                                href={routeWithLocale("verification.notice")}
                                                className="flex items-center gap-2 px-3 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-all duration-200 touch-manipulation"
                                            >
                                                <span className="inline-flex items-center gap-1 text-yellow-700 text-sm font-medium">
                                                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('verification.verify')}
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <Dropdown.Link
                                        href={routeWithLocale("logout")}
                                        method="post"
                                        as="button"
                                        className="text-white font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:bg-red-600 hover:text-white shadow-lg border-l-4 border-red-400 hover:border-red-500 rounded-lg mx-4 mb-2 text-center"
                                    >
                                        🚪 {t('nav.log_out')}
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
            
            {/* Modern Floating Abacus Button - Only for Mental Arithmetic students */}
            {isMentalArithmeticStudent && (
                <motion.div 
                    className="fixed bottom-6 right-6 z-40"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
                >
                    <motion.button
                        onClick={() => setShowAbacus(true)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white p-4 rounded-full shadow-2xl border border-white/20 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-amber-300/50"
                        title={t('dashboard.open_abacus_simulator')}
                        aria-label={t('dashboard.open_abacus_simulator')}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{ 
                            boxShadow: [
                                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                "0 25px 50px -12px rgba(245, 158, 11, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Calculator size={24} />
                        </motion.div>
                    </motion.button>
                </motion.div>
            )}
            
            {/* Abacus Simulator Modal */}
            <AbacusSimulator 
                isOpen={showAbacus} 
                onClose={() => setShowAbacus(false)} 
            />
        </div>
    );
}
