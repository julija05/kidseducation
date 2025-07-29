import React from 'react';
import { Calendar, Clock, User, ExternalLink } from 'lucide-react';

export default function NextClassCard({ nextClass }) {
    // Debug logging to understand the structure
    console.log('NextClassCard received:', nextClass);
    
    // Show a placeholder card when no class is scheduled
    if (!nextClass || 
        nextClass.day_description === undefined || nextClass.day_description === null ||
        nextClass.time_only === undefined || nextClass.time_only === null ||
        Object.keys(nextClass).length === 0) {
        return (
            <div className="mb-6 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                        <Calendar className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-gray-700">Next Class</h3>
                            <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                                Pending
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="text-center py-4">
                                <div className="text-4xl mb-3">📅</div>
                                <h4 className="font-semibold text-gray-800 text-lg mb-2">
                                    No class scheduled yet
                                </h4>
                                <p className="text-gray-600 text-sm mb-3">
                                    Don't worry! Your instructor will schedule your next class soon and you'll be notified.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-blue-700 text-sm font-medium">
                                        💡 Keep practicing with your lessons while you wait!
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
                            <h4 className="font-semibold text-blue-800 text-lg">{nextClass.title || 'Class Title TBD'}</h4>
                            {nextClass.program_name && (
                                <p className="text-blue-600 text-sm">Program: {nextClass.program_name}</p>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center text-blue-700">
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="text-sm">
                                    {nextClass.day_description || 'TBD'} at {nextClass.time_only || 'TBD'}
                                </span>
                            </div>
                            
                            <div className="flex items-center text-blue-700">
                                <User className="w-4 h-4 mr-2" />
                                <span className="text-sm">with {nextClass.admin_name || 'TBD'}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center text-blue-600 text-sm">
                            <span>Duration: {nextClass.duration || 'TBD'}</span>
                        </div>
                        
                        {nextClass.meeting_link && (
                            <div className="pt-3 border-t border-blue-100">
                                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-800 mb-1">
                                            🎥 Ready to join your class?
                                        </p>
                                        <p className="text-xs text-green-600">
                                            Click the button to join your virtual classroom
                                        </p>
                                    </div>
                                    <a
                                        href={nextClass.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium text-sm rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Join Meeting
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