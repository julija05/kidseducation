import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Coffee } from 'lucide-react';

export default function TimeLimitWarning({ 
    remainingMinutes = 30, 
    dailyLimit = 120, 
    onTakeBreak, 
    onContinue 
}) {
    const [timeLeft, setTimeLeft] = useState(remainingMinutes);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        // Show warning when less than 10 minutes remain
        if (timeLeft <= 10 && timeLeft > 0) {
            setShowWarning(true);
        }

        // Countdown timer
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up - could trigger automatic logout here
                    return 0;
                }
                return prev - 1;
            });
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [timeLeft]);

    const getWarningLevel = () => {
        if (timeLeft <= 5) return 'critical';
        if (timeLeft <= 10) return 'warning';
        return 'normal';
    };

    const getWarningColor = () => {
        const level = getWarningLevel();
        switch (level) {
            case 'critical': return 'bg-red-100 border-red-300 text-red-800';
            case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
            default: return 'bg-blue-100 border-blue-300 text-blue-800';
        }
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins} minutes`;
    };

    const usedTime = dailyLimit - remainingMinutes;
    const progressPercentage = (usedTime / dailyLimit) * 100;

    return (
        <>
            {/* Always visible time display */}
            <div className="fixed top-4 right-4 z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`px-4 py-2 rounded-full border-2 shadow-lg backdrop-blur-sm ${getWarningColor()}`}
                >
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-bold">
                            {formatTime(timeLeft)} left
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Warning Modal */}
            <AnimatePresence>
                {showWarning && timeLeft > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
                        >
                            {/* Warning Icon */}
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 2, 
                                    repeat: Infinity 
                                }}
                                className="mb-6"
                            >
                                {getWarningLevel() === 'critical' ? (
                                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                                ) : (
                                    <Clock className="w-16 h-16 text-yellow-500 mx-auto" />
                                )}
                            </motion.div>

                            {/* Warning Message */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {getWarningLevel() === 'critical' ? 
                                    '⏰ Time Almost Up!' : 
                                    '🕒 Learning Time Reminder'
                                }
                            </h3>

                            <p className="text-gray-600 mb-6">
                                You have <strong>{formatTime(timeLeft)}</strong> of learning time remaining today.
                                {getWarningLevel() === 'critical' && 
                                    " It's almost time for a break!"
                                }
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Today's Progress</span>
                                    <span>{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 1 }}
                                        className={`h-3 rounded-full ${
                                            getWarningLevel() === 'critical' ? 'bg-red-500' :
                                            getWarningLevel() === 'warning' ? 'bg-yellow-500' :
                                            'bg-blue-500'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowWarning(false);
                                        onTakeBreak?.();
                                    }}
                                    className="flex-1 bg-green-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Coffee className="w-4 h-4" />
                                    Take a Break
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowWarning(false);
                                        onContinue?.();
                                    }}
                                    className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors"
                                >
                                    Keep Learning
                                </motion.button>
                            </div>

                            {/* Healthy Usage Tip */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                                <p className="text-xs text-blue-700">
                                    💡 <strong>Tip:</strong> Taking regular breaks helps you learn better and stay healthy!
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Time's Up Modal */}
            <AnimatePresence>
                {timeLeft <= 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
                        >
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{ 
                                    duration: 1, 
                                    repeat: Infinity 
                                }}
                                className="text-6xl mb-4"
                            >
                                🎯
                            </motion.div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Great Job Learning Today!
                            </h3>

                            <p className="text-gray-600 mb-6">
                                You've completed your daily learning time. Time to take a well-deserved break!
                            </p>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                <p className="text-green-800 text-sm">
                                    🌟 You learned for <strong>{formatTime(usedTime)}</strong> today!
                                    Come back tomorrow for more adventures.
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    // This could redirect to a "time's up" page or logout
                                    window.location.href = '/logout';
                                }}
                                className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors"
                            >
                                See You Tomorrow! 👋
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}