import MentorLayout from "@/Layouts/MentorLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { FileQuestion, ArrowLeft, Loader2, Info } from "lucide-react";

/**
 * CreateQuiz Component
 * Form for mentors to create a new quiz for a lesson
 */
export default function Create({ lesson }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        type: 'practice',
        time_limit: '',
        max_attempts: '',
        passing_score: '',
        show_results_immediately: true,
        shuffle_questions: false,
        shuffle_answers: false,
    });

    /**
     * Handle form submission
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mentor.quizzes.store', lesson.id));
    };

    return (
        <MentorLayout>
            <Head title={`Create Quiz - ${lesson.title}`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.get(route('mentor.programs.content', lesson.program.slug))}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Program Content
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <FileQuestion className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">
                                    Create Quiz
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    For lesson: <span className="font-semibold">{lesson.title}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6">
                        {/* Quiz Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Quiz Title *
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                placeholder="e.g., Variables and Data Types Quiz"
                                required
                            />
                            {errors.title && (
                                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* Quiz Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                rows="4"
                                placeholder="Describe what this quiz covers..."
                            />
                            {errors.description && (
                                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                            )}
                        </div>

                        {/* Quiz Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Quiz Type *
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                required
                            >
                                <option value="practice">Practice Quiz (no grades)</option>
                                <option value="graded">Graded Quiz</option>
                            </select>
                            {errors.type && (
                                <p className="text-red-600 text-sm mt-1">{errors.type}</p>
                            )}
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Time Limit */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Time Limit (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.time_limit}
                                    onChange={(e) => setData('time_limit', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                    placeholder="Leave empty for no limit"
                                />
                                {errors.time_limit && (
                                    <p className="text-red-600 text-sm mt-1">{errors.time_limit}</p>
                                )}
                            </div>

                            {/* Max Attempts */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Max Attempts
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.max_attempts}
                                    onChange={(e) => setData('max_attempts', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                    placeholder="Leave empty for unlimited"
                                />
                                {errors.max_attempts && (
                                    <p className="text-red-600 text-sm mt-1">{errors.max_attempts}</p>
                                )}
                            </div>
                        </div>

                        {/* Passing Score (only for graded quizzes) */}
                        {data.type === 'graded' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Passing Score (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.passing_score}
                                    onChange={(e) => setData('passing_score', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                    placeholder="e.g., 70"
                                />
                                {errors.passing_score && (
                                    <p className="text-red-600 text-sm mt-1">{errors.passing_score}</p>
                                )}
                            </div>
                        )}

                        {/* Boolean Options */}
                        <div className="space-y-4 pt-4 border-t-2 border-slate-200">
                            <h3 className="font-bold text-slate-900">Quiz Options</h3>

                            {/* Show Results Immediately */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={data.show_results_immediately}
                                    onChange={(e) => setData('show_results_immediately', e.target.checked)}
                                    className="mt-1 w-5 h-5 text-purple-500 rounded border-2 border-slate-300 focus:ring-2 focus:ring-purple-400"
                                />
                                <div>
                                    <span className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                                        Show results immediately
                                    </span>
                                    <p className="text-sm text-slate-600">
                                        Students will see their score and correct answers right after completing the quiz
                                    </p>
                                </div>
                            </label>

                            {/* Shuffle Questions */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={data.shuffle_questions}
                                    onChange={(e) => setData('shuffle_questions', e.target.checked)}
                                    className="mt-1 w-5 h-5 text-purple-500 rounded border-2 border-slate-300 focus:ring-2 focus:ring-purple-400"
                                />
                                <div>
                                    <span className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                                        Shuffle questions
                                    </span>
                                    <p className="text-sm text-slate-600">
                                        Questions will appear in random order for each student
                                    </p>
                                </div>
                            </label>

                            {/* Shuffle Answers */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={data.shuffle_answers}
                                    onChange={(e) => setData('shuffle_answers', e.target.checked)}
                                    className="mt-1 w-5 h-5 text-purple-500 rounded border-2 border-slate-300 focus:ring-2 focus:ring-purple-400"
                                />
                                <div>
                                    <span className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                                        Shuffle answers
                                    </span>
                                    <p className="text-sm text-slate-600">
                                        Answer choices will appear in random order for each student
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating Quiz...
                                    </>
                                ) : (
                                    'Create Quiz'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.get(route('mentor.programs.content', lesson.program.slug))}
                                className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-blue-900">
                                    <span className="font-semibold">Next step:</span> After creating the quiz, you'll be able to add questions to it.
                                    You can add multiple choice, true/false, and short answer questions.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </MentorLayout>
    );
}
