import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { getCsrfToken } from '@/Utils/helpers';
import {
    Calendar,
    Clock,
    User,
    BookOpen,
    Video,
    MapPin,
    AlertCircle,
    Save,
    ArrowLeft,
} from 'lucide-react';

export default function EditClassSchedule({ 
    schedule, 
    students, 
    admins, 
    programs, 
    lessons 
}) {
    const [availableLessons, setAvailableLessons] = useState(lessons || []);
    const [conflicts, setConflicts] = useState([]);
    const [checkingConflicts, setCheckingConflicts] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        student_id: schedule.student_id || '',
        admin_id: schedule.admin_id || '',
        program_id: schedule.program_id || '',
        lesson_id: schedule.lesson_id || '',
        title: schedule.title || '',
        description: schedule.description || '',
        scheduled_at: formatDateTime(schedule.scheduled_at),
        duration_minutes: schedule.duration_minutes || 60,
        location: schedule.location || '',
        meeting_link: schedule.meeting_link || '',
        type: schedule.type || 'lesson',
    });

    // Load lessons when program changes
    useEffect(() => {
        if (data.program_id) {
            fetch(route('admin.class-schedules.program-lessons', data.program_id))
                .then(response => response.json())
                .then(lessons => setAvailableLessons(lessons))
                .catch(() => setAvailableLessons([]));
        } else {
            setAvailableLessons([]);
        }
    }, [data.program_id]);

    // Check for conflicts when scheduling details change
    useEffect(() => {
        if (data.admin_id && data.scheduled_at && data.duration_minutes) {
            checkConflicts();
        }
    }, [data.admin_id, data.scheduled_at, data.duration_minutes]);

    const checkConflicts = async () => {
        setCheckingConflicts(true);
        try {
            const response = await fetch(route('admin.class-schedules.check-conflicts'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    admin_id: data.admin_id,
                    scheduled_at: data.scheduled_at,
                    duration_minutes: data.duration_minutes,
                    exclude_id: schedule.id, // Exclude current schedule from conflict check
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            setConflicts(result.conflicts || []);
        } catch (error) {
            console.error('Error checking conflicts:', error);
            setConflicts([]);
        }
        setCheckingConflicts(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.class-schedules.update', schedule.id));
    };

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
        return now.toISOString().slice(0, 16);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            scheduled: { color: 'bg-yellow-100 text-yellow-800', text: 'Scheduled' },
            confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
            cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
            completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed' },
        };

        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    return (
        <AdminLayout>
            <Head title={`Edit Class - ${schedule.title}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <button
                                onClick={() => window.history.back()}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Edit Class Schedule</h1>
                                <p className="mt-2 text-gray-600">
                                    Update the details for this scheduled class
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(schedule.status)}
                            <span className="text-sm text-gray-500">
                                ID: {schedule.id}
                            </span>
                        </div>
                    </div>

                    {/* Class Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-blue-800">Student:</span>{' '}
                                <span className="text-blue-700">
                                    {schedule.student ? schedule.student.name : 'No student assigned'}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-blue-800">Original Time:</span>{' '}
                                <span className="text-blue-700">
                                    {new Date(schedule.scheduled_at).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-blue-800">Duration:</span>{' '}
                                <span className="text-blue-700">
                                    {schedule.duration_minutes} minutes
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning for completed/cancelled classes */}
                    {(schedule.status === 'completed' || schedule.status === 'cancelled') && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                                <div>
                                    <p className="font-medium text-yellow-800">
                                        This class is {schedule.status}
                                    </p>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        {schedule.status === 'completed' 
                                            ? 'Completed classes cannot be edited. This form is read-only.'
                                            : 'Cancelled classes cannot be edited. This form is read-only.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Class Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Student Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Student *
                                </label>
                                <select
                                    value={data.student_id}
                                    onChange={(e) => setData('student_id', e.target.value)}
                                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.student_id ? 'border-red-300' : ''
                                    }`}
                                    required
                                    disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                                >
                                    <option value="">Select a student</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} ({student.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.student_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                                )}
                            </div>

                            {/* Instructor Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instructor *
                                </label>
                                <select
                                    value={data.admin_id}
                                    onChange={(e) => setData('admin_id', e.target.value)}
                                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.admin_id ? 'border-red-300' : ''
                                    }`}
                                    required
                                    disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                                >
                                    <option value="">Select an instructor</option>
                                    {admins.map((admin) => (
                                        <option key={admin.id} value={admin.id}>
                                            {admin.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.admin_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.admin_id}</p>
                                )}
                            </div>

                            {/* Class Title */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.title ? 'border-red-300' : ''
                                    }`}
                                    placeholder="e.g., Math Tutoring Session"
                                    required
                                    disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Class Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Type *
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                                >
                                    <option value="lesson">Lesson</option>
                                    <option value="assessment">Assessment</option>
                                    <option value="consultation">Consultation</option>
                                    <option value="review">Review</option>
                                </select>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Duration (minutes) *
                                </label>
                                <select
                                    value={data.duration_minutes}
                                    onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </select>
                            </div>
                        </div>

                        {/* Program and Lesson Selection */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <BookOpen className="w-4 h-4 inline mr-2" />
                                    Program (Optional)
                                </label>
                                <select
                                    value={data.program_id}
                                    onChange={(e) => setData('program_id', e.target.value)}
                                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.program_id ? 'border-red-300' : ''
                                    }`}
                                    disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                                >
                                    <option value="">No specific program</option>
                                    {programs.map((program) => (
                                        <option key={program.id} value={program.id}>
                                            {program.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.program_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>
                                )}
                            </div>

                            {availableLessons.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specific Lesson (Optional)
                                    </label>
                                    <select
                                        value={data.lesson_id}
                                        onChange={(e) => setData('lesson_id', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                                    >
                                        <option value="">No specific lesson</option>
                                        {availableLessons.map((lesson) => (
                                            <option key={lesson.id} value={lesson.id}>
                                                Level {lesson.level}: {lesson.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Additional notes or objectives for this class..."
                                disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                            />
                        </div>
                    </div>

                    {/* Scheduling Details */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Schedule & Location</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date and Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                    min={getMinDateTime()}
                                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.scheduled_at ? 'border-red-300' : ''
                                    }`}
                                    required
                                    disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                                />
                                {errors.scheduled_at && (
                                    <p className="mt-1 text-sm text-red-600">{errors.scheduled_at}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Online, Room 101, or address"
                                    disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                                />
                            </div>

                            {/* Meeting Link */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Video className="w-4 h-4 inline mr-2" />
                                    Meeting Link (for online classes)
                                </label>
                                <input
                                    type="url"
                                    value={data.meeting_link}
                                    onChange={(e) => setData('meeting_link', e.target.value)}
                                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.meeting_link ? 'border-red-300' : ''
                                    }`}
                                    placeholder="https://zoom.us/j/... or https://teams.microsoft.com/..."
                                    disabled={schedule.status === 'completed' || schedule.status === 'cancelled'}
                                />
                                {errors.meeting_link && (
                                    <p className="mt-1 text-sm text-red-600">{errors.meeting_link}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Conflict Warning */}
                    {conflicts.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-start">
                                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 mr-4" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-800 text-lg mb-2">⚠️ Time Conflict Detected!</h3>
                                    <p className="text-red-700 mb-3">
                                        The selected instructor is already busy during this time slot. You cannot schedule overlapping classes.
                                    </p>
                                    <div className="bg-white rounded-md p-4 border border-red-200">
                                        <h4 className="font-medium text-red-800 mb-2">Conflicting Classes:</h4>
                                        <div className="space-y-2">
                                            {conflicts.map((conflict, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-red-100 rounded-md">
                                                    <div>
                                                        <div className="font-medium text-red-900">{conflict.title}</div>
                                                        <div className="text-sm text-red-700">
                                                            {conflict.is_group_class ? `Group class (${conflict.student_count} students)` : `with ${conflict.students}`}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium text-red-900">{conflict.scheduled_at}</div>
                                                        <div className="text-sm text-red-700">{conflict.duration}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-red-700 text-sm mt-3 font-medium">
                                        📅 Please select a different time slot or choose another instructor.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        
                        {schedule.status !== 'completed' && schedule.status !== 'cancelled' && (
                            <button
                                type="submit"
                                disabled={processing || conflicts.length > 0 || checkingConflicts}
                                className={`inline-flex items-center px-6 py-2 rounded-md font-medium ${
                                    processing || conflicts.length > 0 || checkingConflicts
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                                title={conflicts.length > 0 ? 'Cannot update - time conflict detected' : ''}
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : checkingConflicts ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                                        Checking availability...
                                    </>
                                ) : conflicts.length > 0 ? (
                                    <>
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        Cannot Update - Conflict
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Class
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Read-only message */}
                    {(schedule.status === 'completed' || schedule.status === 'cancelled') && (
                        <div className="text-center py-4">
                            <p className="text-gray-500">
                                This class cannot be edited because it is {schedule.status}.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </AdminLayout>
    );
}