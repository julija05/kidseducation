import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, User, X, Check, BookOpen, ExternalLink, Play } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

export default function StudentNotifications({ notifications = [], unreadCount = 0, nextClass = null, headerMode = false, onMarkAllAsRead }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const { t } = useTranslation();
    
    // Helper function to get translated notification title
    const getTranslatedTitle = (notification) => {
        if (notification.data?.title_key) {
            // Check if the title_key starts with 'notifications.' and convert to dashboard.notifications.
            const translationKey = notification.data.title_key.startsWith('notifications.') 
                ? notification.data.title_key.replace('notifications.', 'dashboard.notifications.')
                : notification.data.title_key;
            return t(translationKey);
        }
        return notification.title;
    };
    
    // Helper function to get translated notification message
    const getTranslatedMessage = (notification) => {
        if (notification.data?.message_key && notification.data?.translation_data) {
            // Check if the message_key starts with 'notifications.' and convert to dashboard.notifications.
            const translationKey = notification.data.message_key.startsWith('notifications.') 
                ? notification.data.message_key.replace('notifications.', 'dashboard.notifications.')
                : notification.data.message_key;
            return t(translationKey, notification.data.translation_data);
        }
        return notification.message;
    };
    
    // Auto-mark all as read when dropdown opens
    useEffect(() => {
        if (showNotifications && unreadCount > 0 && onMarkAllAsRead) {
            // Add a small delay to make the action feel natural
            const timer = setTimeout(() => {
                onMarkAllAsRead();
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [showNotifications, unreadCount, onMarkAllAsRead]);
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const getNotificationColor = (type, action) => {
        if (type === 'lesson') {
            return 'border-l-green-500 bg-green-50';
        }
        
        switch (action) {
            case 'scheduled': return 'border-l-blue-500 bg-blue-50';
            case 'rescheduled': return 'border-l-yellow-500 bg-yellow-50';
            case 'cancelled': return 'border-l-red-500 bg-red-50';
            case 'completed': return 'border-l-green-500 bg-green-50';
            case 'reminder': return 'border-l-purple-500 bg-purple-50';
            default: return 'border-l-gray-500 bg-gray-50';
        }
    };

    const getNotificationIcon = (type, action) => {
        if (type === 'lesson') {
            return <BookOpen className="w-4 h-4 text-green-600" />;
        }
        
        switch (action) {
            case 'scheduled': return <Calendar className="w-4 h-4 text-blue-600" />;
            case 'rescheduled': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'cancelled': return <X className="w-4 h-4 text-red-600" />;
            case 'completed': return <Check className="w-4 h-4 text-green-600" />;
            case 'reminder': return <Bell className="w-4 h-4 text-purple-600" />;
            default: return <Bell className="w-4 h-4 text-gray-600" />;
        }
    };

    const handleNotificationClick = (notification) => {
        setShowNotifications(false);
        
        if (notification.type === 'lesson' && notification.data?.lesson_id) {
            router.visit(route('lessons.show', notification.data.lesson_id));
        } else if (notification.type === 'schedule' && notification.data?.schedule_id) {
            // For schedule notifications, could navigate to a schedule view or show details
        }
    };

    return (
        <div className="relative">
            {/* Learning Card - Next Class Section */}
            {nextClass && (
                <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-blue-900">{t('dashboard.next_class')}</h3>
                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                                    {t('dashboard.upcoming')}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-blue-800 text-lg">{nextClass.title}</h4>
                                    {nextClass.program_name && (
                                        <p className="text-blue-600 text-sm">{t('dashboard.program')}: {nextClass.program_name}</p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center text-blue-700">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span className="text-sm">
                                            {nextClass.day_description} at {nextClass.time_only}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center text-blue-700">
                                        <User className="w-4 h-4 mr-2" />
                                        <span className="text-sm">{t('dashboard.with_teacher', { teacher: nextClass.admin_name })}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center text-blue-600 text-sm">
                                    <span>{t('dashboard.duration')}: {nextClass.duration}</span>
                                </div>
                                
                                {nextClass.meeting_link && (
                                    <div className="pt-2">
                                        <a
                                            href={nextClass.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            {t('dashboard.join_meeting')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 sm:p-3 rounded-full transition-colors touch-manipulation ${
                        headerMode 
                            ? 'text-white hover:text-gray-200 hover:bg-white hover:bg-opacity-20 border border-white/30 shadow-lg backdrop-blur-sm bg-white/10' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white/50">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                    <>
                        {/* Backdrop for closing dropdown */}
                        <div 
                            className="fixed inset-0 bg-transparent" 
                            style={{ zIndex: 99998 }}
                            onClick={() => setShowNotifications(false)}
                        />
                        <div 
                            className="fixed sm:absolute top-16 sm:top-full right-2 sm:right-0 left-2 sm:left-auto sm:mt-2 
                                       min-w-0 sm:min-w-[320px] max-w-none sm:max-w-[400px] w-auto sm:w-[384px]
                                       z-[99999] bg-white backdrop-blur-xl border-2 border-gray-300 
                                       shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),_0_0_0_1px_rgba(0,0,0,0.1)] 
                                       rounded-xl sm:rounded-2xl overflow-hidden min-h-[200px]"
                        >
                        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{t('dashboard.notifications.notifications')}</h3>
                                <div className="flex items-center gap-2 shrink-0">
                                    {unreadCount > 0 && (
                                        <span className="text-xs sm:text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded-full">{unreadCount} {t('dashboard.notifications.unread')}</span>
                                    )}
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-colors touch-manipulation"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-l-4 cursor-pointer touch-manipulation ${getNotificationColor(notification.type, notification.data?.action)} ${
                                                !notification.is_read ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type, notification.data?.action)}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-sm sm:text-base font-medium text-gray-900">
                                                            {getTranslatedTitle(notification)}
                                                            {!notification.is_read && (
                                                                <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    
                                                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                                        {getTranslatedMessage(notification)}
                                                    </p>
                                                    
                                                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {formatDate(notification.created_at)}
                                                    </div>

                                                    {/* Additional data for lesson notifications */}
                                                    {notification.type === 'lesson' && notification.data && (
                                                        <div className="mt-2 space-y-1">
                                                            <div className="text-xs text-gray-500">
                                                                {t('dashboard.program')}: {notification.data.program_name}
                                                            </div>
                                                            {notification.data.next_class && notification.data.next_class.meeting_link && (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <a
                                                                        href={notification.data.next_class.meeting_link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 touch-manipulation"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <ExternalLink className="w-3 h-3" />
                                                                        {t('dashboard.join_class')}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Additional data for schedule notifications */}
                                                    {notification.type === 'schedule' && notification.data && (
                                                        <div className="mt-2 space-y-1">
                                                            {notification.data.program_name && (
                                                                <div className="text-xs text-gray-500">
                                                                    {t('dashboard.program')}: {notification.data.program_name}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-500">
                                                                {t('dashboard.duration')}: {notification.data.duration_minutes} minutes
                                                            </div>
                                                            {notification.data.meeting_link && (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <a
                                                                        href={notification.data.meeting_link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 touch-manipulation"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <ExternalLink className="w-3 h-3" />
                                                                        {t('dashboard.join_meeting')}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 sm:p-8 text-center text-gray-500">
                                    <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-sm sm:text-base">{t('dashboard.notifications.no_notifications')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
}