import React from "react";
import { Play } from "lucide-react";

export default function StartLessonPrompt({ onStart, isLoading }) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h3 className="text-xl font-semibold mb-4">
                Ready to start this lesson?
            </h3>
            <button
                onClick={onStart}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                {isLoading ? "Starting..." : "Start Lesson"}
                <Play size={16} className="ml-2" />
            </button>
        </div>
    );
}
