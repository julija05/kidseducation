import MentorLayout from "@/Layouts/MentorLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import { Calendar, Clock, Users, Video, MapPin, ArrowLeft, Save, Search, X, UserPlus, CheckCircle2 } from "lucide-react";
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
        borderWidth: '2px',
        borderColor: state.isFocused ? '#10b981' : '#cbd5e1',
        paddingLeft: '2.25rem',
        paddingTop: '0.45rem',
        paddingBottom: '0.45rem',
        fontSize: '1rem',
        fontWeight: '500',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none',
        '&:hover': {
            borderColor: '#10b981',
        },
        cursor: 'pointer',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#10b981'
            : state.isFocused
            ? '#d1fae5'
            : 'white',
        color: state.isSelected ? 'white' : '#1e293b',
        fontWeight: state.isSelected ? '700' : '600',
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        '&:active': {
            backgroundColor: '#10b981',
        },
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: '0.75rem',
        overflow: 'hidden',
        marginTop: '0.5rem',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        border: '2px solid #cbd5e1',
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
        color: state.isFocused ? '#10b981' : '#64748b',
        '&:hover': {
            color: '#10b981',
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
export default function Create({ students }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        meeting_type: 'individual',
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

        if (type === 'individual' && selectedStudents.length > 1) {
            const newSelected = [selectedStudents[0]];
            setSelectedStudents(newSelected);
            setData('student_ids', newSelected);
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

    const maxParticipants = data.meeting_type === 'individual' ? 1 : 5;
    const selectedStudentObjects = getSelectedStudentObjects();

    return (
        <MentorLayout>
            <Head title="Schedule Meeting" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-10">
                        <button
                            onClick={() => router.visit(route('mentor.meetings.index'))}
                            className="group flex items-center gap-2 text-slate-700 hover:text-emerald-700 mb-6 transition-all font-semibold"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Meetings</span>
                        </button>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-emerald-100 rounded-2xl">
                                <Calendar className="w-8 h-8 text-emerald-700" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900">Schedule New Meeting</h1>
                                <p className="text-lg text-slate-600 mt-1">Create a class session with your students</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Meeting Type Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Users className="w-6 h-6 text-emerald-600" />
                                Meeting Type
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleMeetingTypeChange('individual')}
                                    className={`relative p-6 rounded-xl border-2 font-bold transition-all ${
                                        data.meeting_type === 'individual'
                                            ? 'border-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-950 shadow-lg'
                                            : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md'
                                    }`}
                                >
                                    {data.meeting_type === 'individual' && (
                                        <div className="absolute top-3 right-3">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Users className="w-7 h-7" />
                                        <span className="text-xl">Individual</span>
                                    </div>
                                    <p className={`text-base font-semibold ${
                                        data.meeting_type === 'individual' ? 'text-emerald-800' : 'text-slate-600'
                                    }`}>
                                        One-on-one meeting
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMeetingTypeChange('group')}
                                    className={`relative p-6 rounded-xl border-2 font-bold transition-all ${
                                        data.meeting_type === 'group'
                                            ? 'border-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-950 shadow-lg'
                                            : 'border-slate-300 bg-white text-slate-900 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md'
                                    }`}
                                >
                                    {data.meeting_type === 'group' && (
                                        <div className="absolute top-3 right-3">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Users className="w-7 h-7" />
                                        <span className="text-xl">Group</span>
                                    </div>
                                    <p className={`text-base font-semibold ${
                                        data.meeting_type === 'group' ? 'text-emerald-800' : 'text-slate-600'
                                    }`}>
                                        Up to 5 students
                                    </p>
                                </button>
                            </div>
                            {errors.meeting_type && <p className="text-red-700 text-sm mt-3 font-semibold">{errors.meeting_type}</p>}
                        </div>

                        {/* Meeting Details Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-emerald-600" />
                                Meeting Details
                            </h2>

                            {/* Title */}
                            <div className="mb-6">
                                <label className="block text-base font-bold text-slate-900 mb-2">
                                    Meeting Title <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., Math Review Session"
                                    className="w-full px-4 py-3 text-base text-slate-900 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all placeholder:text-slate-400"
                                    required
                                />
                                {errors.title && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <label className="block text-base font-bold text-slate-900 mb-2">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="What will you cover in this meeting?"
                                    rows="4"
                                    className="w-full px-4 py-3 text-base text-slate-900 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all placeholder:text-slate-400 resize-none"
                                />
                                {errors.description && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.description}</p>}
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-base font-bold text-slate-900 mb-2">
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
                                            placeholderText="Select date and time"
                                            className="w-full pl-11 pr-4 py-3 text-base text-slate-900 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                                            required
                                            calendarClassName="modern-datepicker"
                                            popperClassName="datepicker-popper"
                                        />
                                    </div>
                                    {errors.scheduled_at && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.scheduled_at}</p>}
                                </div>
                                <div>
                                    <label className="block text-base font-bold text-slate-900 mb-2">
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
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-emerald-600" />
                                Location Details
                            </h2>

                            {/* Meeting URL */}
                            <div className="mb-6">
                                <label className="block text-base font-bold text-slate-900 mb-2">
                                    Online Meeting URL <span className="text-slate-500 text-sm font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <Video className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="url"
                                        value={data.meeting_url}
                                        onChange={(e) => setData('meeting_url', e.target.value)}
                                        placeholder="https://zoom.us/j/..."
                                        className="w-full pl-11 pr-4 py-3 text-base text-slate-900 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                                {errors.meeting_url && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.meeting_url}</p>}
                            </div>

                            {/* Physical Location */}
                            <div>
                                <label className="block text-base font-bold text-slate-900 mb-2">
                                    Physical Location <span className="text-slate-500 text-sm font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="e.g., Classroom 101"
                                        className="w-full pl-11 pr-4 py-3 text-base text-slate-900 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                                {errors.location && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.location}</p>}
                            </div>
                        </div>

                        {/* Students Selection Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <UserPlus className="w-6 h-6 text-emerald-600" />
                                    Select Students <span className="text-red-600">*</span>
                                </h2>
                                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-full">
                                    {selectedStudents.length}/{maxParticipants} selected
                                </span>
                            </div>

                            {/* Selected Students as Chips */}
                            {selectedStudentObjects.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-slate-700 mb-3">Selected:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStudentObjects.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-900 rounded-full border-2 border-emerald-300"
                                            >
                                                <span className="font-semibold text-sm">{student.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStudentRemove(student.id)}
                                                    className="hover:bg-emerald-200 rounded-full p-1 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Search Input */}
                            {students.length > 0 ? (
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
                                            className="w-full pl-11 pr-4 py-3 text-base text-slate-900 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all placeholder:text-slate-400"
                                            disabled={selectedStudents.length >= maxParticipants}
                                        />
                                    </div>

                                    {/* Dropdown with filtered students */}
                                    {showDropdown && searchTerm && filteredStudents.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-300 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                                            {filteredStudents.map((student) => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    onClick={() => handleStudentAdd(student.id)}
                                                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center gap-3"
                                                >
                                                    <UserPlus className="w-5 h-5 text-emerald-600 flex-shrink-0" />
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
                                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-300 rounded-xl shadow-xl p-4 text-center">
                                            <p className="text-slate-600">No students found matching "{searchTerm}"</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                                    <p className="text-slate-700 font-semibold text-base">No students available</p>
                                    <p className="text-slate-600 text-sm mt-1">Students must enroll through your invitation link first.</p>
                                </div>
                            )}
                            {errors.student_ids && <p className="text-red-700 text-sm mt-3 font-semibold">{errors.student_ids}</p>}
                        </div>

                        {/* Notes Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Private Notes</h2>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Any additional notes for yourself..."
                                rows="4"
                                className="w-full px-4 py-3 text-base text-slate-900 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all placeholder:text-slate-400 resize-none"
                            />
                            {errors.notes && <p className="text-red-700 text-sm mt-2 font-semibold">{errors.notes}</p>}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <button
                                type="submit"
                                disabled={processing || selectedStudents.length === 0}
                                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                            >
                                <Save className="w-6 h-6" />
                                {processing ? 'Scheduling...' : 'Schedule Meeting'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.visit(route('mentor.meetings.index'))}
                                className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-lg transition-all"
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
