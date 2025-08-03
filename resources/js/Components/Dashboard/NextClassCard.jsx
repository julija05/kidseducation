import React from 'react';
import { Calendar, Clock, User, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function NextClassCard({ nextClass }) {
    const { t } = useTranslation();
    
    
    // Show a placeholder card when no class is scheduled
    if (!nextClass || 
        nextClass.day_description === undefined || nextClass.day_description === null ||
        nextClass.time_only === undefined || nextClass.time_only === null ||
        Object.keys(nextClass).length === 0) {
        return (
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                <div className="flex items-start gap-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">{t('dashboard.next_class')}</h3>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                                {t('dashboard.pending')}
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="text-center py-6">
                                <div className="text-3xl mb-4">📅</div>
                                <h4 className="font-medium text-gray-800 mb-2">
                                    {t('dashboard.no_class_scheduled')}
                                </h4>
                                <p className="text-gray-600 text-sm mb-4">
                                    {t('dashboard.waiting_for_schedule')}
                                </p>
                                <div 
                                    className="rounded-lg p-4 border"
                                    style={{ 
                                        backgroundColor: 'rgb(var(--primary-50, 239 246 255))',
                                        borderColor: 'rgb(var(--primary-200, 191 219 254))'
                                    }}
                                >
                                    <p 
                                        className="text-sm font-medium"
                                        style={{ color: 'rgb(var(--primary-700, 29 78 216))' }}
                                    >
                                        💡 {t('dashboard.stay_tuned')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-md">
            <div className="flex items-start gap-4">
                <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgb(var(--primary-100, 219 234 254))' }}
                >
                    <Calendar 
                        className="w-5 h-5" 
                        style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{t('dashboard.next_class')}</h3>
                        <span 
                            className="px-3 py-1 text-white text-xs font-medium rounded-lg"
                            style={{ backgroundColor: 'rgb(var(--primary-600, 37 99 235))' }}
                        >
                            {t('dashboard.upcoming')}
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-1">{nextClass.title || t('dashboard.class_title_tbd')}</h4>
                            {nextClass.program_name && (
                                <p className="text-gray-600 text-sm">{t('dashboard.program')}: {nextClass.program_name}</p>
                            )}
                        </div>
                        
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center text-gray-700">
                                <Clock className="w-4 h-4 mr-3 text-gray-500" />
                                <span className="text-sm">
                                    {nextClass.day_description || t('dashboard.tbd')} {t('dashboard.at')} {nextClass.time_only || t('dashboard.tbd')}
                                </span>
                            </div>
                            
                            <div className="flex items-center text-gray-700">
                                <User className="w-4 h-4 mr-3 text-gray-500" />
                                <span className="text-sm">{t('dashboard.with_teacher', { teacher: nextClass.admin_name || t('dashboard.tbd') })}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600 text-sm">
                                <span>{t('dashboard.duration')}: {nextClass.duration || t('dashboard.tbd')}</span>
                            </div>
                        </div>
                        
                        
                        {nextClass.meeting_link && (
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-800 mb-1">
                                            🎥 {t('dashboard.ready_to_join')}
                                        </p>
                                        <p className="text-xs text-green-600">
                                            {t('dashboard.click_to_join')}
                                        </p>
                                    </div>
                                    <a
                                        href={nextClass.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        {t('dashboard.join_meeting')}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}