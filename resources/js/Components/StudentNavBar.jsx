import React from 'react';
import { router, Link } from '@inertiajs/react';
import { User, BookOpen, Calendar, Settings } from 'lucide-react';
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
 */
export default function StudentNavBar({ 
    panelType = 'dashboard',
    title,
    subtitle,
    program,
    icon: CustomIcon,
    onClick
}) {
    const { t } = useTranslation();
    
    // Default click handler - redirect to dashboard
    const handleClick = onClick || (() => router.visit(route("dashboard")));
    
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
            <motion.div 
                className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 mr-2 sm:mr-4 border border-white/30 shadow-lg shrink-0"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
            >
                <IconComponent
                    className="text-white"
                    size={24}
                />
            </motion.div>
            <Link 
                href={route("dashboard")}
                className="text-white hover:text-gray-200 transition-colors group min-w-0 flex-1"
            >
                <motion.div 
                    className="flex flex-col min-w-0"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent group-hover:from-white/90 group-hover:to-white truncate">
                        {displayTitle}
                    </span>
                    <span className="text-xs -mt-1 bg-gray-900/90 text-white backdrop-blur-sm rounded-full px-2 py-0.5 border border-gray-700/50 shadow-sm max-w-fit">
                        {displaySubtitle}
                    </span>
                </motion.div>
            </Link>
        </>
    );
}