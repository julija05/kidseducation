import { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, Users, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function Notifications({ notifications = [], unreadCount = 0, onMarkAsRead, onMarkAllAsRead }) {
    const [isOpen, setIsOpen] = useState(false);

    // Auto-mark all as read when dropdown opens
    useEffect(() => {
        if (isOpen && unreadCount > 0) {
            // Add a small delay to make the action feel natural
            const timer = setTimeout(() => {
                if (onMarkAllAsRead) {
                    onMarkAllAsRead();
                }
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [isOpen, unreadCount, onMarkAllAsRead]);

    const handleNotificationClick = (notification) => {
        if (notification.type === 'enrollment') {
            // Close the dropdown
            setIsOpen(false);
            // Navigate to pending enrollments with user ID parameter
            const userId = notification.data?.user_id;
            const url = userId 
                ? route('admin.enrollments.pending', { highlight_user: userId })
                : route('admin.enrollments.pending');
            router.visit(url);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'enrollment':
                return <Users className="w-4 h-4 text-blue-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'enrollment':
                return 'border-l-blue-500';
            default:
                return 'border-l-gray-500';
        }
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMs = now - date;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInDays < 7) {
            return `${Math.floor(diffInDays)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
                    {/* Header */}
                    <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 transition-colors border-l-4 cursor-pointer ${getNotificationColor(notification.type)} ${
                                            !notification.is_read ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {notification.title}
                                                        {!notification.is_read && (
                                                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                                                        )}
                                                    </p>
                                                </div>
                                                
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {notification.message}
                                                </p>
                                                
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {formatTimeAgo(notification.created_at)}
                                                </div>

                                                {/* Additional data for enrollment notifications */}
                                                {notification.type === 'enrollment' && notification.data && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Program: {notification.data.program_name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t bg-gray-50 rounded-b-lg">
                            <a
                                href="/admin/notifications"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium block text-center"
                            >
                                View all notifications
                            </a>
                        </div>
                    )}
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}