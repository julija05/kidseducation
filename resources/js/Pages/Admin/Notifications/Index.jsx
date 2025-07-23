import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Bell, Check, Trash2, Clock, Users, AlertCircle, Filter } from "lucide-react";

export default function Index({ notifications, unread_count, current_type }) {
    const [selectedType, setSelectedType] = useState(current_type || 'all');

    const handleTypeFilter = (type) => {
        setSelectedType(type);
        router.get(route('admin.notifications.index'), { type }, {
            preserveState: true,
            replace: true
        });
    };

    const handleMarkAsRead = (notificationId) => {
        router.patch(route('admin.notifications.read', notificationId), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleMarkAllAsRead = () => {
        router.patch(route('admin.notifications.mark-all-read'), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDelete = (notificationId) => {
        if (confirm('Are you sure you want to delete this notification?')) {
            router.delete(route('admin.notifications.destroy', notificationId), {
                preserveScroll: true,
            });
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'enrollment':
                return <Users className="w-5 h-5 text-blue-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getNotificationColor = (type, isRead) => {
        const baseColor = isRead ? 'bg-white' : 'bg-blue-50';
        switch (type) {
            case 'enrollment':
                return `${baseColor} border-l-4 border-l-blue-500`;
            default:
                return `${baseColor} border-l-4 border-l-gray-500`;
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

    const typeFilters = [
        { key: 'all', label: 'All', count: notifications.length },
        { key: 'enrollment', label: 'Enrollments', count: notifications.filter(n => n.type === 'enrollment').length },
    ];

    return (
        <AdminLayout>
            <Head title="Notifications" />
            
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-600 mt-1">
                            {unread_count > 0 ? `${unread_count} unread` : 'All notifications read'}
                        </p>
                    </div>
                    
                    {unread_count > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Mark All as Read
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {typeFilters.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => handleTypeFilter(filter.key)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                    selectedType === filter.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                {filter.label}
                                {filter.count > 0 && (
                                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                                        selectedType === filter.key
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {filter.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-lg shadow">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                            <p>You're all caught up! New notifications will appear here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 hover:bg-gray-50 transition-colors ${getNotificationColor(notification.type, notification.is_read)}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {notification.title}
                                                    {!notification.is_read && (
                                                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                                                    )}
                                                </h3>
                                                
                                                <div className="flex items-center gap-2 ml-4">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(notification.id)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-700 mb-3">
                                                {notification.message}
                                            </p>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {formatTimeAgo(notification.created_at)}
                                                </div>

                                                {/* Additional data for enrollment notifications */}
                                                {notification.type === 'enrollment' && notification.data && (
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Program:</span> {notification.data.program_name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Back to Dashboard */}
                <div className="mt-6">
                    <Link
                        href={route('admin.dashboard')}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}