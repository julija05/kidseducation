import MentorLayout from "@/Layouts/MentorLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";

export default function CreateLesson({ program, existingLevels }) {
    const { data, setData, post, processing, errors } = useForm({
        proposed_lesson_title: '',
        proposed_lesson_description: '',
        proposed_lesson_level: existingLevels.length > 0 ? existingLevels[0] : 1,
        proposed_lesson_order: '',
        mentor_notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mentor.proposals.lessons.store', program.id));
    };

    return (
        <MentorLayout>
            <Head title={`Propose New Lesson - ${program.name}`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.get(route('mentor.programs.view', program.id))}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Program
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">
                                    Propose New Lesson
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
                            {existingLevels.length > 0 ? (
                                <select
                                    value={data.proposed_lesson_level}
                                    onChange={(e) => setData('proposed_lesson_level', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                    required
                                >
                                    {existingLevels.map(level => (
                                        <option key={level} value={level}>
                                            Level {level}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="number"
                                    min="1"
                                    value={data.proposed_lesson_level}
                                    onChange={(e) => setData('proposed_lesson_level', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                    placeholder="1"
                                    required
                                />
                            )}
                            {errors.proposed_lesson_level && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_lesson_level}</p>
                            )}
                            <p className="text-xs text-slate-600 mt-2">
                                {existingLevels.length > 0
                                    ? `Select an existing level (${existingLevels.join(', ')})`
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

                        {/* Mentor Notes */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Notes for Admin
                            </label>
                            <textarea
                                value={data.mentor_notes}
                                onChange={(e) => setData('mentor_notes', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                rows="3"
                                placeholder="Any additional context or reasoning for this proposal..."
                            />
                            {errors.mentor_notes && (
                                <p className="text-red-600 text-sm mt-1">{errors.mentor_notes}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Lesson Proposal'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.get(route('mentor.programs.view', program.id))}
                                className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                                <span className="font-semibold">Note:</span> This proposal will be sent to administrators for review.
                                Once approved, the lesson will be created and you can then add resources to it.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </MentorLayout>
    );
}
