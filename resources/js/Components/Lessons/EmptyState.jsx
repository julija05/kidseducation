import React from "react";
import { Head, router } from "@inertiajs/react";
import { BookOpen } from "lucide-react";
import { Card } from "@/Components/StudentDashboard";

/**
 * EmptyState - Shown when the requested lesson could not be loaded.
 */
export default function EmptyState() {
    return (
        <>
            <Head title="Lesson Not Found" />
            <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
                <Card surface="alt" className="p-10 text-center">
                    <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-aba-surface text-aba-blue shadow-aba-sm">
                        <BookOpen className="h-6 w-6" />
                    </span>
                    <h1 className="font-display text-2xl font-black text-aba-ink">
                        Lesson Not Found
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-aba-ink-soft">
                        The lesson you're looking for doesn't exist or couldn't
                        be loaded.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.visit(route("dashboard"))}
                        className="mt-5 inline-flex items-center gap-2 rounded-aba-sm bg-aba-coral px-5 py-3 text-sm font-black text-white shadow-aba-coral transition hover:bg-aba-coral-dark focus:outline-none focus:ring-2 focus:ring-aba-coral focus:ring-offset-2"
                    >
                        Back to Dashboard
                    </button>
                </Card>
            </div>
        </>
    );
}
