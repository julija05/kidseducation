import MentorLayout from "@/Layouts/MentorLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import { Calendar, Clock, Users, Video, MapPin, ArrowLeft, Save, Search, X, UserPlus, CheckCircle2, FileText } from "lucide-react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Duration options for the meeting
 */
const durationOptions = [
    { value: 15, label: '15 minutes', icon: '⏱️' },
    { value: 30, label: '30 minutes', icon: '⏱️' },
    { value: 45, label: '45 minutes', icon: '⏱️' },
    { value: 60, label: '1 hour', icon: '⏰' },
    { value: 90, label: '1.5 hours', icon: '⏰' },
    { value: 120, label: '2 hours', icon: '⏰' },
];

/**
 * Custom styles for react-select to match our design
 */
const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        borderRadius: '0.75rem',
        borderWidth: '1px',
        borderColor: state.isFocused ? '#2563eb' : '#cbd5e1',
        paddingLeft: '2.25rem',
        paddingTop: '0.45rem',
        paddingBottom: '0.45rem',
        fontSize: '1rem',
        fontWeight: '500',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.15)' : 'none',
        '&:hover': {
            borderColor: '#2563eb',
        },
        cursor: 'pointer',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#2563eb'
            : state.isFocused
            ? '#dbeafe'
            : 'white',
        color: state.isSelected ? 'white' : '#1e293b',
        fontWeight: state.isSelected ? '700' : '600',
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        '&:active': {
            backgroundColor: '#2563eb',
        },
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: '0.75rem',
        overflow: 'hidden',
        marginTop: '0.5rem',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        border: '1px solid #cbd5e1',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#1e293b',
        fontWeight: '600',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#94a3b8',
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: state.isFocused ? '#2563eb' : '#64748b',
        '&:hover': {
            color: '#2563eb',
        },
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
};

/**
 * Create Meeting component for mentors to schedule meetings with students
 * Allows scheduling individual or group meetings with searchable student selection
 */
export default function Create({ students, groups = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        meeting_type: 'individual',
        learning_group_id: '',
        scheduled_at: '',
        duration_minutes: 60,
        meeting_url: '',
        location: '',
        student_ids: [],
        notes: '',
    });

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const dropdownRef = useRef(null);

    /**
     * Close dropdown when clicking outside
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Get selected student objects for display
     */
    const getSelectedStudentObjects = () => {
        return students.filter(s => selectedStudents.includes(s.id));
    };

    /**
     * Filter students based on search term
     */
    const filteredStudents = students.filter(student =>
        !selectedStudents.includes(student.id) && (
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    /**
     * Handle adding a student
     */
    const handleStudentAdd = (studentId) => {
        const maxParticipants = data.meeting_type === 'individual' ? 1 : 5;

        if (selectedStudents.includes(studentId)) {
            return;
        }

        if (selectedStudents.length >= maxParticipants) {
            alert(`You can only select up to ${maxParticipants} student(s) for ${data.meeting_type} meetings.`);
            return;
        }

        const newSelectedStudents = [...selectedStudents, studentId];
        setSelectedStudents(newSelectedStudents);
        setData('student_ids', newSelectedStudents);
        setSearchTerm('');
    };

    /**
     * Handle removing a student
     */
    const handleStudentRemove = (studentId) => {
        const newSelectedStudents = selectedStudents.filter(id => id !== studentId);
        setSelectedStudents(newSelectedStudents);
        setData('student_ids', newSelectedStudents);
    };

    /**
     * Handle meeting type change
     */
    const handleMeetingTypeChange = (type) => {
        setData('meeting_type', type);

        if (type === 'group') {
            setSelectedStudents([]);
            setData('student_ids', []);
        } else {
            setData('learning_group_id', '');
        }
    };

    /**
     * Handle date change from DatePicker
     */
    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (date) {
            // Convert to datetime-local format (YYYY-MM-DDTHH:mm)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
            setData('scheduled_at', formattedDate);
        } else {
            setData('scheduled_at', '');
        }
    };

    /**
     * Handle form submission
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mentor.meetings.store'));
    };

    const selectedGroup = groups.find((group) => String(group.id) === String(data.learning_group_id));
    const maxParticipants = data.meeting_type === 'individual' ? 1 : (selectedGroup?.students_count || 0);
    const selectedStudentObjects = data.meeting_type === 'group'
        ? (selectedGroup?.students || [])
        : getSelectedStudentObjects();
    const hasParticipants = data.meeting_type === 'group'
        ? Boolean(selectedGroup?.students_count)
        : selectedStudents.length === 1;

    return (
        <MentorLayout>
            <Head title="Schedule Meeting" />

            <div className="-mx-4 -my-6 min-h-screen bg-slate-50 sm:-mx-6 lg:-mx-8">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.visit(route('mentor.meetings.index'))}
                            className="group mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Meetings</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Schedule New Meeting</h1>
                                <p className="mt-1 text-sm text-slate-600 sm:text-base">Create a class session with your students.</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12">
                        {/* Meeting Type Section */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-12">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Users className="h-4 w-4" />
                                </span>
                                <h2 className="text-lg font-bold text-slate-900">Meeting Type</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => handleMeetingTypeChange('individual')}
                                    className={`relative rounded-xl border p-4 text-left transition ${
                                        data.meeting_type === 'individual'
                                            ? 'border-blue-500 bg-sky-50 text-blue-900 shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {data.meeting_type === 'individual' && (
                                        <div className="absolute right-3 top-3">
                                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                    )}
                                    <div className="mb-1 flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        <span className="font-bold">Individual</span>
                                    </div>
                                    <p className={`pl-7 text-sm ${
                                        data.meeting_type === 'individual' ? 'text-blue-700' : 'text-slate-600'
                                    }`}>
                                        One-on-one meeting
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMeetingTypeChange('group')}
                                    className={`relative rounded-xl border p-4 text-left transition ${
                                        data.meeting_type === 'group'
                                            ? 'border-blue-500 bg-sky-50 text-blue-900 shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {data.meeting_type === 'group' && (
                                        <div className="absolute right-3 top-3">
                                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                    )}
                                    <div className="mb-1 flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        <span className="font-bold">Group</span>
                                    </div>
                                    <p className={`pl-7 text-sm ${
                                        data.meeting_type === 'group' ? 'text-blue-700' : 'text-slate-600'
                                    }`}>
                                        Your complete learning group
                                    </p>
                                </button>
                            </div>
                            {errors.meeting_type && <p className="text-red-700 text-sm mt-3 font-semibold">{errors.meeting_type}</p>}
                        </div>

                        {/* Meeting Details Section */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-7">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Calendar className="h-4 w-4" />
                                </span>
                                <h2 className="text-lg font-bold text-slate-900">Meeting Details</h2>
                            </div>

                            {/* Title */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Meeting Title <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., Math Review Session"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                                    required
                                />
                                {errors.title && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="What will you cover in this meeting?"
                                    rows="3"
                                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                                />
                                {errors.description && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.description}</p>}
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Date & Time <span className="text-red-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={handleDateChange}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            minDate={new Date()}
                                            popperPlacement="bottom-start"
                                            placeholderText="Select date and time"
                                            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-base text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                                            required
                                            calendarClassName="modern-datepicker !inline-flex !items-stretch !border-slate-200 !font-sans [&_.react-datepicker__header]:!bg-blue-600 [&_.react-datepicker__header]:!bg-none [&_.react-datepicker__month-container]:!float-none [&_.react-datepicker__month]:!m-2 [&_.react-datepicker__day]:!m-1 [&_.react-datepicker__day:hover]:!scale-100 [&_.react-datepicker__day:hover]:!bg-blue-50 [&_.react-datepicker__day:hover]:!text-blue-700 [&_.react-datepicker__day--selected]:!bg-blue-600 [&_.react-datepicker__day--selected]:!bg-none [&_.react-datepicker__day--keyboard-selected]:!bg-blue-600 [&_.react-datepicker__day--keyboard-selected]:!bg-none [&_.react-datepicker__day--today]:!border-blue-600 [&_.react-datepicker__day--today]:!bg-blue-50 [&_.react-datepicker__day--today]:!text-blue-700 [&_.react-datepicker__time-container]:!float-none [&_.react-datepicker__time-container]:!w-28 [&_.react-datepicker__time-list]:!h-[248px] [&_.react-datepicker__time-list-item:hover]:!bg-blue-50 [&_.react-datepicker__time-list-item:hover]:!text-blue-700 [&_.react-datepicker__time-list-item--selected]:!bg-blue-600 [&_.react-datepicker__time-list-item--selected]:!bg-none"
                                            popperClassName="datepicker-popper"
                                        />
                                    </div>
                                    {errors.scheduled_at && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.scheduled_at}</p>}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Duration <span className="text-red-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <Clock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                                        <Select
                                            options={durationOptions}
                                            value={durationOptions.find(option => option.value === data.duration_minutes)}
                                            onChange={(selectedOption) => setData('duration_minutes', selectedOption.value)}
                                            styles={customSelectStyles}
                                            placeholder="Select duration"
                                            isSearchable={false}
                                            required
                                        />
                                    </div>
                                    {errors.duration_minutes && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.duration_minutes}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-5">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <MapPin className="h-4 w-4" />
                                </span>
                                <h2 className="text-lg font-bold text-slate-900">Location Details</h2>
                            </div>

                            {/* Meeting URL */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Online Meeting URL <span className="text-slate-500 text-sm font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <Video className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="url"
                                        value={data.meeting_url}
                                        onChange={(e) => setData('meeting_url', e.target.value)}
                                        placeholder="https://zoom.us/j/..."
                                        className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-base text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                                    />
                                </div>
                                {errors.meeting_url && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.meeting_url}</p>}
                            </div>

                            {/* Physical Location */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Physical Location <span className="text-slate-500 text-sm font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="e.g., Classroom 101"
                                        className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-base text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                                    />
                                </div>
                                {errors.location && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.location}</p>}
                            </div>

                            <div className="my-6 border-t border-slate-100" />

                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <FileText className="h-4 w-4" />
                                </span>
                                <h2 className="text-lg font-bold text-slate-900">Private Notes</h2>
                            </div>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Any additional notes for yourself..."
                                rows="4"
                                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                            />
                            {errors.notes && <p className="mt-2 text-sm font-semibold text-red-700">{errors.notes}</p>}
                        </div>

                        {/* Participants Selection Section */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-12">
                            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <UserPlus className="h-4 w-4" />
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {data.meeting_type === 'group' ? 'Select Learning Group' : 'Select Student'} <span className="text-red-600">*</span>
                                    </h2>
                                </div>
                                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
                                    {selectedStudentObjects.length}/{maxParticipants || 1} selected
                                </span>
                            </div>

                            {data.meeting_type === 'group' && (
                                <div className="mb-6">
                                    {groups.length > 0 ? (
                                        <>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Active group
                                            </label>
                                            <select
                                                value={data.learning_group_id}
                                                onChange={(event) => setData('learning_group_id', event.target.value)}
                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                                                required
                                            >
                                                <option value="">Choose a group...</option>
                                                {groups.map((group) => (
                                                    <option key={group.id} value={group.id}>
                                                        {group.name} · {group.program_name || 'Program'} · {group.students_count} students
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                            <Users className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                                            <p className="text-slate-700 font-semibold">No active groups with students</p>
                                            <p className="text-slate-600 text-sm mt-1">Create a group and add students before scheduling its meeting.</p>
                                        </div>
                                    )}
                                    {errors.learning_group_id && <p className="text-red-700 text-sm mt-3 font-semibold">{errors.learning_group_id}</p>}
                                </div>
                            )}

                            {/* Selected Students as Chips */}
                            {selectedStudentObjects.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-slate-700 mb-3">Selected:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStudentObjects.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-blue-800"
                                            >
                                                <span className="font-semibold text-sm">{student.name}</span>
                                                {data.meeting_type === 'individual' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStudentRemove(student.id)}
                                                        className="rounded-full p-1 transition-colors hover:bg-slate-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Search Input */}
                            {data.meeting_type === 'individual' && (students.length > 0 ? (
                                <div ref={dropdownRef} className="relative">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Search and add students:
                                    </label>
                                    <div className="relative">
                                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setShowDropdown(true);
                                            }}
                                            onFocus={() => setShowDropdown(true)}
                                            placeholder="Search by name or email..."
                                            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-base text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                                            disabled={selectedStudents.length >= maxParticipants}
                                        />
                                    </div>

                                    {/* Dropdown with filtered students */}
                                    {showDropdown && searchTerm && filteredStudents.length > 0 && (
                                        <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                                            {filteredStudents.map((student) => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    onClick={() => handleStudentAdd(student.id)}
                                                    className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50"
                                                >
                                                    <UserPlus className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-900 truncate">{student.name}</p>
                                                        <p className="text-sm text-slate-600 truncate">{student.email}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* No results message */}
                                    {showDropdown && searchTerm && filteredStudents.length === 0 && (
                                        <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xl">
                                            <p className="text-slate-600">No students found matching "{searchTerm}"</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                                    <p className="text-slate-700 font-semibold text-base">No students available</p>
                                    <p className="text-slate-600 text-sm mt-1">Students must enroll through your invitation link first.</p>
                                </div>
                            ))}
                            {errors.student_ids && <p className="text-red-700 text-sm mt-3 font-semibold">{errors.student_ids}</p>}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-end lg:col-span-12">
                            <button
                                type="submit"
                                disabled={processing || !hasParticipants}
                                className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-52"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Scheduling...' : 'Schedule Meeting'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.visit(route('mentor.meetings.index'))}
                                className="rounded-xl border border-slate-300 !bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:!bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MentorLayout>
    );
}
