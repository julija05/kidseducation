import Dropdown from "@/Components/Dropdown";
import { Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import { User, ChevronDown, Bell, Calculator } from "lucide-react";
import StudentNotifications from "@/Components/Dashboard/StudentNotifications";
import AbacusSimulator from "@/Components/AbacusSimulator";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme, ThemeProvider } from "@/hooks/useTheme.jsx";
import ThemeManager from "@/Components/ThemeManager";
import { useAvatar } from "@/hooks/useAvatar.jsx";

function AuthenticatedLayoutContent({
    children,
    programConfig = null,
    showSideNavigation = false,
    customHeader = null,
}) {
    const { props } = usePage();
    const user = props.auth.user;
    const { t } = useTranslation();
    const { theme: userTheme, setTemporaryTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showAbacus, setShowAbacus] = useState(false);
    
    // Check if user is a student (has student role)
    const isStudent = user.roles && user.roles.includes('student');
    
    // Get notification data from props if available
    const { notifications = [], unreadNotificationCount = 0, nextClass = null, enrolledProgram } = props;
    
    // Check if student is enrolled in Mental Arithmetic program
    const isMentalArithmeticStudent = isStudent && enrolledProgram && 
        (enrolledProgram.name === 'Mental Arithmetic Mastery' || 
         enrolledProgram.translated_name === 'Ментална Аритметика') && 
        enrolledProgram.approvalStatus === 'approved';

    // Use program config if provided, otherwise use user's theme
    const theme = useMemo(() => {
        return programConfig ? {
            name: programConfig.name || "Dashboard",
            color: programConfig.color || `bg-gradient-to-r ${userTheme.primary}`,
            lightColor: programConfig.lightColor || `bg-gradient-to-br ${userTheme.primaryLight}`,
            borderColor: programConfig.borderColor || userTheme.primaryBorder,
            textColor: programConfig.textColor || userTheme.primaryText,
        } : {
            name: "Dashboard",
            color: `bg-gradient-to-r ${userTheme.primary}`,
            lightColor: `bg-gradient-to-br ${userTheme.primaryLight}`,
            borderColor: userTheme.primaryBorder,
            textColor: userTheme.primaryText,
        };
    }, [programConfig, userTheme]);

    // Set temporary theme if program config is provided
    useEffect(() => {
        if (programConfig) {
            setTemporaryTheme(programConfig);
        } else {
            setTemporaryTheme(null);
        }
    }, [programConfig, setTemporaryTheme]);

    const handleMarkAllAsRead = () => {
        router.patch('/dashboard/notifications/mark-all-read', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // Ensure we have a valid background color class
    const headerBgClass =
        theme.color && theme.color.startsWith("bg-")
            ? theme.color
            : "bg-gray-700";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="text-white shadow-lg" style={headerStyle}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {customHeader ? (
                                customHeader
                            ) : (
                                <>
                                    <User
                                        className="mr-3 text-white"
                                        size={32}
                                    />
                                    <Link 
                                        href={route("dashboard")}
                                        className="text-white hover:text-gray-200 transition-colors"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold">Abacoding</span>
                                            <span className="text-xs opacity-75 -mt-1">program panel</span>
                                        </div>
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Abacus Icon for Mental Arithmetic students */}
                            {isMentalArithmeticStudent && (
                                <button
                                    onClick={() => setShowAbacus(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 text-white text-sm"
                                    title={t('dashboard.open_abacus_simulator')}
                                >
                                    <Calculator size={18} />
                                    <span className="hidden sm:inline">{t('dashboard.abacus')}</span>
                                </button>
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

                            {/* User Dropdown - Fixed with better visibility */}
                            <div className="relative">
                                <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 border-2 border-white border-opacity-30 hover:border-opacity-50 shadow-sm"
                                        >
                                            <div className="text-right">
                                                <p className="text-xs opacity-90">
                                                    {t('dashboard.welcome_back')},
                                                </p>
                                                <p className="font-semibold text-sm text-white">
                                                    {user.name}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center border border-white border-opacity-20">
                                                {avatarData && avatarData.type === 'emoji' ? (
                                                    <span className="text-sm">{avatarData.value}</span>
                                                ) : (
                                                    <User size={16} className="text-white" />
                                                )}
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className="opacity-90 text-white"
                                            />
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route("dashboard")}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {t('nav.dashboard')}
                                    </Dropdown.Link>
                                    {isStudent && (
                                        <Dropdown.Link
                                            href={route("my-schedule")}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {t('nav.my_schedule')}
                                        </Dropdown.Link>
                                    )}
                                    <Dropdown.Link
                                        href={route("profile.edit")}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {t('nav.profile_settings')}
                                    </Dropdown.Link>
                                    
                                    {/* Email Verification Status */}
                                    <div className="px-4 py-2 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">{t('profile.email_status')}:</span>
                                            {user.email_verified_at ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('verification.verified')}
                                                </span>
                                            ) : (
                                                <Link
                                                    href={route("verification.notice")}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full hover:bg-yellow-200"
                                                >
                                                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('verification.verify')}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        {t('nav.log_out')}
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
            
            {/* Floating Abacus Button - Only for Mental Arithmetic students */}
            {isMentalArithmeticStudent && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        onClick={() => setShowAbacus(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300"
                        title={t('dashboard.open_abacus_simulator')}
                        aria-label={t('dashboard.open_abacus_simulator')}
                    >
                        <Calculator size={24} />
                    </button>
                </div>
            )}
            
            {/* Abacus Simulator Modal */}
            <AbacusSimulator 
                isOpen={showAbacus} 
                onClose={() => setShowAbacus(false)} 
            />
        </div>
    );
}

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
    const { notifications = [], unreadNotificationCount = 0, nextClass = null, enrolledProgram } = props;
    
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
    
    // Debug: Log the header style being applied
    console.log('Current theme state:', currentTheme);
    console.log('Active theme used:', activeTheme);
    console.log('Header Style Applied:', headerStyle);

    return (
        <div className="min-h-screen bg-gray-50">
            <ThemeManager />
            {/* Header */}
            <header 
                className="shadow-lg border-b-2 border-white border-opacity-20"
                style={{
                    background: themeGradients[activeTheme],
                    backgroundImage: themeGradients[activeTheme],
                    color: 'white',
                    minHeight: '72px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {customHeader ? (
                                customHeader
                            ) : (
                                <>
                                    <User
                                        className="mr-3 text-white"
                                        size={32}
                                    />
                                    <Link 
                                        href={route("dashboard")}
                                        className="text-white hover:text-gray-200 transition-colors"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold">Abacoding</span>
                                            <span className="text-xs opacity-75 -mt-1">program panel</span>
                                        </div>
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Abacus Icon for Mental Arithmetic students */}
                            {isMentalArithmeticStudent && (
                                <button
                                    onClick={() => setShowAbacus(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 text-white text-sm"
                                    title={t('dashboard.open_abacus_simulator')}
                                >
                                    <Calculator size={18} />
                                    <span className="hidden sm:inline">{t('dashboard.abacus')}</span>
                                </button>
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

                            {/* User Dropdown - Fixed with better visibility */}
                            <div className="relative">
                                <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 border-2 border-white border-opacity-30 hover:border-opacity-50 shadow-sm"
                                        >
                                            <div className="text-right">
                                                <p className="text-xs opacity-90">
                                                    {t('dashboard.welcome_back')},
                                                </p>
                                                <p className="font-semibold text-sm text-white">
                                                    {user.name}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center border border-white border-opacity-20">
                                                {avatarData && avatarData.type === 'emoji' ? (
                                                    <span className="text-sm">{avatarData.value}</span>
                                                ) : (
                                                    <User size={16} className="text-white" />
                                                )}
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className="opacity-90 text-white"
                                            />
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route("dashboard")}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {t('nav.dashboard')}
                                    </Dropdown.Link>
                                    {isStudent && (
                                        <Dropdown.Link
                                            href={route("my-schedule")}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {t('nav.my_schedule')}
                                        </Dropdown.Link>
                                    )}
                                    <Dropdown.Link
                                        href={route("profile.edit")}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {t('nav.profile_settings')}
                                    </Dropdown.Link>
                                    
                                    {/* Email Verification Status */}
                                    <div className="px-4 py-2 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">{t('profile.email_status')}:</span>
                                            {user.email_verified_at ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('verification.verified')}
                                                </span>
                                            ) : (
                                                <Link
                                                    href={route("verification.notice")}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full hover:bg-yellow-200"
                                                >
                                                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('verification.verify')}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        {t('nav.log_out')}
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
            
            {/* Floating Abacus Button - Only for Mental Arithmetic students */}
            {isMentalArithmeticStudent && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        onClick={() => setShowAbacus(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300"
                        title={t('dashboard.open_abacus_simulator')}
                        aria-label={t('dashboard.open_abacus_simulator')}
                    >
                        <Calculator size={24} />
                    </button>
                </div>
            )}
            
            {/* Abacus Simulator Modal */}
            <AbacusSimulator 
                isOpen={showAbacus} 
                onClose={() => setShowAbacus(false)} 
            />
        </div>
    );
}
