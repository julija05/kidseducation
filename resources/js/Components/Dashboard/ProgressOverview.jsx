// resources/js/Components/Dashboard/ProgressOverview.jsx
import React from "react";
import { Calendar, Star, Target, Zap, Trophy, Rocket } from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProgressOverview({ enrolledProgram, nextClass }) {
    const { t } = useTranslation();
    
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

    // Get the actual hex color value from the theme color class
    const getProgressBarColor = () => {
        const themeColor = enrolledProgram.theme?.color;

        // Map CSS classes to actual hex colors with more vibrant kid-friendly colors
        const colorMap = {
            "bg-blue-500": "#3b82f6",
            "bg-blue-600": "#2563eb",
            "bg-green-500": "#10b981",
            "bg-green-600": "#059669",
            "bg-purple-500": "#8b5cf6",
            "bg-purple-600": "#7c3aed",
            "bg-red-500": "#ef4444",
            "bg-red-600": "#dc2626",
            "bg-yellow-500": "#eab308",
            "bg-yellow-600": "#ca8a04",
            "bg-indigo-500": "#6366f1",
            "bg-indigo-600": "#4f46e5",
            "bg-pink-500": "#ec4899",
            "bg-pink-600": "#db2777",
            "bg-gray-500": "#6b7280",
            "bg-gray-600": "#4b5563",
        };

        return colorMap[themeColor] || "#3b82f6"; // Default to blue-500
    };

    const progressBarColor = getProgressBarColor();

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
        <div className="space-y-0">
            {/* Welcome Message */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center mb-4">
                            <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                                style={{ backgroundColor: 'rgb(var(--primary-100, 219 234 254))' }}
                            >
                                <span className="text-2xl">👋</span>
                            </div>
                            <div>
                                <h1 
                                    className="text-2xl font-bold"
                                    style={{ color: 'rgb(var(--primary-700, 29 78 216))' }}
                                >
                                    {t('dashboard.hi_super_learner')}
                                </h1>
                                <p className="text-gray-600 text-sm mt-1">
                                    {t('dashboard.welcome_back_message')}
                                </p>
                            </div>
                        </div>
                        <div 
                            className="flex items-center p-4 rounded-lg border-l-4"
                            style={{ 
                                backgroundColor: 'rgb(var(--primary-50, 239 246 255))',
                                borderLeftColor: 'rgb(var(--primary-400, 96 165 250))'
                            }}
                        >
                            <span className="text-2xl mr-3">{progressMessage.emoji}</span>
                            <p 
                                className="text-lg font-medium"
                                style={{ color: 'rgb(var(--primary-700, 29 78 216))' }}
                            >
                                {progressMessage.text}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Progress Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">{t('dashboard.progress')}</h3>
                        <Target 
                            size={24} 
                            style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span 
                                className="text-3xl font-bold" 
                                style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                            >
                                {Math.round(progressPercentage)}%
                            </span>
                            <span className="text-sm text-gray-500">{t('dashboard.complete')}</span>
                        </div>
                        <div className="relative">
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${progressPercentage}%`,
                                        background: `linear-gradient(90deg, ${progressBarColor}, ${progressBarColor}dd)`,
                                    }}
                                />
                            </div>
                            {progressPercentage > 0 && (
                                <div 
                                    className="absolute top-0 h-3 w-2 bg-yellow-400 rounded-full animate-pulse"
                                    style={{ left: `${Math.max(0, progressPercentage - 1)}%` }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Quiz Points Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">{t('dashboard.quiz_points')}</h3>
                        <Zap 
                            size={24} 
                            style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span 
                                className="text-3xl font-bold" 
                                style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                            >
                                {quizPoints}
                            </span>
                            <span className="ml-2 text-lg">⚡</span>
                        </div>
                        {pointsNeededForNextLevel !== null && pointsNeededForNextLevel > 0 && (
                            <p className="text-sm text-gray-600">
                                {t('dashboard.points_to_next_level', { points: pointsNeededForNextLevel, level: currentLevel + 1 })} 🔓
                            </p>
                        )}
                        {pointsNeededForNextLevel === 0 && (
                            <p className="text-sm text-green-600 font-medium">
                                {t('dashboard.new_level_unlocked')} 🎉
                            </p>
                        )}
                    </div>
                </div>

                {/* Current Level Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">{t('dashboard.current_level')}</h3>
                        <Trophy 
                            size={24} 
                            style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span 
                                className="text-3xl font-bold" 
                                style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                            >
                                {currentLevel}
                            </span>
                            <span className="ml-2 text-lg">🏆</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('dashboard.level_progress', { current: currentLevel, total: totalLevels })}
                        </p>
                        <div className="flex space-x-1">
                            {Array.from({ length: totalLevels }, (_, i) => (
                                <div
                                    key={i}
                                    className="w-3 h-3 rounded-full bg-gray-200"
                                    style={{
                                        backgroundColor: i < currentLevel 
                                            ? 'rgb(var(--primary-600, 147 51 234))' 
                                            : '#e5e7eb'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Program Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">{t('dashboard.learning')}</h3>
                        <ProgramIcon 
                            size={24} 
                            style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight">
                            {enrolledProgram.translated_name || enrolledProgram.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                            {nextClass && nextClass.day_description && nextClass.time_only 
                                ? `${t('dashboard.next')}: ${nextClass.day_description} ${t('dashboard.at')} ${nextClass.time_only}` 
                                : t('dashboard.class_scheduled_soon') + " 📅"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            {achievements.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mt-8">
                    <div className="flex items-center mb-6">
                        <div 
                            className="p-2 rounded-lg mr-3"
                            style={{ backgroundColor: 'rgb(var(--primary-100, 219 234 254))' }}
                        >
                            <Star 
                                size={20} 
                                style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                            />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">{t('dashboard.your_achievements')}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg px-4 py-3"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl">{achievement.emoji}</span>
                                    <span className="font-medium text-gray-700 text-sm">
                                        {achievement.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
