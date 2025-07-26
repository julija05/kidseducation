import React from 'react';
import { Calendar, Clock, User, ExternalLink } from 'lucide-react';

export default function NextClassCard({ nextClass }) {
    if (!nextClass) return null;

    return (
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-blue-900">Next Class</h3>
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                            Upcoming
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold text-blue-800 text-lg">{nextClass.title}</h4>
                            {nextClass.program_name && (
                                <p className="text-blue-600 text-sm">Program: {nextClass.program_name}</p>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center text-blue-700">
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="text-sm">
                                    {nextClass.day_description} at {nextClass.time_only}
                                </span>
                            </div>
                            
                            <div className="flex items-center text-blue-700">
                                <User className="w-4 h-4 mr-2" />
                                <span className="text-sm">with {nextClass.admin_name}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center text-blue-600 text-sm">
                            <span>Duration: {nextClass.duration}</span>
                        </div>
                        
                        {nextClass.meeting_link && (
                            <div className="pt-2">
                                <a
                                    href={nextClass.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Join Meeting
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}