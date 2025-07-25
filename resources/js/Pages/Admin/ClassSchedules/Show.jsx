import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    User,
    BookOpen,
    Users,
    Video,
    MapPin,
    AlertCircle,
    Check,
    X,
    Edit,
    ArrowLeft,
    FileText,
    MessageSquare,
} from 'lucide-react';

export default function ShowClassSchedule({ schedule }) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    const { data: cancelData, setData: setCancelData, post: cancelPost, processing: cancelProcessing, errors: cancelErrors } = useForm({
        cancellation_reason: '',
    });

    const { data: completeData, setData: setCompleteData, post: completePost, processing: completeProcessing, errors: completeErrors } = useForm({
        session_notes: '',
        session_data: {},
    });

    const handleCancel = (e) => {
        e.preventDefault();
        cancelPost(route('admin.class-schedules.cancel', schedule.id), {
            onSuccess: () => setShowCancelModal(false),
        });
    };

    const handleComplete = (e) => {
        e.preventDefault();
        completePost(route('admin.class-schedules.complete', schedule.id), {
            onSuccess: () => setShowCompleteModal(false),
        });
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className="w-4 h-4 mr-2" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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

    const getStudentsList = () => {
        if (schedule.is_group_class && schedule.students) {
            return schedule.students;
        } else if (schedule.student) {
            return [schedule.student];
        }
        return [];
    };

    const students = getStudentsList();

    return (
        <AdminLayout>
            <Head title={`Class Schedule - ${schedule.title}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('admin.class-schedules.index')}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{schedule.title}</h1>
                                <p className="mt-1 text-gray-600">Class Schedule Details</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(schedule.status)}
                            {(schedule.status === 'scheduled' || schedule.status === 'confirmed') && (
                                <div className="flex gap-2">
                                    <Link
                                        href={route('admin.class-schedules.edit', schedule.id)}
                                        className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setShowCompleteModal(true)}
                                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Mark Complete
                                    </button>
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Schedule Details */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Date</p>
                                        <p className="text-gray-900">{formatDate(schedule.scheduled_at)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Time & Duration</p>
                                        <p className="text-gray-900">
                                            {formatTime(schedule.scheduled_at)} • {formatDuration(schedule.duration_minutes)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Type</p>
                                        <p className="text-gray-900 capitalize">{schedule.type}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    {schedule.meeting_link ? (
                                        <Video className="w-5 h-5 text-gray-400 mt-0.5" />
                                    ) : (
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Location</p>
                                        {schedule.meeting_link ? (
                                            <a
                                                href={schedule.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Join Online Meeting
                                            </a>
                                        ) : (
                                            <p className="text-gray-900">{schedule.location || 'Not specified'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {schedule.description && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                                            <p className="text-gray-900 whitespace-pre-wrap">{schedule.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Program & Lesson */}
                        {(schedule.program || schedule.lesson) && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Information</h2>
                                
                                <div className="space-y-4">
                                    {schedule.program && (
                                        <div className="flex items-start gap-3">
                                            <BookOpen className="w-5 h-5 text-blue-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Program</p>
                                                <p className="text-gray-900 font-medium">{schedule.program.name}</p>
                                            </div>
                                        </div>
                                    )}

                                    {schedule.lesson && (
                                        <div className="flex items-start gap-3">
                                            <FileText className="w-5 h-5 text-green-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Lesson</p>
                                                <p className="text-gray-900">{schedule.lesson.title}</p>
                                                {schedule.lesson.level && (
                                                    <p className="text-sm text-gray-500">Level {schedule.lesson.level}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Session Notes (if completed) */}
                        {schedule.status === 'completed' && schedule.session_notes && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Notes</h2>
                                <div className="flex items-start gap-3">
                                    <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-900 whitespace-pre-wrap">{schedule.session_notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cancellation Details */}
                        {schedule.status === 'cancelled' && (
                            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                                <h2 className="text-lg font-semibold text-red-900 mb-3">Cancellation Details</h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-red-700">Cancelled by</p>
                                        <p className="text-red-900">{schedule.cancelled_by?.name || 'System'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-red-700">Cancelled at</p>
                                        <p className="text-red-900">
                                            {schedule.cancelled_at ? formatDate(schedule.cancelled_at) + ' at ' + formatTime(schedule.cancelled_at) : 'Not specified'}
                                        </p>
                                    </div>
                                    {schedule.cancellation_reason && (
                                        <div>
                                            <p className="text-sm font-medium text-red-700">Reason</p>
                                            <p className="text-red-900 whitespace-pre-wrap">{schedule.cancellation_reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Instructor */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{schedule.admin.name}</p>
                                    <p className="text-sm text-gray-500">Instructor</p>
                                </div>
                            </div>
                        </div>

                        {/* Students */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {schedule.is_group_class ? (
                                    <span className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Students ({students.length})
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Student
                                    </span>
                                )}
                            </h3>
                            <div className="space-y-3">
                                {students.map((student) => (
                                    <div key={student.id} className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{student.name}</p>
                                            <p className="text-sm text-gray-500">{student.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Class</h3>
                            <form onSubmit={handleCancel}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cancellation Reason *
                                    </label>
                                    <textarea
                                        value={cancelData.cancellation_reason}
                                        onChange={(e) => setCancelData('cancellation_reason', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Please provide a reason for cancellation..."
                                        required
                                    />
                                    {cancelErrors.cancellation_reason && (
                                        <p className="mt-1 text-sm text-red-600">{cancelErrors.cancellation_reason}</p>
                                    )}
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowCancelModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={cancelProcessing}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {cancelProcessing ? 'Cancelling...' : 'Cancel Class'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Mark as Complete</h3>
                            <form onSubmit={handleComplete}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session Notes (Optional)
                                    </label>
                                    <textarea
                                        value={completeData.session_notes}
                                        onChange={(e) => setCompleteData('session_notes', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Add any notes about the completed session..."
                                    />
                                    {completeErrors.session_notes && (
                                        <p className="mt-1 text-sm text-red-600">{completeErrors.session_notes}</p>
                                    )}
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowCompleteModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={completeProcessing}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {completeProcessing ? 'Completing...' : 'Mark Complete'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}