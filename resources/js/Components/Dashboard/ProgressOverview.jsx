// resources/js/Components/Dashboard/ProgressOverview.jsx
import React from "react";
import { Calendar } from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";

export default function ProgressOverview({ enrolledProgram, nextClass }) {
    const ProgramIcon =
        iconMap[enrolledProgram.theme?.icon] || iconMap.BookOpen;

    // Ensure progress is a valid number
    const progressPercentage = Math.max(
        0,
        Math.min(100, enrolledProgram.progress || 0)
    );

    // Debug logging
    console.log("ProgressOverview - enrolled program:", enrolledProgram);
    console.log("Progress percentage:", progressPercentage);
    console.log("Theme color:", enrolledProgram.theme?.color);

    // Get the actual hex color value from the theme color class
    const getProgressBarColor = () => {
        const themeColor = enrolledProgram.theme?.color;

        // Map CSS classes to actual hex colors
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

    console.log("Progress bar color:", progressBarColor);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Overall Progress
                </h3>
                <div className="flex items-center">
                    <div className="flex-1">
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-4 text-xs flex rounded-lg bg-gray-200">
                                <div
                                    style={{
                                        width: `${progressPercentage}%`,
                                        backgroundColor: progressBarColor,
                                        transition: "all 0.5s ease-out",
                                    }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-lg"
                                >
                                    {/* Show percentage inside bar if there's enough space */}
                                    {progressPercentage > 20 && (
                                        <span className="text-xs font-medium text-white">
                                            {Math.round(progressPercentage)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <span
                        className={`ml-3 text-lg font-semibold`}
                        style={{
                            color: progressBarColor,
                        }}
                    >
                        {Math.round(progressPercentage)}%
                    </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    {progressPercentage === 0 && "Just getting started! 🚀"}
                    {progressPercentage > 0 &&
                        progressPercentage < 25 &&
                        "Making progress! 📈"}
                    {progressPercentage >= 25 &&
                        progressPercentage < 50 &&
                        "Quarter way there! 💪"}
                    {progressPercentage >= 50 &&
                        progressPercentage < 75 &&
                        "Halfway complete! 🎯"}
                    {progressPercentage >= 75 &&
                        progressPercentage < 100 &&
                        "Almost finished! 🏃‍♂️"}
                    {progressPercentage === 100 && "Course completed! 🎉"}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Next Class
                </h3>
                <div className="flex items-center">
                    <Calendar
                        className="mr-2"
                        size={20}
                        style={{
                            color: progressBarColor,
                        }}
                    />
                    <span className="text-lg font-semibold">
                        {nextClass || "To be scheduled"}
                    </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    {nextClass
                        ? "Don't forget to attend! 📅"
                        : "We'll notify you when scheduled"}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Current Program
                </h3>
                <div className="flex items-center">
                    <ProgramIcon
                        className="mr-2"
                        size={20}
                        style={{
                            color: progressBarColor,
                        }}
                    />
                    <span className="text-lg font-semibold">
                        {enrolledProgram.name}
                    </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    Level {enrolledProgram.currentLevel || 1} of{" "}
                    {enrolledProgram.totalLevels || "N/A"}
                </div>
            </div>
        </div>
    );
}
