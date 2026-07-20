import React from "react";
import { CheckCircle, ArrowRight, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAvatar } from "@/hooks/useAvatar.jsx";
import { usePage } from '@inertiajs/react';
import { motion } from "framer-motion";

export default function LessonCompletionModal({
    show,
    nextLesson,
    onProceed,
    onStay,
    onClose,
}) {
    const { t } = useTranslation();
    const { avatarData } = useAvatar();
    const { auth } = usePage().props;
    const user = auth.user;

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
                className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="bg-aba-green rounded-t-xl p-6 text-center relative overflow-hidden">
                    {/* Celebration confetti effect */}
                    <div className="absolute inset-0">
                        <motion.div className="absolute top-2 left-4 text-yellow-300"
                            animate={{ y: [0, -10, 0], rotate: [0, 180, 360] }}
                            transition={{ duration: 2, repeat: Infinity }}>⭐</motion.div>
                        <motion.div className="absolute top-3 right-6 text-yellow-300"
                            animate={{ y: [0, -15, 0], rotate: [0, -180, -360] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>🎉</motion.div>
                        <motion.div className="absolute bottom-4 left-6 text-yellow-300"
                            animate={{ y: [0, -8, 0], rotate: [0, 90, 180] }}
                            transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}>✨</motion.div>
                        <motion.div className="absolute bottom-3 right-4 text-yellow-300"
                            animate={{ y: [0, -12, 0], rotate: [0, -90, -180] }}
                            transition={{ duration: 1.3, repeat: Infinity, delay: 0.3 }}>🎊</motion.div>
                    </div>
                    
                    {/* Avatar with celebration */}
                    <div className="relative z-10 flex items-center justify-center gap-4 mb-4">
                        <motion.div 
                            className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                        >
                            {avatarData && avatarData.type === 'emoji' ? (
                                <span className="text-3xl">{avatarData.value}</span>
                            ) : (
                                <span className="text-2xl font-bold text-white">
                                    {user.name ? user.name.charAt(0).toUpperCase() : '🎉'}
                                </span>
                            )}
                        </motion.div>
                        
                        <motion.div 
                            className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                        >
                            <CheckCircle size={24} className="text-white" />
                        </motion.div>
                    </div>
                    
                    <h2 className="text-2xl font-black text-white mb-2 relative z-10 font-display">
                        🎉 {t('lessons.lesson_completed_title')} 🎉
                    </h2>
                    <p className="text-aba-green-soft relative z-10">
                        {t('lessons.lesson_completed_message')}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {nextLesson ? (
                        <>
                            <div className="mb-6">
                                <p className="text-sm font-bold uppercase tracking-wide text-aba-ink-soft mb-2">
                                    {t('lessons.next_lesson_title')}
                                </p>
                                <div className="bg-aba-blue-soft border border-aba-blue rounded-aba-sm p-4">
                                    <h3 className="font-black text-aba-ink">
                                        {nextLesson.translated_title || nextLesson.title}
                                    </h3>
                                    <p className="text-sm font-semibold text-aba-blue mt-1">
                                        {t('lessons.level')} {nextLesson.level}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onProceed}
                                    className="flex-1 bg-aba-coral hover:bg-aba-coral-dark text-white font-black py-3 px-4 rounded-aba-sm shadow-aba-coral transition flex items-center justify-center gap-2"
                                >
                                    {t('lessons.proceed_to_next')}
                                    <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={onStay}
                                    className="flex-1 bg-aba-surface-alt hover:brightness-95 text-aba-ink-soft font-black py-3 px-4 rounded-aba-sm transition"
                                >
                                    {t('lessons.stay_here')}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* All lessons completed */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-aba-yellow-soft rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-aba-yellow" />
                                </div>
                                <p className="font-semibold text-aba-ink-soft">
                                    {t('lessons.all_lessons_completed')}
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full bg-aba-green hover:brightness-95 text-white font-black py-3 px-4 rounded-aba-sm shadow-aba-sm transition"
                            >
                                {t('actions.back')}
                            </button>
                        </>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                >
                    <X size={20} />
                </button>
            </motion.div>
        </div>
    );
}