import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Calendar, Clock, User, ExternalLink, MapPin, Users, BookOpen, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function MySchedule({ schedules, upcoming_count, total_count }) {
    const { t } = useTranslation();

    // Create branded navigation theme similar to lessons
    const scheduleTheme = {
        name: "Abacoding",
        color: "bg-gradient-to-r from-blue-600 to-indigo-600",
        lightColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
        borderColor: "border-blue-300",
        textColor: "text-blue-700",
        icon: "Calendar"
    };

    const customHeader = (
        <>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <Calendar className="text-white" size={24} />
            </div>
            <button
                onClick={() => router.visit(route("dashboard"))}
                className="flex flex-col text-left hover:opacity-80 transition-opacity"
            >
                <span className="text-2xl font-bold">Abacoding</span>
                <span className="text-xs opacity-75 -mt-1">schedule panel</span>
            </button>
        </>
    );
    const getStatusIcon = (status) => {
        switch (status) {
            case 'scheduled':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'confirmed':
                return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'scheduled':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        
        if (date.toDateString() === now.toDateString()) {
            return t('time.today');
        } else if (date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()) {
            return t('time.tomorrow');
        } else if (date.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
            return t('time.yesterday');
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const ScheduleCard = ({ schedule }) => (
        <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow duration-200 ${
            schedule.status === 'cancelled' ? 'opacity-75' : ''
        }`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{schedule.title}</h3>
                            {schedule.is_group_class && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                    <Users className="w-3 h-3" />
                                    {t('schedule.group')} ({schedule.student_count})
                                </span>
                            )}
                        </div>
                        {schedule.description && (
                            <p className="text-sm text-gray-600 mb-3">{schedule.description}</p>
                        )}
                    </div>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(schedule.status)}`}>
                        {getStatusIcon(schedule.status)}
                        {t(`schedule.status.${schedule.status}`)}
                    </div>
                </div>

                {/* Schedule Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-700">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm">
                            {formatDate(schedule.scheduled_at)} at {new Date(schedule.scheduled_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            })}
                        </span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-sm">{schedule.duration}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                        <User className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="text-sm">{t('schedule.with_teacher', { teacher: schedule.admin.name })}</span>
                    </div>
                    
                    {schedule.type_label && (
                        <div className="flex items-center text-gray-700">
                            <BookOpen className="w-4 h-4 mr-2 text-orange-500" />
                            <span className="text-sm">{schedule.type_label}</span>
                        </div>
                    )}
                </div>

                {/* Program & Lesson Info */}
                {(schedule.program || schedule.lesson) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        {schedule.program && (
                            <div className="mb-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t('schedule.program')}</span>
                                <p className="text-sm font-medium text-gray-900">{schedule.program.name}</p>
                            </div>
                        )}
                        {schedule.lesson && (
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t('schedule.lesson')}</span>
                                <p className="text-sm font-medium text-gray-900">
                                    {schedule.lesson.title}
                                    {schedule.lesson.level && (
                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                            {t('schedule.level', { level: schedule.lesson.level })}
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Location/Meeting Link */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {schedule.location && (
                        <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="text-sm">{schedule.location}</span>
                        </div>
                    )}
                    
                    {schedule.meeting_link && schedule.status !== 'cancelled' && (
                        <a
                            href={schedule.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            {t('schedule.join_meeting')}
                        </a>
                    )}
                </div>

                {/* Cancellation Reason */}
                {schedule.status === 'cancelled' && schedule.cancellation_reason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                            <strong>{t('schedule.cancellation_reason')}</strong> {schedule.cancellation_reason}
                        </p>
                    </div>
                )}

                {/* Session Notes */}
                {schedule.status === 'completed' && schedule.session_notes && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            <strong>{t('schedule.session_notes')}</strong> {schedule.session_notes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const ScheduleSection = ({ title, schedules, emptyMessage }) => (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {title}
                <span className="text-sm font-normal text-gray-500">({schedules.length})</span>
            </h2>
            
            {schedules.length > 0 ? (
                <div className="grid gap-4">
                    {schedules.map((schedule) => (
                        <ScheduleCard key={schedule.id} schedule={schedule} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">{emptyMessage}</p>
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout 
            programConfig={scheduleTheme}
            customHeader={customHeader}
        >
            <Head title={t('schedule.my_schedule')} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('schedule.my_schedule')}</h1>
                    <p className="text-gray-600">
                        {t('schedule.page_description', { count: upcoming_count })}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-blue-600">{t('schedule.upcoming_classes')}</p>
                                <p className="text-2xl font-bold text-blue-900">{upcoming_count}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-green-600">{t('schedule.completed_classes')}</p>
                                <p className="text-2xl font-bold text-green-900">{schedules.past?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-full">
                                <BookOpen className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{t('schedule.total_classes')}</p>
                                <p className="text-2xl font-bold text-gray-900">{total_count}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule Sections */}
                <ScheduleSection
                    title={t('schedule.upcoming_classes')}
                    schedules={schedules.upcoming || []}
                    emptyMessage={t('schedule.no_upcoming_classes')}
                />

                <ScheduleSection
                    title={t('schedule.past_classes')}
                    schedules={schedules.past || []}
                    emptyMessage={t('schedule.no_past_classes')}
                />

                {schedules.cancelled && schedules.cancelled.length > 0 && (
                    <ScheduleSection
                        title={t('schedule.cancelled_classes')}
                        schedules={schedules.cancelled}
                        emptyMessage={t('schedule.no_cancelled_classes')}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}