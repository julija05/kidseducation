import React from 'react';
import { Calendar, Clock, User, ExternalLink, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';

export default function NextClassCard({ nextClass }) {
    const { t } = useTranslation();
    
    
    // Show a placeholder card when no class is scheduled
    if (!nextClass || 
        nextClass.day_description === undefined || nextClass.day_description === null ||
        nextClass.time_only === undefined || nextClass.time_only === null ||
        Object.keys(nextClass).length === 0) {
        return (
            <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Modern Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <motion.div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl shadow-lg"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Calendar className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {t('dashboard.next_class')}
                            </h3>
                            <p className="text-gray-600">{t('dashboard.stay_connected')}</p>
                        </div>
                    </div>
                    <motion.span 
                        className="px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-sm font-medium rounded-full border border-amber-200 shadow-sm"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {t('dashboard.pending')}
                    </motion.span>
                </div>

                {/* Modern No Class Card */}
                <motion.div 
                    className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-white/50 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="text-center">
                        <motion.div 
                            className="text-6xl mb-6"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            📅
                        </motion.div>
                        <h4 className="text-2xl font-bold text-gray-800 mb-3">
                            {t('dashboard.no_class_scheduled')}
                        </h4>
                        <p className="text-gray-600 mb-6 text-lg">
                            {t('dashboard.waiting_for_schedule')}
                        </p>
                        <motion.div 
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50 shadow-md"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center justify-center space-x-3 text-blue-600 mb-3">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    💡
                                </motion.div>
                                <span className="font-bold text-lg">{t('dashboard.stay_tuned')}</span>
                            </div>
                            <p className="text-gray-600">
                                {t('dashboard.class_scheduling_note')}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Modern Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <motion.div 
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 p-3 rounded-xl shadow-lg"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Calendar className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                            {t('dashboard.next_class')}
                        </h3>
                        <p className="text-gray-600">{t('dashboard.your_upcoming_session')}</p>
                    </div>
                </div>
                <motion.span 
                    className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200 shadow-sm"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    {t('dashboard.upcoming')}
                </motion.span>
            </div>

            {/* Modern Class Card */}
            <motion.div 
                className="bg-gradient-to-br from-emerald-50 via-blue-50 to-cyan-50 rounded-2xl p-8 border border-white/50 shadow-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
            >
                {/* Class Title Section */}
                <div className="mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                        {nextClass.title || t('dashboard.class_title_tbd')}
                    </h4>
                    {nextClass.program_name && (
                        <p className="text-lg text-gray-600 font-medium">
                            {t('dashboard.program')}: <span className="text-emerald-600">{nextClass.program_name}</span>
                        </p>
                    )}
                </div>
                
                {/* Class Details Grid */}
                <div className="flex flex-wrap gap-4 mb-4">
                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-emerald-200/50 shadow-sm flex-1 min-w-[200px]"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-1.5 rounded-lg">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t('dashboard.when')}</p>
                                <p className="font-bold text-gray-800">
                                    {nextClass.day_description || t('dashboard.tbd')}
                                </p>
                                <p className="text-sm text-emerald-600 font-medium">
                                    {nextClass.time_only || t('dashboard.tbd')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-blue-200/50 shadow-sm flex-1 min-w-[200px]"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                    >
                        <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 rounded-lg">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t('dashboard.teacher')}</p>
                                <p className="font-bold text-gray-800">
                                    {nextClass.admin_name || t('dashboard.tbd')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-cyan-200/50 shadow-sm flex-1 min-w-[200px]"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2, delay: 0.2 }}
                    >
                        <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-1.5 rounded-lg">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t('dashboard.duration')}</p>
                                <p className="font-bold text-gray-800">
                                    {nextClass.duration || t('dashboard.tbd')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Meeting Link Section */}
                {nextClass.meeting_link && (
                    <motion.div 
                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <motion.span 
                                        className="text-2xl"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        🎥
                                    </motion.span>
                                    <p className="text-lg font-bold text-green-800">
                                        {t('dashboard.ready_to_join')}
                                    </p>
                                </div>
                                <p className="text-sm text-green-600 font-medium">
                                    {t('dashboard.click_to_join')}
                                </p>
                            </div>
                            <motion.a
                                href={nextClass.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ExternalLink className="w-5 h-5" />
                                {t('dashboard.join_meeting')}
                            </motion.a>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}