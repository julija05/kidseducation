import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    User,
    BookOpen,
    Filter,
    Search,
    Plus,
    Eye,
    Edit,
    X,
    Check,
    AlertCircle,
    Video,
    MapPin,
} from 'lucide-react';

export default function ClassSchedulesIndex({ schedules, admins, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [selectedStatus, setSelectedStatus] = useState(filters.status);
    const [selectedDateFilter, setSelectedDateFilter] = useState(filters.date_filter);
    const [selectedAdmin, setSelectedAdmin] = useState(filters.admin_id);

    const handleFilter = () => {
        router.get(route('admin.class-schedules.index'), {
            search: searchTerm,
            status: selectedStatus,
            date_filter: selectedDateFilter,
            admin_id: selectedAdmin,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedDateFilter('all');
        setSelectedAdmin('all');
        router.get(route('admin.class-schedules.index'));
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            scheduled: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            confirmed: { color: 'bg-green-100 text-green-800', icon: Check },
            cancelled: { color: 'bg-red-100 text-red-800', icon: X },
            completed: { color: 'bg-green-100 text-green-800', icon: Check },
        };

        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) {
            return `${hours}h ${mins}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${mins}m`;
        }
    };

    return (
        <AdminLayout>
            <Head title="Class Schedules" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Class Schedules</h1>
                            <p className="mt-2 text-gray-600">
                                Manage and track scheduled classes with students
                            </p>
                        </div>
                        <Link
                            href={route('admin.class-schedules.create')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Schedule New Class
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>

                        {/* Date Filter */}
                        <select
                            value={selectedDateFilter}
                            onChange={(e) => setSelectedDateFilter(e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="this_week">This Week</option>
                            <option value="upcoming">Upcoming</option>
                        </select>

                        {/* Admin Filter */}
                        <select
                            value={selectedAdmin}
                            onChange={(e) => setSelectedAdmin(e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Instructors</option>
                            {admins.map((admin) => (
                                <option key={admin.id} value={admin.id}>
                                    {admin.name}
                                </option>
                            ))}
                        </select>

                        {/* Filter Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleFilter}
                                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Schedule List */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {schedules.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-lg">No scheduled classes found</p>
                            <p className="text-gray-400 mt-2">
                                {Object.values(filters).some(filter => filter !== 'all' && filter !== '') 
                                    ? 'Try adjusting your filters'
                                    : 'Schedule your first class to get started'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Class Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Instructor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {schedules.data.map((schedule) => (
                                        <tr key={schedule.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {schedule.title}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {formatDuration(schedule.duration_minutes)}
                                                        {schedule.program && (
                                                            <>
                                                                <BookOpen className="w-3 h-3 ml-3 mr-1" />
                                                                {schedule.program.name}
                                                            </>
                                                        )}
                                                    </div>
                                                    {(schedule.location || schedule.meeting_link) && (
                                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                                            {schedule.meeting_link ? (
                                                                <Video className="w-3 h-3 mr-1" />
                                                            ) : (
                                                                <MapPin className="w-3 h-3 mr-1" />
                                                            )}
                                                            {schedule.location || 'Online Meeting'}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                        {schedule.is_group_class ? (
                                                            <User className="h-4 w-4 text-gray-500" />
                                                        ) : (
                                                            <User className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        {schedule.is_group_class && schedule.students ? (
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    Group Class ({schedule.students.length} students)
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {schedule.students.slice(0, 2).map(student => student.name).join(', ')}
                                                                    {schedule.students.length > 2 && ` +${schedule.students.length - 2} more`}
                                                                </div>
                                                            </div>
                                                        ) : schedule.student ? (
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {schedule.student.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {schedule.student.email}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    No student assigned
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Check schedule configuration
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(schedule.scheduled_at)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatTime(schedule.scheduled_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {schedule.admin?.name || 'No instructor assigned'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(schedule.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('admin.class-schedules.show', schedule.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    {(schedule.status === 'scheduled' || schedule.status === 'confirmed') && (
                                                        <Link
                                                            href={route('admin.class-schedules.edit', schedule.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {schedules.links && schedules.links.length > 3 && (
                        <div className="px-6 py-4 bg-gray-50 border-t">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {schedules.from} to {schedules.to} of {schedules.total} results
                                </div>
                                <div className="flex gap-1">
                                    {schedules.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-md ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}