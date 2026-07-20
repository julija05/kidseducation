import React from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { User, BookOpen, Calendar, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Unified navigation bar for student panels
 * 
 * @param {Object} props
 * @param {string} props.panelType - Type of panel: 'dashboard', 'lesson', 'schedule', 'profile'
 * @param {string} props.title - Main title (e.g., program name, "Learning Session", "Abacoding")
 * @param {string} props.subtitle - Subtitle (e.g., "program panel", "lesson mode", "schedule panel")
 * @param {Object} props.program - Program object with name/translated_name
 * @param {React.Component} props.icon - Custom icon component (optional)
 * @param {function} props.onClick - Custom click handler (optional, defaults to dashboard redirect)
 * @param {boolean} props.showBackButton - Render a back button before the panel icon (optional)
 */
export default function StudentNavBar({
    panelType = 'dashboard',
    title,
    subtitle,
    program,
    icon: CustomIcon,
    onClick,
    showBackButton = false
}) {
    const { t } = useTranslation();
    const page = usePage();
    const { auth } = page.props;
    
    // Helper function to get the correct dashboard route based on user role
    const getDashboardRoute = () => {
        if (!auth?.user) return "dashboard";
        
        // Check if user has admin role - roles is an array of strings
        const hasAdminRole = auth.user.roles?.includes('admin');
        if (hasAdminRole) {
            return "admin.dashboard";
        }
        
        // Default to student dashboard
        return "dashboard";
    };
    
    // Default click handler - redirect to appropriate dashboard
    const handleClick = onClick || (() => router.visit(route(getDashboardRoute())));
    
    // Determine the icon based on panel type
    const getIcon = () => {
        if (CustomIcon) return CustomIcon;
        
        switch (panelType) {
            case 'lesson':
                return BookOpen;
            case 'schedule':
                return Calendar;
            case 'profile':
                return Settings;
            case 'dashboard':
            default:
                return User;
        }
    };
    
    // Determine the title based on panel type and props
    const getTitle = () => {
        if (title) return title;
        
        switch (panelType) {
            case 'lesson':
                return 'Learning Session';
            case 'schedule':
                return 'Abacoding';
            case 'profile':
                return 'Abacoding';
            case 'dashboard':
            default:
                return program?.translated_name || program?.name || 'Abacoding';
        }
    };
    
    // Determine the subtitle based on panel type and props
    const getSubtitle = () => {
        if (subtitle) return subtitle;
        
        switch (panelType) {
            case 'lesson':
                return program?.translated_name || program?.name || 'lesson mode';
            case 'schedule':
                return t('nav.schedule_panel', { fallback: 'schedule panel' });
            case 'profile':
                return t('nav.profile_panel', { fallback: 'profile panel' });
            case 'dashboard':
            default:
                return t('nav.program_panel', { fallback: 'program panel' });
        }
    };
    
    const IconComponent = getIcon();
    const displayTitle = getTitle();
    const displaySubtitle = getSubtitle();
    
    // Modern animated layout with beautiful animations
    return (
        <>
            {showBackButton && (
                <Link
                    href={route(getDashboardRoute())}
                    aria-label={t('nav.dashboard', { fallback: 'Back' })}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-aba-line bg-aba-surface-alt text-aba-ink-soft transition hover:text-aba-ink mr-2 sm:mr-3"
                >
                    <ArrowLeft size={16} />
                </Link>
            )}
            <motion.div
                className="bg-gradient-to-b from-aba-blue to-[#2E6FE0] rounded-aba-sm p-2 sm:p-2.5 mr-2 sm:mr-3 shadow-aba-sm shrink-0"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
            >
                <IconComponent
                    className="text-white"
                    size={22}
                />
            </motion.div>
            <Link
                href={route(getDashboardRoute())}
                className="transition-colors group min-w-0 flex-1"
            >
                <motion.div
                    className="flex flex-col min-w-0 sm:flex-row sm:items-center sm:gap-2.5"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="font-display text-lg sm:text-xl font-black text-aba-ink truncate">
                        {displayTitle}
                    </span>
                    <span className="text-[11px] font-black bg-aba-ink text-white rounded-full px-2.5 py-1 max-w-fit truncate">
                        {displaySubtitle}
                    </span>
                </motion.div>
            </Link>
        </>
    );
}