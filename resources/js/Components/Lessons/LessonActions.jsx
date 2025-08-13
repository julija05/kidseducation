import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { CheckCircle, Target, Sparkles, Trophy } from "lucide-react";

export default function LessonActions({
    currentProgress,
    isLoading,
    onUpdateProgress,
    onCompleteLesson,
}) {
    const { t } = useTranslation();
    
    return (
        <motion.div 
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -2 }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <motion.div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl shadow-lg"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Target className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {t('lessons.lesson_progress')}
                        </h3>
                        <p className="text-gray-600 font-medium">
                            {t('lessons.progress_complete', { progress: Math.round(currentProgress) })}
                        </p>
                    </div>
                </div>

                {currentProgress < 100 && (
                    <div className="flex items-center space-x-4">
                        <motion.button
                            onClick={() => onUpdateProgress(75)}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Sparkles size={20} />
                            <span>{t('lessons.mark_75_complete')}</span>
                        </motion.button>
                        
                        <motion.button
                            onClick={() => onCompleteLesson()}
                            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={isLoading}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLoading ? (
                                <>
                                    <motion.div
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span>{t('lessons.completing')}</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    <span>{t('lessons.complete_lesson')}</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                )}

                {currentProgress >= 100 && (
                    <motion.div 
                        className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-xl border border-green-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                    >
                        <Trophy className="w-6 h-6 text-green-600" />
                        <span className="text-lg font-bold text-green-700">
                            {t('lessons.lesson_completed')}
                        </span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
