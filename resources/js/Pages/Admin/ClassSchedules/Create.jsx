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

export default function CreateClassSchedule({ 
    students, 
    admins, 
    programs, 
    studentEnrollments, 
    selectedStudentId 
}) {
    const [lessons, setLessons] = useState([]);
    const [conflicts, setConflicts] = useState([]);
    const [checkingConflicts, setCheckingConflicts] = useState(false);
    const [isGroupClass, setIsGroupClass] = useState(false);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [adminSchedule, setAdminSchedule] = useState([]);
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        student_id: selectedStudentId || '',
        student_ids: [],
        admin_id: '',
        program_id: '',
        lesson_id: '',
        title: '',
        description: '',
        scheduled_at: '',
        duration_minutes: 60,
        location: '',
        meeting_link: '',
        type: 'lesson',
        is_group_class: false,
        max_students: 5,
    });

    // Load lessons when program changes
    useEffect(() => {
        if (data.program_id) {
            fetch(route('admin.class-schedules.program-lessons', data.program_id), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(lessons => {
                    setLessons(lessons);
                })
                .catch(error => {
                    console.error('Error loading lessons:', error);
                    setLessons([]);
                });
        } else {
            setLessons([]);
        }
    }, [data.program_id]);

    // Check for conflicts when scheduling details change
    useEffect(() => {
        // Temporarily disable conflict checking to debug main form submission
        // if (data.admin_id && data.scheduled_at && data.duration_minutes) {
        //     checkConflicts();
        // }
        if (data.admin_id && data.scheduled_at) {
            loadAdminScheduleForDay();
        }
    }, [data.admin_id, data.scheduled_at, data.duration_minutes]);

    // Load students by program for group classes
    useEffect(() => {
        if (isGroupClass && data.program_id) {
            fetch(route('admin.class-schedules.program-students', data.program_id), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(students => {
                    setAvailableStudents(students);
                })
                .catch(error => {
                    console.error('Error loading students:', error);
                    setAvailableStudents([]);
                });
        } else {
            setAvailableStudents(students);
        }
    }, [isGroupClass, data.program_id, students]);

    const checkConflicts = async () => {
        setCheckingConflicts(true);
        try {
            // Get CSRF token from meta tag or cookies
            const csrfToken = getCsrfToken() || 
                document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
            
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };
            
            // Add CSRF token to headers
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }
            
            const response = await fetch(route('admin.class-schedules.check-conflicts'), {
                method: 'POST',
                headers,
                credentials: 'same-origin', // Include cookies
                body: JSON.stringify({
                    admin_id: data.admin_id,
                    scheduled_at: data.scheduled_at,
                    duration_minutes: data.duration_minutes,
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
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

    const loadAdminScheduleForDay = async () => {
        if (!data.admin_id || !data.scheduled_at) return;
        
        setLoadingSchedule(true);
        try {
            const selectedDate = new Date(data.scheduled_at);
            const dateStr = selectedDate.toISOString().split('T')[0];
            
            const response = await fetch(
                route('admin.class-schedules.index') + `?admin_id=${data.admin_id}&date_filter=custom&date=${dateStr}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    credentials: 'same-origin'
                }
            );
            
            if (response.ok) {
                const result = await response.json();
                setAdminSchedule(result.schedules?.data || []);
            }
        } catch (error) {
            console.error('Error loading admin schedule:', error);
            setAdminSchedule([]);
        }
        setLoadingSchedule(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prepare the form data
        const submitData = { ...data };
        submitData.is_group_class = isGroupClass;
        
        // Clear student_id for group classes or student_ids for individual classes
        if (isGroupClass) {
            submitData.student_id = null;
        } else {
            submitData.student_ids = [];
        }
        
        // Convert empty strings to null for optional fields
        if (submitData.lesson_id === '') {
            submitData.lesson_id = null;
        }
        if (submitData.program_id === '') {
            submitData.program_id = null;
        }
        if (submitData.description === '') {
            submitData.description = null;
        }
        if (submitData.location === '') {
            submitData.location = null;
        }
        if (submitData.meeting_link === '') {
            submitData.meeting_link = null;
        }
        
        // Basic validation check
        if (!submitData.title || !submitData.admin_id || !submitData.scheduled_at) {
            console.error('Missing required fields:', {
                title: submitData.title,
                admin_id: submitData.admin_id,
                scheduled_at: submitData.scheduled_at
            });
            return;
        }
        
        if (!isGroupClass && !submitData.student_id) {
            console.error('Missing student_id for individual class');
            return;
        }
        
        if (isGroupClass && (!submitData.student_ids || submitData.student_ids.length === 0)) {
            console.error('Missing student_ids for group class');
            return;
        }
        
        // Submit the form
        post(route('admin.class-schedules.store'));
    };

    const handleStudentChange = (studentId) => {
        setData('student_id', studentId);
        if (studentId) {
            // Reload with student enrollments
            router.get(route('admin.class-schedules.create'), { student_id: studentId }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleGroupClassToggle = (isGroup) => {
        setIsGroupClass(isGroup);
        setData({
            ...data,
            is_group_class: isGroup,
            student_id: isGroup ? '' : data.student_id,
            student_ids: isGroup ? [] : [],
            program_id: isGroup ? data.program_id : '', // Group classes require program
        });
    };

    const handleStudentSelection = (studentId, isSelected) => {
        const currentIds = data.student_ids || [];
        if (isSelected) {
            if (currentIds.length < 5) {
                setData('student_ids', [...currentIds, studentId]);
            }
        } else {
            setData('student_ids', currentIds.filter(id => id !== studentId));
        }
    };


    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
        return now.toISOString().slice(0, 16);
    };

    return (
        <AdminLayout>
            <Head title="Schedule New Class" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={() => window.history.back()}
                            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Schedule New Class</h1>
                            <p className="mt-2 text-gray-600">
                                Schedule an individual or group class with students
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Class Details</h2>
                        
                        {/* Class Type Toggle */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Class Format
                            </label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="class_format"
                                        checked={!isGroupClass}
                                        onChange={() => handleGroupClassToggle(false)}
                                        className="mr-2"
                                    />
                                    Individual Class (1 student)
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="class_format"
                                        checked={isGroupClass}
                                        onChange={() => handleGroupClassToggle(true)}
                                        className="mr-2"
                                    />
                                    Group Class (2-5 students)
                                </label>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Student Selection */}
                            <div className={isGroupClass ? 'md:col-span-2' : ''}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    {isGroupClass ? 'Students *' : 'Student *'}
                                </label>
                                
                                {!isGroupClass ? (
                                    <select
                                        value={data.student_id}
                                        onChange={(e) => handleStudentChange(e.target.value)}
                                        className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.student_id ? 'border-red-300' : ''
                                        }`}
                                        required
                                    >
                                        <option value="">Select a student</option>
                                        {students.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.name} ({student.email})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div>
                                        {!data.program_id && (
                                            <p className="text-sm text-yellow-600 mb-2">
                                                Please select a program first to see available students
                                            </p>
                                        )}
                                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                                            {availableStudents.length > 0 ? (
                                                availableStudents.map((student) => (
                                                    <label key={student.id} className="flex items-center p-2 hover:bg-gray-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.student_ids.includes(student.id)}
                                                            onChange={(e) => handleStudentSelection(student.id, e.target.checked)}
                                                            disabled={!data.student_ids.includes(student.id) && data.student_ids.length >= 5}
                                                            className="mr-2"
                                                        />
                                                        <span>{student.name} ({student.email})</span>
                                                    </label>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 p-2">
                                                    {data.program_id ? 'No students enrolled in selected program' : 'No students available'}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Selected: {data.student_ids.length}/5 students
                                        </p>
                                    </div>
                                )}
                                
                                {errors.student_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                                )}
                                {errors.student_ids && (
                                    <p className="mt-1 text-sm text-red-600">{errors.student_ids}</p>
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
                                    Program {isGroupClass ? '*' : '(Optional)'}
                                </label>
                                <select
                                    value={data.program_id}
                                    onChange={(e) => setData('program_id', e.target.value)}
                                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.program_id ? 'border-red-300' : ''
                                    }`}
                                    required={isGroupClass}
                                >
                                    <option value="">{isGroupClass ? 'Select a program' : 'No specific program'}</option>
                                    {isGroupClass ? (
                                        programs.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.name}
                                            </option>
                                        ))
                                    ) : (
                                        studentEnrollments.map((enrollment) => (
                                            <option key={enrollment.program.id} value={enrollment.program.id}>
                                                {enrollment.program.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                                {errors.program_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>
                                )}
                            </div>

                            {lessons.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specific Lesson (Optional)
                                    </label>
                                    <select
                                        value={data.lesson_id}
                                        onChange={(e) => setData('lesson_id', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">No specific lesson</option>
                                        {lessons.map((lesson) => (
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
                    
                    {/* Instructor's Daily Schedule */}
                    {data.admin_id && data.scheduled_at && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-800 text-lg mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                Instructor's Schedule for {new Date(data.scheduled_at).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </h3>
                            
                            {loadingSchedule ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                                    <span className="text-blue-700">Loading schedule...</span>
                                </div>
                            ) : adminSchedule.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-blue-700 text-sm mb-3">Existing classes for this day:</p>
                                    {adminSchedule.map((schedule) => {
                                        const scheduleStart = new Date(schedule.scheduled_at);
                                        const scheduleEnd = new Date(scheduleStart.getTime() + schedule.duration_minutes * 60000);
                                        const newStart = new Date(data.scheduled_at);
                                        const newEnd = new Date(newStart.getTime() + data.duration_minutes * 60000);
                                        
                                        const isConflicting = (
                                            (newStart >= scheduleStart && newStart < scheduleEnd) ||
                                            (newEnd > scheduleStart && newEnd <= scheduleEnd) ||
                                            (newStart <= scheduleStart && newEnd >= scheduleEnd)
                                        );
                                        
                                        return (
                                            <div key={schedule.id} className={`p-3 rounded-md border-l-4 ${
                                                isConflicting 
                                                    ? 'bg-red-100 border-red-400 text-red-800'
                                                    : 'bg-white border-blue-400 text-blue-800'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{schedule.title}</div>
                                                        <div className="text-sm opacity-75">
                                                            {schedule.is_group_class && schedule.students 
                                                                ? `Group class (${schedule.students.length} students)`
                                                                : schedule.student 
                                                                    ? `with ${schedule.student.name}`
                                                                    : 'No student assigned'
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            {scheduleStart.toLocaleTimeString('en-US', { 
                                                                hour: 'numeric', 
                                                                minute: '2-digit', 
                                                                hour12: true 
                                                            })} - {scheduleEnd.toLocaleTimeString('en-US', { 
                                                                hour: 'numeric', 
                                                                minute: '2-digit', 
                                                                hour12: true 
                                                            })}
                                                        </div>
                                                        <div className="text-sm opacity-75">
                                                            {schedule.duration_minutes} min
                                                        </div>
                                                    </div>
                                                </div>
                                                {isConflicting && (
                                                    <div className="mt-2 text-sm font-medium text-red-700">
                                                        ⚠️ Conflicts with your new class time!
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Show the new class being scheduled */}
                                    {data.scheduled_at && data.duration_minutes && (
                                        <div className="p-3 rounded-md border-l-4 border-green-400 bg-green-50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-green-800">
                                                        {data.title || 'New Class'} (Planning)
                                                    </div>
                                                    <div className="text-sm text-green-700">
                                                        {isGroupClass 
                                                            ? `Group class (${data.student_ids.length} students selected)`
                                                            : data.student_id 
                                                                ? students.find(s => s.id == data.student_id)?.name || 'Student selected'
                                                                : 'No student selected'
                                                        }
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-green-800">
                                                        {new Date(data.scheduled_at).toLocaleTimeString('en-US', { 
                                                            hour: 'numeric', 
                                                            minute: '2-digit', 
                                                            hour12: true 
                                                        })} - {new Date(new Date(data.scheduled_at).getTime() + data.duration_minutes * 60000).toLocaleTimeString('en-US', { 
                                                            hour: 'numeric', 
                                                            minute: '2-digit', 
                                                            hour12: true 
                                                        })}
                                                    </div>
                                                    <div className="text-sm text-green-700">
                                                        {data.duration_minutes} min
                                                    </div>
                                                </div>
                                            </div>
                                            {conflicts.length === 0 && (
                                                <div className="mt-2 text-sm font-medium text-green-700">
                                                    ✅ No conflicts - Ready to schedule!
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Clock className="w-12 h-12 mx-auto text-blue-400 mb-2" />
                                    <p className="text-blue-700">No classes scheduled for this day</p>
                                    <p className="text-blue-600 text-sm mt-1">This time slot is available!</p>
                                </div>
                            )}
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
                        <button
                            type="submit"
                            disabled={processing || checkingConflicts}
                            className={`inline-flex items-center px-6 py-2 rounded-md font-medium ${
                                processing || checkingConflicts
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Scheduling...
                                </>
                            ) : checkingConflicts ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                                    Checking availability...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Schedule Class
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}