import React from "react";
import { router } from "@inertiajs/react";
import { ArrowLeft, BookOpen, Clock, Eye, Target, Star, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

export default function LessonHeader({
    lesson,
    program,
    progress,
    hasResources,
}) {
    const { t } = useTranslation();
    
    return (
        <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Modern Hero Section */}
            <motion.div
                className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-white/50 shadow-lg mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
            >
                {/* Lesson Level Badge */}
                <div className="flex items-center justify-between mb-6">
                    <motion.div 
                        className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full border border-blue-200/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="flex items-center space-x-2">
                            <Target size={16} className="text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">
                                {t('lessons.level')} {lesson.level} • {t('lessons.lesson')} {lesson.order_in_level}
                            </span>
                        </div>
                    </motion.div>
                    
                    {/* Progress Circle */}
                    <motion.div 
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-gray-200"
                                />
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="url(#gradient)"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: progress / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                                    style={{
                                        strokeDasharray: "251.2",
                                        strokeDashoffset: 251.2 * (1 - progress / 100),
                                    }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3B82F6" />
                                        <stop offset="100%" stopColor="#8B5CF6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Title Section */}
                <motion.div 
                    className="flex items-start justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="flex-1">
                        <div className="flex items-center mb-4">
                            <motion.div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl shadow-lg mr-4"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <BookOpen className="w-6 h-6 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {lesson.translated_title || lesson.title}
                                </h1>
                                <div className="flex items-center mt-2 text-gray-600">
                                    <Star size={16} className="mr-2 text-yellow-500" />
                                    <span className="font-medium">{program?.translated_name || program?.name}</span>
                                </div>
                            </div>
                        </div>

                        {(lesson.translated_description || lesson.description) && (
                            <motion.div 
                                className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50 mb-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                <p className="text-gray-700 leading-relaxed">
                                    {lesson.translated_description || lesson.description}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Lesson Info Grid */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                                <Clock size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t('lessons.duration')}</p>
                                <p className="font-bold text-gray-800">
                                    {lesson.formatted_duration || `${lesson.duration_minutes || 30} min`}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {hasResources && (
                        <motion.div 
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                                    <Eye size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">{t('lessons.resources')}</p>
                                    <p className="font-bold text-gray-800">
                                        {lesson.resources.length} {lesson.resources.length !== 1 ? t('lessons.resources') : t('lessons.resource')}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <motion.div 
                        className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yellow-200/50"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2, delay: 0.2 }}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{t('lessons.difficulty')}</p>
                                <p className="font-bold text-gray-800">
                                    {t('lessons.level')} {lesson.level}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
