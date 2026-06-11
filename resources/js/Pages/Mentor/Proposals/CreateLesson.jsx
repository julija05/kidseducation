import MentorLayout from "@/Layouts/MentorLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { BookOpen, ArrowLeft, Loader2, Save, Plus } from "lucide-react";
import { useState } from "react";

/**
 * CreateLesson Component
 * Allows mentors to add lessons to their programs (including at new levels)
 */
export default function CreateLesson({ program, existingLevels, mode = 'direct', backRoute }) {
    // State to track if user wants to create a new level
    const [createNewLevel, setCreateNewLevel] = useState(existingLevels.length === 0);
    const suggestedNewLevel = existingLevels.length > 0 ? Math.max(...existingLevels) + 1 : 1;

    const { data, setData, post, processing, errors } = useForm({
        proposed_lesson_title: '',
        proposed_lesson_description: '',
        proposed_lesson_level: existingLevels.length > 0 ? existingLevels[0] : 1,
        proposed_lesson_order: '',
        mentor_notes: '',
    });

    const isProposalMode = mode === 'proposal';
    const returnUrl = backRoute || route('mentor.programs.show', program.slug);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mentor.proposals.lessons.store', program.slug));
    };

    /**
     * Handle level mode toggle
     */
    const handleLevelModeChange = (isNewLevel) => {
        setCreateNewLevel(isNewLevel);
        if (isNewLevel) {
            setData('proposed_lesson_level', suggestedNewLevel);
        } else if (existingLevels.length > 0) {
            setData('proposed_lesson_level', existingLevels[0]);
        }
    };

    return (
        <MentorLayout>
            <Head title={`${isProposalMode ? 'Propose Lesson' : 'Add Lesson'} - ${program.name}`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.get(returnUrl)}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Program Dashboard
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">
                                    {isProposalMode ? 'Propose New Lesson' : 'Add New Lesson'}
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    For program: <span className="font-semibold">{program.name}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6">
                        {/* Lesson Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Lesson Title *
                            </label>
                            <input
                                type="text"
                                value={data.proposed_lesson_title}
                                onChange={(e) => setData('proposed_lesson_title', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                placeholder="e.g., Introduction to Loops"
                                required
                            />
                            {errors.proposed_lesson_title && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_lesson_title}</p>
                            )}
                        </div>

                        {/* Lesson Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.proposed_lesson_description}
                                onChange={(e) => setData('proposed_lesson_description', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                rows="5"
                                placeholder="Describe what this lesson will teach..."
                            />
                            {errors.proposed_lesson_description && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_lesson_description}</p>
                            )}
                        </div>

                        {/* Level Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Level *
                            </label>

                            {/* Level Mode Toggle - only show if there are existing levels */}
                            {existingLevels.length > 0 && (
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => handleLevelModeChange(false)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                            !createNewLevel
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        Existing Level
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleLevelModeChange(true)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                                            createNewLevel
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Level
                                    </button>
                                </div>
                            )}

                            {/* Existing Level Select */}
                            {!createNewLevel && existingLevels.length > 0 ? (
                                <select
                                    value={data.proposed_lesson_level}
                                    onChange={(e) => setData('proposed_lesson_level', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
                                    required
                                >
                                    {existingLevels.map(level => (
                                        <option key={level} value={level}>
                                            Level {level}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                /* New Level Input */
                                <div>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.proposed_lesson_level}
                                        onChange={(e) => setData('proposed_lesson_level', parseInt(e.target.value) || 1)}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
                                        placeholder={suggestedNewLevel.toString()}
                                        required
                                    />
                                    {createNewLevel && existingLevels.length > 0 && (
                                        <p className="text-xs text-blue-600 mt-2">
                                            Creating a new level. Suggested: Level {suggestedNewLevel}
                                        </p>
                                    )}
                                </div>
                            )}
                            {errors.proposed_lesson_level && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_lesson_level}</p>
                            )}
                            <p className="text-xs text-slate-600 mt-2">
                                {existingLevels.length > 0
                                    ? createNewLevel
                                        ? 'Enter a new level number to create it'
                                        : `Current levels: ${existingLevels.join(', ')}`
                                    : 'Enter a level number (typically starting from 1)'}
                            </p>
                        </div>

                        {/* Order */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Order (Optional)
                            </label>
                            <input
                                type="number"
                                value={data.proposed_lesson_order}
                                onChange={(e) => setData('proposed_lesson_order', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                placeholder="Leave blank for automatic ordering"
                            />
                            {errors.proposed_lesson_order && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_lesson_order}</p>
                            )}
                            <p className="text-xs text-slate-600 mt-2">
                                The order determines the sequence of lessons within the level
                            </p>
                        </div>

                        {isProposalMode && (
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Mentor Notes
                                </label>
                                <textarea
                                    value={data.mentor_notes}
                                    onChange={(e) => setData('mentor_notes', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                    rows="4"
                                    placeholder="Explain why this lesson should be added or what students need from it..."
                                />
                                {errors.mentor_notes && (
                                    <p className="text-red-600 text-sm mt-1">{errors.mentor_notes}</p>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {isProposalMode ? 'Submitting...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {isProposalMode ? 'Submit Proposal' : 'Save Lesson'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.get(returnUrl)}
                                className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                                <span className="font-semibold">Note:</span>{' '}
                                {isProposalMode
                                    ? 'This lesson proposal will be sent to the admin team for review before it appears in the program.'
                                    : 'This lesson will be added directly to your program. After saving, you can add resources and quizzes to this lesson. Everything will be reviewed when you submit your program for final approval.'}
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </MentorLayout>
    );
}
