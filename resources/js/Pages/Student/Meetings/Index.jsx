import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Calendar, Clock, Users, Video, MapPin, CheckCircle, XCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Index({ upcomingMeetings, pastMeetings }) {
    const [respondingTo, setRespondingTo] = useState(null);

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

    const handleConfirm = (participantId) => {
        router.post(route('meetings.confirm', participantId), {}, {
            preserveScroll: true,
            onSuccess: () => setRespondingTo(null),
        });
    };

    const handleDecline = (participantId) => {
        if (confirm('Are you sure you want to decline this meeting?')) {
            router.post(route('meetings.decline', participantId), {}, {
                preserveScroll: true,
                onSuccess: () => setRespondingTo(null),
            });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Confirmed</span>;
            case 'declined':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Declined</span>;
            case 'attended':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Attended</span>;
            case 'missed':
                return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Missed</span>;
            default:
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pending Response</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Meetings" />

            <div className="min-h-screen bg-slate-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-slate-900">My Meetings</h1>
                        <p className="text-lg text-slate-600 mt-1">View and manage your scheduled class meetings</p>
                    </div>

                    {/* Upcoming Meetings */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Upcoming Meetings</h2>
                        {upcomingMeetings.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingMeetings.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-emerald-300 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        item.meeting.meeting_type === 'individual'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                        {item.meeting.meeting_type === 'individual' ? 'Individual' : 'Group'}
                                                    </span>
                                                    {getStatusBadge(item.status)}
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.meeting.title}</h3>
                                                {item.meeting.description && (
                                                    <p className="text-slate-600 mb-4">{item.meeting.description}</p>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                                        <span>{formatDate(item.meeting.scheduled_at)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                                        <Clock className="w-4 h-4 text-emerald-600" />
                                                        <span>{formatTime(item.meeting.scheduled_at)} ({item.meeting.duration_minutes} min)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                                        <User className="w-4 h-4 text-emerald-600" />
                                                        <span>Mentor: {item.meeting.mentor.name}</span>
                                                    </div>
                                                    {item.meeting.meeting_url && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Video className="w-4 h-4 text-emerald-600" />
                                                            <a
                                                                href={item.meeting.meeting_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-emerald-600 hover:underline"
                                                            >
                                                                Join online
                                                            </a>
                                                        </div>
                                                    )}
                                                    {item.meeting.location && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                                            <MapPin className="w-4 h-4 text-emerald-600" />
                                                            <span>{item.meeting.location}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {item.response_note && (
                                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                                        <p className="text-sm text-slate-600">
                                                            <span className="font-semibold">Your note: </span>
                                                            {item.response_note}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action buttons */}
                                            {item.status === 'invited' && (
                                                <div className="flex md:flex-col gap-2">
                                                    <button
                                                        onClick={() => handleConfirm(item.id)}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleDecline(item.id)}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
                                <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600">No upcoming meetings</p>
                            </div>
                        )}
                    </div>

                    {/* Past Meetings */}
                    {pastMeetings.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Past Meetings</h2>
                            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                                <div className="space-y-3">
                                    {pastMeetings.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900">{item.meeting.title}</h4>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                                                    <span>{formatDate(item.meeting.scheduled_at)}</span>
                                                    <span>Mentor: {item.meeting.mentor_name}</span>
                                                    <span className={`px-2 py-0.5 rounded-full ${
                                                        item.meeting.meeting_type === 'individual'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                        {item.meeting.meeting_type === 'individual' ? 'Individual' : 'Group'}
                                                    </span>
                                                </div>
                                            </div>
                                            {getStatusBadge(item.status)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
