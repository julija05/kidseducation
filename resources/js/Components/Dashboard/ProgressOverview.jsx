// resources/js/Components/Dashboard/ProgressOverview.jsx
import React from "react";
import { Calendar } from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";

export default function ProgressOverview({ enrolledProgram, nextClass }) {
    const ProgramIcon = iconMap[enrolledProgram.theme.icon] || iconMap.BookOpen;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Overall Progress
                </h3>
                <div className="flex items-center">
                    <div className="flex-1">
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                <div
                                    style={{
                                        width: `${enrolledProgram.progress}%`,
                                    }}
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${enrolledProgram.theme.color}`}
                                />
                            </div>
                        </div>
                    </div>
                    <span
                        className={`ml-3 text-lg font-semibold ${enrolledProgram.theme.textColor}`}
                    >
                        {enrolledProgram.progress}%
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Next Class
                </h3>
                <div className="flex items-center">
                    <Calendar
                        className={`mr-2 ${enrolledProgram.theme.textColor}`}
                        size={20}
                    />
                    <span className="text-lg font-semibold">
                        {nextClass || "To be scheduled"}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Current Program
                </h3>
                <div className="flex items-center">
                    <ProgramIcon
                        className={`mr-2 ${enrolledProgram.theme.textColor}`}
                        size={20}
                    />
                    <span className="text-lg font-semibold">
                        {enrolledProgram.name}
                    </span>
                </div>
            </div>
        </div>
    );
}
