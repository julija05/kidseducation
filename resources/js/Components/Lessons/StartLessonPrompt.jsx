import React from "react";
import { Play } from "lucide-react";
import { Card } from "@/Components/StudentDashboard";

/**
 * StartLessonPrompt - Call to action shown before a lesson has been started.
 *
 * @param {function} onStart - Called when the learner starts the lesson
 * @param {boolean} isLoading - Whether the start request is in flight
 */
export default function StartLessonPrompt({ onStart, isLoading }) {
    return (
        <Card as="section" surface="alt" className="p-10 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-aba-surface text-aba-blue shadow-aba-sm">
                <Play className="h-6 w-6 fill-current" />
            </span>
            <h3 className="font-display text-2xl font-black text-aba-ink">
                Ready to start this lesson?
            </h3>
            <p className="mt-1 text-sm font-semibold text-aba-ink-soft">
                Jump in and keep your learning adventure going.
            </p>
            <button
                type="button"
                onClick={onStart}
                disabled={isLoading}
                className="mt-5 inline-flex items-center gap-2 rounded-aba-sm bg-aba-coral px-5 py-3 text-sm font-black text-white shadow-aba-coral transition hover:bg-aba-coral-dark focus:outline-none focus:ring-2 focus:ring-aba-coral focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isLoading ? "Starting..." : "Start Lesson"}
                <Play size={16} />
            </button>
        </Card>
    );
}
