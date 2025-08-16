// resources/js/Components/Dashboard/ProgressOverview.jsx
import React from "react";
import { Calendar, Star, Target, Zap, Trophy, Rocket, TrendingUp, Award, Sparkles } from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { useAvatar } from "@/hooks/useAvatar.jsx";
import { usePage } from '@inertiajs/react';

export default function ProgressOverview({ enrolledProgram, nextClass }) {
    const { t } = useTranslation();
    const { avatarData } = useAvatar();
    const { auth } = usePage().props;
    const user = auth.user;
    
    const ProgramIcon =
        iconMap[enrolledProgram.theme?.icon] || iconMap.BookOpen;

    // Ensure progress is a valid number
    const progressPercentage = Math.max(
        0,
        Math.min(100, enrolledProgram.progress || 0)
    );

    // Get quiz points and level info
    const quizPoints = enrolledProgram.quizPoints || 0;
    const currentLevel = enrolledProgram.currentLevel || 1;
    const totalLevels = enrolledProgram.totalLevels || 1;
    const pointsForNextLevel = enrolledProgram.pointsForNextLevel;
    const pointsNeededForNextLevel = enrolledProgram.pointsNeededForNextLevel;

    // Fun messages for different progress levels
    const getProgressMessage = () => {
        if (progressPercentage === 0) return { text: t('dashboard.lets_start_adventure'), emoji: "🚀" };
        if (progressPercentage < 25) return { text: t('dashboard.doing_great'), emoji: "🌟" };
        if (progressPercentage < 50) return { text: t('dashboard.awesome_progress'), emoji: "💪" };
        if (progressPercentage < 75) return { text: t('dashboard.halfway_there'), emoji: "🎯" };
        if (progressPercentage < 100) return { text: t('dashboard.almost_done'), emoji: "⭐" };
        return { text: t('dashboard.champion'), emoji: "🎉" };
    };

    const progressMessage = getProgressMessage();

    // Achievement badges based on progress
    const getAchievements = () => {
        const achievements = [];
        if (progressPercentage >= 25) achievements.push({ name: t('dashboard.getting_started'), emoji: "🌱" });
        if (progressPercentage >= 50) achievements.push({ name: t('dashboard.halfway_hero'), emoji: "🏅" });
        if (progressPercentage >= 75) achievements.push({ name: t('dashboard.almost_there'), emoji: "🚀" });
        if (progressPercentage === 100) achievements.push({ name: t('dashboard.course_master'), emoji: "👑" });
        if (quizPoints >= 50) achievements.push({ name: t('dashboard.quiz_warrior'), emoji: "⚔️" });
        if (quizPoints >= 100) achievements.push({ name: t('dashboard.point_collector'), emoji: "💎" });
        return achievements;
    };

    const achievements = getAchievements();

    return (
        <div className="space-y-8">
            {/* Modern Welcome Message */}
            <motion.div 
                className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-white/50 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center mb-6">
                            <motion.div 
                                className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mr-6 shadow-lg border-4 border-white"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                whileHover={{ rotate: [0, 10, -10, 0] }}
                            >
                                {avatarData && avatarData.type === 'emoji' ? (
                                    <span className="text-3xl">{avatarData.value}</span>
                                ) : (
                                    <span className="text-2xl font-bold text-blue-600">
                                        {user.name ? user.name.charAt(0).toUpperCase() : '👋'}
                                    </span>
                                )}
                            </motion.div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {t('dashboard.hi_super_learner')}
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">
                                    {t('dashboard.welcome_back_message')}
                                </p>
                            </div>
                        </div>
                        <motion.div 
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border-l-4 border-gradient-to-b from-blue-400 to-purple-400 shadow-md"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center">
                                <motion.span 
                                    className="text-3xl mr-4"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    {progressMessage.emoji}
                                </motion.span>
                                <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {progressMessage.text}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Modern Progress Card */}
                <motion.div 
                    className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">{t('dashboard.progress')}</h3>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg shadow-md">
                            <Target size={20} className="text-white" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {Math.round(progressPercentage)}%
                            </span>
                            <span className="text-sm text-gray-500 font-medium">{t('dashboard.complete')}</span>
                        </div>
                        <div className="relative">
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse opacity-50 rounded-full" />
                            {progressPercentage > 0 && (
                                <motion.div 
                                    className="absolute top-0 h-4 w-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg"
                                    style={{ left: `${Math.max(0, progressPercentage - 2)}%` }}
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Modern Quiz Points Card */}
                <motion.div 
                    className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">{t('dashboard.quiz_points')}</h3>
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg shadow-md">
                            <Zap size={20} className="text-white" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <span className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                {quizPoints}
                            </span>
                            <span className="ml-2 text-2xl">⚡</span>
                        </div>
                        {pointsNeededForNextLevel !== null && pointsNeededForNextLevel > 0 && (
                            <p className="text-sm text-gray-600 font-medium">
                                {t('dashboard.points_to_next_level', { points: pointsNeededForNextLevel, level: currentLevel + 1 })} 🔓
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Modern Level Card */}
                <motion.div 
                    className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">{t('dashboard.current_level')}</h3>
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg shadow-md">
                            <Trophy size={20} className="text-white" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {currentLevel}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">
                                / {totalLevels}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            {[...Array(Math.min(5, totalLevels))].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        i < currentLevel 
                                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-md' 
                                            : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                            {totalLevels > 5 && <span className="text-gray-400 text-xs">...</span>}
                        </div>
                    </div>
                </motion.div>

                {/* Modern Achievements Card */}
                <motion.div 
                    className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">{t('dashboard.achievements')}</h3>
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-lg shadow-md">
                            <Award size={20} className="text-white" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        {achievements.length > 0 ? (
                            <div className="space-y-2">
                                {achievements.slice(0, 2).map((achievement, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-2 border border-pink-200/50"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{achievement.emoji}</span>
                                            <span className="text-sm font-medium text-gray-700">
                                                {achievement.name}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                                {achievements.length > 2 && (
                                    <p className="text-xs text-gray-500 text-center">
                                        +{achievements.length - 2} {t('dashboard.more_achievements')}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-gray-500 text-sm">{t('dashboard.no_achievements_yet')}</p>
                                <p className="text-xs text-gray-400 mt-1">{t('dashboard.keep_learning')}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}