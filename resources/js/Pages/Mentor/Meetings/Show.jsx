import MentorLayout from "@/Layouts/MentorLayout";
import { Head, router } from "@inertiajs/react";
import { Calendar, Clock, Users, Video, MapPin, ArrowLeft, CheckCircle, XCircle, AlertCircle, Trash2, Edit } from "lucide-react";

export default function Show({ meeting }) {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-700';
            case 'declined':
                return 'bg-red-100 text-red-700';
            case 'attended':
                return 'bg-blue-100 text-blue-700';
            case 'missed':
                return 'bg-orange-100 text-orange-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'declined':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-slate-600" />;
        }
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this meeting? This action cannot be undone.')) {
            router.post(route('mentor.meetings.cancel', meeting.id));
        }
    };

    const handleComplete = () => {
        if (confirm('Mark this meeting as completed?')) {
            router.post(route('mentor.meetings.complete', meeting.id));
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
            router.delete(route('mentor.meetings.destroy', meeting.id));
        }
    };

    return (
        <MentorLayout>
            <Head title={meeting.title} />

            <div className="min-h-screen bg-slate-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.visit(route('mentor.meetings.index'))}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Meetings
                        </button>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 mb-2">{meeting.title}</h1>
                                <p className="text-lg text-slate-600">{meeting.description || 'No description provided'}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                meeting.meeting_type === 'individual' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                                {meeting.meeting_type === 'individual' ? 'Individual' : 'Group'}
                            </span>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Meeting Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Meeting Info Card */}
                            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Meeting Details</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">Date</p>
                                            <p className="text-slate-900">{formatDate(meeting.scheduled_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">Time & Duration</p>
                                            <p className="text-slate-900">{formatTime(meeting.scheduled_at)} ({meeting.duration_minutes} minutes)</p>
                                        </div>
                                    </div>
                                    {meeting.meeting_url && (
                                        <div className="flex items-start gap-3">
                                            <Video className="w-5 h-5 text-emerald-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-700">Online Meeting</p>
                                                <a
                                                    href={meeting.meeting_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-emerald-600 hover:underline break-all"
                                                >
                                                    {meeting.meeting_url}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {meeting.location && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">Location</p>
                                                <p className="text-slate-900">{meeting.location}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Participants Card */}
                            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-slate-900">Participants</h2>
                                    <span className="text-sm text-slate-600">
                                        {meeting.participants.length}/{meeting.max_participants} students
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {meeting.participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                                                {participant.student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-900">{participant.student.name}</p>
                                                <p className="text-sm text-slate-600">{participant.student.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(participant.status)}
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(participant.status)}`}>
                                                    {participant.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes Card */}
                            {meeting.notes && (
                                <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Private Notes</h2>
                                    <p className="text-slate-700 whitespace-pre-wrap">{meeting.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Actions */}
                        <div className="space-y-4">
                            {meeting.status === 'scheduled' && (
                                <>
                                    <button
                                        onClick={handleComplete}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Mark as Completed
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Cancel Meeting
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete Meeting
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MentorLayout>
    );
}
