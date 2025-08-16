import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Mail, Send, Shield, Clock, AlertTriangle, CheckCircle, 
    Settings, User, Calendar, MessageSquare, Bell 
} from 'lucide-react';

export default function ParentNotificationDemo({ auth }) {
    const [selectedNotification, setSelectedNotification] = useState('security_alert');
    const [isLoading, setIsLoading] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [preferences, setPreferences] = useState({
        immediate_alerts: true,
        daily_reports: true,
        weekly_reports: true,
        learning_milestones: true,
        security_summaries: true,
        preferred_time: '18:00',
        timezone: 'UTC'
    });

    const notificationTypes = [
        {
            id: 'security_alert',
            title: '🚨 Security Alert',
            description: 'Immediate notification when security events occur',
            color: 'red',
            mockData: {
                alert_type: 'inappropriate_content_attempt',
                content_preview: 'My phone number is 555-123-4567',
                severity: 'high'
            }
        },
        {
            id: 'daily_report',
            title: '📚 Daily Report',
            description: 'End-of-day summary of learning activities',
            color: 'blue',
            mockData: {
                time_spent: 85,
                lessons_completed: 3,
                programs_accessed: [
                    { name: 'Math Basics', time_spent: 45 },
                    { name: 'Coding for Kids', time_spent: 40 }
                ],
                learning_achievements: [
                    { title: 'Completed Addition Module', description: 'Mastered basic addition skills' }
                ],
                blocked_content_attempts: 1,
                security_events: []
            }
        },
        {
            id: 'weekly_report',
            title: '📊 Weekly Summary',
            description: 'Comprehensive weekly learning and security overview',
            color: 'green',
            mockData: {
                total_time: 420,
                daily_breakdown: [
                    { minutes: 60 }, { minutes: 75 }, { minutes: 45 },
                    { minutes: 90 }, { minutes: 55 }, { minutes: 70 }, { minutes: 25 }
                ],
                learning_progress: {
                    lessons_completed: 18,
                    programs: [
                        { name: 'Math Basics', progress: 75 },
                        { name: 'Coding for Kids', progress: 45 }
                    ],
                    achievements: [
                        { title: 'Math Week Champion', date: '2025-01-14' },
                        { title: 'Perfect Attendance', date: '2025-01-16' }
                    ],
                    overall_percentage: 65
                },
                security_summary: {
                    total_events: 3,
                    blocked_content: 2,
                    safe_sessions: 7
                },
                parent_action_items: [
                    {
                        priority: 'medium',
                        action: 'Review screen time balance',
                        reason: 'High weekly screen time detected'
                    }
                ]
            }
        }
    ];

    const sendDemoNotification = async () => {
        setIsLoading(true);
        try {
            const selectedType = notificationTypes.find(t => t.id === selectedNotification);
            
            const response = await fetch('/security/send-parent-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    type: selectedNotification,
                    data: selectedType.mockData
                })
            });

            const result = await response.json();
            setLastResult(result);
        } catch (error) {
            console.error('Failed to send notification:', error);
            setLastResult({
                success: false,
                message: 'Failed to send notification: ' + error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updatePreferences = async () => {
        try {
            const response = await fetch('/security/configure-parent-notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(preferences)
            });

            const result = await response.json();
            if (result.success) {
                setLastResult({
                    success: true,
                    message: 'Parent notification preferences updated successfully!'
                });
            }
        } catch (error) {
            console.error('Failed to update preferences:', error);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Parent Notification System Demo" />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg mb-4">
                            <Mail className="w-6 h-6 text-purple-600" />
                            <span className="text-lg font-bold text-gray-900">Parent Notification System</span>
                        </div>
                        <p className="text-gray-600 max-w-3xl mx-auto">
                            Parents receive automatic notifications about their child's learning activities, 
                            security events, and progress updates via email.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Notification Types */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    Notification Types
                                </h3>
                                
                                <div className="space-y-4">
                                    {notificationTypes.map((type) => (
                                        <motion.div
                                            key={type.id}
                                            whileHover={{ scale: 1.02 }}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                selectedNotification === type.id
                                                    ? `border-${type.color}-300 bg-${type.color}-50`
                                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                            }`}
                                            onClick={() => setSelectedNotification(type.id)}
                                        >
                                            <h4 className="font-semibold text-lg mb-2">{type.title}</h4>
                                            <p className="text-sm text-gray-600">{type.description}</p>
                                            
                                            {selectedNotification === type.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-4 p-3 bg-white rounded-lg border"
                                                >
                                                    <h5 className="font-medium text-sm mb-2">Sample Data:</h5>
                                                    <pre className="text-xs text-gray-600 overflow-x-auto">
                                                        {JSON.stringify(type.mockData, null, 2)}
                                                    </pre>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={sendDemoNotification}
                                    disabled={isLoading}
                                    className="w-full mt-6 bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Send className="w-5 h-5" />
                                        </motion.div>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Demo Notification
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>

                            {/* Result Display */}
                            {lastResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl border-2 ${
                                        lastResult.success 
                                            ? 'border-green-300 bg-green-50' 
                                            : 'border-red-300 bg-red-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {lastResult.success ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                        )}
                                        <span className={`font-semibold ${
                                            lastResult.success ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {lastResult.success ? 'Success!' : 'Error'}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${
                                        lastResult.success ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                        {lastResult.message}
                                    </p>
                                    {lastResult.type && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            Type: {lastResult.type}
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Notification Preferences */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Parent Preferences
                                </h3>
                                
                                <div className="space-y-4">
                                    {[
                                        { key: 'immediate_alerts', label: 'Immediate Security Alerts', icon: '🚨' },
                                        { key: 'daily_reports', label: 'Daily Learning Reports', icon: '📚' },
                                        { key: 'weekly_reports', label: 'Weekly Summaries', icon: '📊' },
                                        { key: 'learning_milestones', label: 'Learning Milestones', icon: '🏆' },
                                        { key: 'security_summaries', label: 'Security Summaries', icon: '🛡️' }
                                    ].map((pref) => (
                                        <div key={pref.key} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{pref.icon}</span>
                                                <span className="font-medium">{pref.label}</span>
                                            </div>
                                            <label className="relative inline-flex cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={preferences[pref.key]}
                                                    onChange={(e) => setPreferences(prev => ({
                                                        ...prev,
                                                        [pref.key]: e.target.checked
                                                    }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                    
                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Preferred Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={preferences.preferred_time}
                                                    onChange={(e) => setPreferences(prev => ({
                                                        ...prev,
                                                        preferred_time: e.target.value
                                                    }))}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Timezone
                                                </label>
                                                <select
                                                    value={preferences.timezone}
                                                    onChange={(e) => setPreferences(prev => ({
                                                        ...prev,
                                                        timezone: e.target.value
                                                    }))}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                >
                                                    <option value="UTC">UTC</option>
                                                    <option value="EST">Eastern</option>
                                                    <option value="PST">Pacific</option>
                                                    <option value="CST">Central</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={updatePreferences}
                                    className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Settings className="w-5 h-5" />
                                    Update Preferences
                                </motion.button>
                            </motion.div>

                            {/* How It Works */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    How Parent Notifications Work
                                </h3>
                                
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <AlertTriangle className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Immediate Alerts</h4>
                                            <p className="text-gray-600">
                                                Parents receive instant emails when security events occur, 
                                                such as inappropriate content attempts or suspicious activity.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Daily Reports</h4>
                                            <p className="text-gray-600">
                                                End-of-day summaries include learning time, completed lessons, 
                                                achievements, and any security events that occurred.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Weekly Summaries</h4>
                                            <p className="text-gray-600">
                                                Comprehensive weekly overviews with learning progress, 
                                                time breakdowns, achievements, and security analysis.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Email Preview Note */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center"
                    >
                        <h3 className="text-lg font-bold text-yellow-800 mb-2">📧 Email Notifications</h3>
                        <p className="text-yellow-700">
                            In this demo, emails are logged to the Laravel log file. In production, 
                            parents would receive beautifully formatted emails with detailed information 
                            about their child's learning activities and security events.
                        </p>
                        <p className="text-sm text-yellow-600 mt-2">
                            Parent email: parent.{auth.user.email}
                        </p>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}