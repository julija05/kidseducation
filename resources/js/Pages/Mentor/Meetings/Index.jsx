import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link } from "@inertiajs/react";
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
        return type === 'individual' ? 'bg-blue-50 text-blue-700 ring-blue-100' : 'bg-slate-100 text-slate-700 ring-slate-200';
    };

    const getMeetingTypeLabel = (type) => {
        return type === 'individual' ? 'Individual' : 'Group';
    };

    return (
        <MentorLayout>
            <Head title="My Meetings" />

            <div className="-mx-4 -my-6 min-h-screen bg-slate-50 sm:-mx-6 lg:-mx-8">
                <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="mb-2 text-xs font-bold text-blue-600">MENTOR SCHEDULE</p>
                            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">My Meetings</h1>
                            <p className="mt-2 text-sm text-slate-600 sm:text-base">Schedule and manage your class meetings.</p>
                        </div>
                        <Link
                            href={route('mentor.meetings.create')}
                            className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Schedule Meeting
                        </Link>
                    </div>

                    {/* Upcoming Meetings */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-slate-900">Upcoming Meetings</h2>
                        {upcomingMeetings.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {upcomingMeetings.map((meeting, index) => (
                                    <motion.div
                                        key={meeting.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.4)] transition hover:border-blue-200 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getMeetingTypeColor(meeting.meeting_type)}`}>
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
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                <span>{formatDate(meeting.scheduled_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span>{formatTime(meeting.scheduled_at)} ({meeting.duration_minutes} min)</span>
                                            </div>
                                            {meeting.meeting_url && (
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <Video className="h-4 w-4 text-blue-600" />
                                                    <a href={meeting.meeting_url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">
                                                        Join online
                                                    </a>
                                                </div>
                                            )}
                                            {meeting.location && (
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <MapPin className="h-4 w-4 text-blue-600" />
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

                                        <Link
                                            href={route('mentor.meetings.show', meeting.id)}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                                <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600 mb-4">No upcoming meetings scheduled</p>
                                <Link href={route('mentor.meetings.create')} className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                                    Schedule Your First Meeting
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Past Meetings */}
                    {pastMeetings.length > 0 && (
                        <section>
                            <h2 className="mb-4 text-xl font-bold text-slate-900">Past Meetings</h2>
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="space-y-3">
                                    {pastMeetings.map((meeting) => (
                                        <div key={meeting.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900">{meeting.title}</h4>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                                                    <span>{formatDate(meeting.scheduled_at)}</span>
                                                <span className={`rounded-full px-2 py-0.5 ring-1 ${getMeetingTypeColor(meeting.meeting_type)}`}>
                                                        {getMeetingTypeLabel(meeting.meeting_type)}
                                                    </span>
                                                    <span>{meeting.participants_count} participants</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                meeting.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                                {meeting.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </MentorLayout>
    );
}
