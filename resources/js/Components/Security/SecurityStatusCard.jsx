import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Eye, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

export default function SecurityStatusCard({ user, sessionTimeRemaining, securityLevel = 'high' }) {
    const getSecurityColor = () => {
        switch (securityLevel) {
            case 'high': return 'text-green-600 bg-green-50 border-green-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-green-600 bg-green-50 border-green-200';
        }
    };

    const formatTimeRemaining = (minutes) => {
        if (minutes <= 0) return '0 minutes';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins} minutes`;
    };

    const getSecurityIcon = () => {
        switch (securityLevel) {
            case 'high': return <Shield className="w-5 h-5" />;
            case 'medium': return <AlertTriangle className="w-5 h-5" />;
            case 'low': return <AlertTriangle className="w-5 h-5" />;
            default: return <Shield className="w-5 h-5" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`bg-white rounded-2xl shadow-lg border-2 p-6 ${getSecurityColor()}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {getSecurityIcon()}
                    <h3 className="text-lg font-bold">Security Status</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${securityLevel === 'high' ? 'bg-green-500' : securityLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium capitalize">{securityLevel}</span>
                </div>
            </div>

            {/* Security Features */}
            <div className="space-y-3">
                {/* Session Security */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50">
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Session Time</span>
                    </div>
                    <span className="text-sm font-bold">
                        {formatTimeRemaining(sessionTimeRemaining || 30)}
                    </span>
                </div>

                {/* Content Protection */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50">
                    <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Content Filter</span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                </div>

                {/* Privacy Protection */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50">
                    <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">Privacy Shield</span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
            </div>

            {/* Security Message */}
            <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>🛡️ You're protected!</strong> Our security system keeps you safe while learning.
                </p>
            </div>

            {/* Parent Info (if applicable) */}
            {user.roles?.includes('student') && (
                <div className="mt-3 text-xs text-gray-600 text-center">
                    📧 Your parents receive activity reports to keep you safe
                </div>
            )}
        </motion.div>
    );
}