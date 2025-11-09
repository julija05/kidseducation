import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Calendar, Clock, Users, Video, MapPin, CheckCircle, XCircle, Plus, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function Index({ upcomingMeetings, pastMeetings }) {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMeetingTypeColor = (type) => {
        return type === 'individual' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
    };

    const getMeetingTypeLabel = (type) => {
        return type === 'individual' ? 'Individual' : 'Group';
    };

    return (
        <MentorLayout>
            <Head title="My Meetings" />

            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900">My Meetings</h1>
                            <p className="text-lg text-slate-600 mt-1">Schedule and manage your class meetings</p>
                        </div>
                        <Link href={route('mentor.meetings.create')}>
                            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                                <Plus className="w-5 h-5" />
                                Schedule Meeting
                            </button>
                        </Link>
                    </div>

                    {/* Upcoming Meetings */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Upcoming Meetings</h2>
                        {upcomingMeetings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {upcomingMeetings.map((meeting, index) => (
                                    <motion.div
                                        key={meeting.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-emerald-300 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMeetingTypeColor(meeting.meeting_type)}`}>
                                                        {getMeetingTypeLabel(meeting.meeting_type)}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {meeting.participants_count}/{meeting.max_participants} participants
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-1">{meeting.title}</h3>
                                                {meeting.description && (
                                                    <p className="text-sm text-slate-600 line-clamp-2">{meeting.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <Calendar className="w-4 h-4 text-emerald-600" />
                                                <span>{formatDate(meeting.scheduled_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <Clock className="w-4 h-4 text-emerald-600" />
                                                <span>{formatTime(meeting.scheduled_at)} ({meeting.duration_minutes} min)</span>
                                            </div>
                                            {meeting.meeting_url && (
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <Video className="w-4 h-4 text-emerald-600" />
                                                    <a href={meeting.meeting_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                                                        Join online
                                                    </a>
                                                </div>
                                            )}
                                            {meeting.location && (
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                                    <span>{meeting.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Students */}
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4 text-slate-600" />
                                                <span className="text-sm font-semibold text-slate-700">Students:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {meeting.students.map((student) => (
                                                    <div key={student.id} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs">
                                                        <span>{student.name}</span>
                                                        {student.status === 'confirmed' && <CheckCircle className="w-3 h-3 text-green-600" />}
                                                        {student.status === 'declined' && <XCircle className="w-3 h-3 text-red-600" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Link href={route('mentor.meetings.show', meeting.id)}>
                                            <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all">
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
                                <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600 mb-4">No upcoming meetings scheduled</p>
                                <Link href={route('mentor.meetings.create')}>
                                    <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all">
                                        Schedule Your First Meeting
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Past Meetings */}
                    {pastMeetings.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Past Meetings</h2>
                            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                                <div className="space-y-3">
                                    {pastMeetings.map((meeting) => (
                                        <div key={meeting.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900">{meeting.title}</h4>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                                                    <span>{formatDate(meeting.scheduled_at)}</span>
                                                    <span className={`px-2 py-0.5 rounded-full ${getMeetingTypeColor(meeting.meeting_type)}`}>
                                                        {getMeetingTypeLabel(meeting.meeting_type)}
                                                    </span>
                                                    <span>{meeting.participants_count} participants</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                meeting.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {meeting.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MentorLayout>
    );
}
