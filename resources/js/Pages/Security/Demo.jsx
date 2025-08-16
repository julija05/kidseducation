import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Clock, Eye, Lock, Play, User } from 'lucide-react';
import SecurityStatusCard from '@/Components/Security/SecurityStatusCard';
import TimeLimitWarning from '@/Components/Security/TimeLimitWarning';
import { ContentSafetyFilter, SafeInput } from '@/Components/Security/ContentSafetyFilter';

export default function SecurityDemo({ auth }) {
    const [demoContent, setDemoContent] = useState('');
    const [securityLevel, setSecurityLevel] = useState('high');
    const [timeRemaining, setTimeRemaining] = useState(25);
    const [showTimeWarning, setShowTimeWarning] = useState(false);

    const testContent = [
        {
            label: '✅ Safe Content',
            content: 'I love learning math and coding! Can you help me with my homework?',
            safe: true
        },
        {
            label: '⚠️ Personal Info',
            content: 'My phone number is 555-123-4567 and I live at 123 Main Street',
            safe: false
        },
        {
            label: '🚫 Meeting Request',
            content: 'Can we meet up after school? Don\'t tell your parents',
            safe: false
        },
        {
            label: '⚠️ External Link',
            content: 'Check out this cool website: https://example.com/not-safe',
            safe: false
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Kids Security Demo" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Demo Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg mb-4">
                            <Shield className="w-6 h-6 text-blue-600" />
                            <span className="text-lg font-bold text-gray-900">Kids Security Demo</span>
                        </div>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Experience the comprehensive security features designed to keep children safe while learning online.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Security Status Card */}
                        <div className="lg:col-span-1">
                            <SecurityStatusCard 
                                user={auth.user}
                                sessionTimeRemaining={timeRemaining}
                                securityLevel={securityLevel}
                            />
                            
                            {/* Demo Controls */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-6 bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Play className="w-5 h-5" />
                                    Demo Controls
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Security Level
                                        </label>
                                        <select
                                            value={securityLevel}
                                            onChange={(e) => setSecurityLevel(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        >
                                            <option value="high">🔒 High Security</option>
                                            <option value="medium">⚠️ Medium Security</option>
                                            <option value="low">🚨 Low Security</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Time Remaining (minutes)
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="60"
                                            value={timeRemaining}
                                            onChange={(e) => setTimeRemaining(Number(e.target.value))}
                                            className="w-full"
                                        />
                                        <div className="text-sm text-gray-500 mt-1">{timeRemaining} minutes</div>
                                    </div>
                                    
                                    <button
                                        onClick={() => setShowTimeWarning(true)}
                                        className="w-full bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                                    >
                                        🕒 Show Time Warning
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Content Safety Demo */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Content Filter Demo */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    Content Safety Filter
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Test Content Input
                                        </label>
                                        <SafeInput
                                            value={demoContent}
                                            onChange={(e) => setDemoContent(e.target.value)}
                                            placeholder="Type something to test the content filter..."
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-16"
                                            maxLength={200}
                                        />
                                    </div>
                                    
                                    {demoContent && (
                                        <ContentSafetyFilter
                                            content={demoContent}
                                            onContentApproved={() => console.log('Content approved')}
                                            onContentBlocked={(violations) => console.log('Content blocked:', violations)}
                                        >
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <p className="text-green-800">
                                                    ✅ <strong>Content Approved:</strong> {demoContent}
                                                </p>
                                            </div>
                                        </ContentSafetyFilter>
                                    )}
                                </div>
                            </motion.div>

                            {/* Test Cases */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Security Test Cases
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {testContent.map((test, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.02 }}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                test.safe 
                                                    ? 'border-green-200 bg-green-50 hover:border-green-300' 
                                                    : 'border-red-200 bg-red-50 hover:border-red-300'
                                            }`}
                                            onClick={() => setDemoContent(test.content)}
                                        >
                                            <h4 className="font-semibold mb-2">{test.label}</h4>
                                            <p className="text-sm text-gray-600 line-clamp-3">
                                                {test.content}
                                            </p>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Click to test this content
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Security Features Overview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Lock className="w-5 h-5" />
                                    Active Security Features
                                </h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { icon: Clock, label: 'Time Limits', color: 'blue' },
                                        { icon: Eye, label: 'Content Filter', color: 'green' },
                                        { icon: Shield, label: 'Session Security', color: 'purple' },
                                        { icon: User, label: 'Parent Reports', color: 'orange' }
                                    ].map((feature, index) => (
                                        <div key={index} className={`text-center p-4 rounded-lg bg-${feature.color}-50 border border-${feature.color}-200`}>
                                            <feature.icon className={`w-8 h-8 text-${feature.color}-600 mx-auto mb-2`} />
                                            <div className={`text-sm font-medium text-${feature.color}-800`}>
                                                {feature.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Demo Navigation */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white text-center"
                            >
                                <h3 className="text-lg font-bold mb-4">📧 Want to see how parents are notified?</h3>
                                <p className="mb-6 opacity-90">
                                    Check out our parent notification system demo to see how parents receive 
                                    real-time alerts, daily reports, and weekly summaries about their child's activities.
                                </p>
                                <motion.a
                                    href="/security/parent-notifications"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-block bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    View Parent Notification Demo →
                                </motion.a>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Limit Warning Component */}
            {showTimeWarning && (
                <TimeLimitWarning 
                    remainingMinutes={timeRemaining}
                    dailyLimit={120}
                    onTakeBreak={() => {
                        setShowTimeWarning(false);
                        alert('Taking a break! 😴');
                    }}
                    onContinue={() => {
                        setShowTimeWarning(false);
                        alert('Continuing to learn! 📚');
                    }}
                />
            )}
        </AuthenticatedLayout>
    );
}