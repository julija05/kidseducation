import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Calendar, Clock, User, ExternalLink, MapPin, Users, BookOpen, AlertCircle, CheckCircle, XCircle, Star, Award, TrendingUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import StudentNavBar from "@/Components/StudentNavBar";
import { motion, AnimatePresence } from "framer-motion";

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
        <StudentNavBar 
            panelType="schedule"
            icon={Calendar}
        />
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

    const ScheduleCard = ({ schedule, index }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={`bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
                schedule.status === 'cancelled' ? 'opacity-75' : ''
            } ${schedule.status === 'confirmed' ? 'border-blue-200 bg-gradient-to-br from-blue-50/50 to-white' : ''} ${
                schedule.status === 'completed' ? 'border-green-200 bg-gradient-to-br from-green-50/50 to-white' : ''
            }`}>
            <div className="p-6 relative">
                {/* Status decoration */}
                {schedule.status === 'confirmed' && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 rounded-bl-full"></div>
                )}
                {schedule.status === 'completed' && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 opacity-10 rounded-bl-full"></div>
                )}
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4 relative">
                    <div className="flex-1">
                        <motion.div 
                            className="flex items-center gap-2 mb-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{schedule.title}</h3>
                            {schedule.is_group_class && (
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200"
                                >
                                    <Users className="w-3 h-3" />
                                    {t('schedule.group')} ({schedule.student_count})
                                </motion.span>
                            )}
                        </motion.div>
                        {schedule.description && (
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 + 0.4 }}
                                className="text-sm text-gray-600 mb-3"
                            >
                                {schedule.description}
                            </motion.p>
                        )}
                    </div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border shadow-sm ${getStatusBadgeColor(schedule.status)}`}
                    >
                        {getStatusIcon(schedule.status)}
                        {t(`schedule.status.${schedule.status}`)}
                    </motion.div>
                </div>

                {/* Schedule Info */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                >
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center text-gray-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">
                            {formatDate(schedule.scheduled_at)} at {new Date(schedule.scheduled_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            })}
                        </span>
                    </motion.div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center text-gray-700 p-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Clock className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">{schedule.duration}</span>
                    </motion.div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center text-gray-700 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">{t('schedule.with_teacher', { teacher: schedule.admin.name })}</span>
                    </motion.div>
                    
                    {schedule.type_label && (
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center text-gray-700 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                <BookOpen className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="text-sm font-medium">{schedule.type_label}</span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Program & Lesson Info */}
                {(schedule.program || schedule.lesson) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.6 }}
                        className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-100"
                    >
                        {schedule.program && (
                            <motion.div 
                                whileHover={{ x: 2 }}
                                className="mb-2"
                            >
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {t('schedule.program')}
                                </span>
                                <p className="text-sm font-medium text-gray-900 mt-1">{schedule.program.name}</p>
                            </motion.div>
                        )}
                        {schedule.lesson && (
                            <motion.div whileHover={{ x: 2 }}>
                                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {t('schedule.lesson')}
                                </span>
                                <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                                    {schedule.lesson.title}
                                    {schedule.lesson.level && (
                                        <motion.span 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.1 + 0.7 }}
                                            className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs rounded-full border border-blue-200"
                                        >
                                            {t('schedule.level', { level: schedule.lesson.level })}
                                        </motion.span>
                                    )}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Location/Meeting Link */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.7 }}
                    className="flex flex-col sm:flex-row gap-3"
                >
                    {schedule.location && (
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center text-gray-600 p-2 bg-gray-50 rounded-lg"
                        >
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium">{schedule.location}</span>
                        </motion.div>
                    )}
                    
                    {schedule.meeting_link && schedule.status !== 'cancelled' && (
                        <motion.a
                            href={schedule.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <ExternalLink className="w-4 h-4" />
                            {t('schedule.join_meeting')}
                        </motion.a>
                    )}
                </motion.div>

                {/* Cancellation Reason */}
                {schedule.status === 'cancelled' && schedule.cancellation_reason && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: index * 0.1 + 0.8 }}
                        className="mt-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg"
                    >
                        <p className="text-sm text-red-800">
                            <strong className="flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {t('schedule.cancellation_reason')}
                            </strong> 
                            <span className="ml-1">{schedule.cancellation_reason}</span>
                        </p>
                    </motion.div>
                )}

                {/* Session Notes */}
                {schedule.status === 'completed' && schedule.session_notes && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: index * 0.1 + 0.8 }}
                        className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                    >
                        <p className="text-sm text-green-800">
                            <strong className="flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                {t('schedule.session_notes')}
                            </strong> 
                            <span className="ml-1">{schedule.session_notes}</span>
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );

    const ScheduleSection = ({ title, schedules, emptyMessage, icon: Icon = Calendar }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
        >
            <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
            >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {title}
                <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                >
                    {schedules.length}
                </motion.span>
            </motion.h2>
            
            <AnimatePresence mode="wait">
                {schedules.length > 0 ? (
                    <motion.div 
                        key="schedules"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid gap-4"
                    >
                        {schedules.map((schedule, index) => (
                            <ScheduleCard key={schedule.id} schedule={schedule} index={index} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100"
                    >
                        <motion.div
                            animate={{ 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1] 
                            }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3
                            }}
                        >
                            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        </motion.div>
                        <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
                        <p className="text-gray-400 text-sm mt-2">New classes will appear here when scheduled</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    return (
        <AuthenticatedLayout 
            programConfig={scheduleTheme}
            customHeader={customHeader}
        >
            <Head title={t('schedule.my_schedule')} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <motion.h1 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3"
                    >
                        {t('schedule.my_schedule')}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-gray-600 text-lg"
                    >
                        {t('schedule.page_description', { count: upcoming_count })}
                    </motion.p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center">
                            <motion.div 
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full shadow-md"
                            >
                                <Calendar className="w-6 h-6 text-white" />
                            </motion.div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-blue-600">{t('schedule.upcoming_classes')}</p>
                                <motion.p 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                                    className="text-3xl font-bold text-blue-900"
                                >
                                    {upcoming_count}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center">
                            <motion.div 
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-full shadow-md"
                            >
                                <CheckCircle className="w-6 h-6 text-white" />
                            </motion.div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-green-600">{t('schedule.completed_classes')}</p>
                                <motion.p 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                                    className="text-3xl font-bold text-green-900"
                                >
                                    {schedules.past?.length || 0}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center">
                            <motion.div 
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                className="bg-gradient-to-r from-gray-500 to-slate-600 p-3 rounded-full shadow-md"
                            >
                                <TrendingUp className="w-6 h-6 text-white" />
                            </motion.div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{t('schedule.total_classes')}</p>
                                <motion.p 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                                    className="text-3xl font-bold text-gray-900"
                                >
                                    {total_count}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Schedule Sections */}
                <ScheduleSection
                    title={t('schedule.upcoming_classes')}
                    schedules={schedules.upcoming || []}
                    emptyMessage={t('schedule.no_upcoming_classes')}
                    icon={Calendar}
                />

                <ScheduleSection
                    title={t('schedule.past_classes')}
                    schedules={schedules.past || []}
                    emptyMessage={t('schedule.no_past_classes')}
                    icon={CheckCircle}
                />

                {schedules.cancelled && schedules.cancelled.length > 0 && (
                    <ScheduleSection
                        title={t('schedule.cancelled_classes')}
                        schedules={schedules.cancelled}
                        emptyMessage={t('schedule.no_cancelled_classes')}
                        icon={XCircle}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}