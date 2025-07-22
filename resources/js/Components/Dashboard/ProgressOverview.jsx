// resources/js/Components/Dashboard/ProgressOverview.jsx
import React from "react";
import { Calendar, Star, Target, Zap, Trophy, Rocket } from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";

export default function ProgressOverview({ enrolledProgram, nextClass }) {
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
        if (progressPercentage === 0) return { text: "Let's start your adventure!", emoji: "🚀" };
        if (progressPercentage < 25) return { text: "You're doing great!", emoji: "🌟" };
        if (progressPercentage < 50) return { text: "Awesome progress!", emoji: "💪" };
        if (progressPercentage < 75) return { text: "You're halfway there!", emoji: "🎯" };
        if (progressPercentage < 100) return { text: "Almost done, superstar!", emoji: "⭐" };
        return { text: "You're a champion!", emoji: "🎉" };
    };

    const progressMessage = getProgressMessage();

    // Achievement badges based on progress
    const getAchievements = () => {
        const achievements = [];
        if (progressPercentage >= 25) achievements.push({ name: "Getting Started", emoji: "🌱" });
        if (progressPercentage >= 50) achievements.push({ name: "Half Way Hero", emoji: "🏅" });
        if (progressPercentage >= 75) achievements.push({ name: "Almost There", emoji: "🚀" });
        if (progressPercentage === 100) achievements.push({ name: "Course Master", emoji: "👑" });
        if (quizPoints >= 50) achievements.push({ name: "Quiz Warrior", emoji: "⚔️" });
        if (quizPoints >= 100) achievements.push({ name: "Point Collector", emoji: "💎" });
        return achievements;
    };

    const achievements = getAchievements();

    return (
        <div className="space-y-6 mb-8">
            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Hi there, Super Learner! 👋</h2>
                        <p className="text-lg opacity-90">{progressMessage.text} {progressMessage.emoji}</p>
                    </div>
                    <div className="text-6xl animate-bounce">
                        {progressMessage.emoji}
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Progress Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">Your Progress</h3>
                        <Target className="text-blue-500" size={24} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold" style={{ color: progressBarColor }}>
                                {Math.round(progressPercentage)}%
                            </span>
                            <span className="text-sm text-gray-500">Complete</span>
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
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">Quiz Points</h3>
                        <Zap className="text-yellow-500" size={24} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span className="text-3xl font-bold text-yellow-600">{quizPoints}</span>
                            <span className="ml-2 text-lg">⚡</span>
                        </div>
                        {pointsNeededForNextLevel !== null && pointsNeededForNextLevel > 0 && (
                            <p className="text-sm text-gray-600">
                                {pointsNeededForNextLevel} more to unlock Level {currentLevel + 1}! 🔓
                            </p>
                        )}
                        {pointsNeededForNextLevel === 0 && (
                            <p className="text-sm text-green-600 font-medium">
                                New level unlocked! 🎉
                            </p>
                        )}
                    </div>
                </div>

                {/* Current Level Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">Your Level</h3>
                        <Trophy className="text-purple-500" size={24} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span className="text-3xl font-bold text-purple-600">
                                {currentLevel}
                            </span>
                            <span className="ml-2 text-lg">🏆</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            of {totalLevels} levels
                        </p>
                        <div className="flex space-x-1">
                            {Array.from({ length: totalLevels }, (_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                        i < currentLevel 
                                            ? 'bg-purple-500' 
                                            : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Program Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">Learning</h3>
                        <ProgramIcon 
                            size={24} 
                            style={{ color: progressBarColor }}
                        />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight">
                            {enrolledProgram.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                            {nextClass ? `Next: ${nextClass}` : "Keep learning at your pace! 📚"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            {achievements.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center mb-4">
                        <Star className="text-yellow-500 mr-2" size={24} />
                        <h3 className="text-xl font-bold text-gray-800">Your Achievements</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg px-4 py-2 transform hover:scale-105 transition-transform duration-200"
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{achievement.emoji}</span>
                                    <span className="font-bold text-gray-800 text-sm">
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
