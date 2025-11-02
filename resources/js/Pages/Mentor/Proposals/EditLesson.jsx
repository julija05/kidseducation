import MentorLayout from "@/Layouts/MentorLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { Edit, ArrowLeft, Loader2 } from "lucide-react";

export default function EditLesson({ lesson }) {
    const { data, setData, put, processing, errors } = useForm({
        proposed_lesson_title: lesson.title,
        proposed_lesson_description: lesson.description || '',
        proposed_lesson_level: lesson.level,
        proposed_lesson_order: lesson.order || '',
        mentor_notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('mentor.proposals.lessons.update', lesson.id));
    };

    return (
        <MentorLayout>
            <Head title={`Propose Lesson Update - ${lesson.title}`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.get(route('mentor.programs.view', lesson.program_id))}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Program
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <Edit className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">
                                    Propose Lesson Update
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    Current lesson: <span className="font-semibold">{lesson.title}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Original Values Display */}
                    <div className="bg-slate-100 rounded-xl border-2 border-slate-300 p-6 mb-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">CURRENT VALUES</h3>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-semibold">Title:</span> {lesson.title}</div>
                            <div><span className="font-semibold">Description:</span> {lesson.description || 'None'}</div>
                            <div><span className="font-semibold">Level:</span> {lesson.level}</div>
                            <div><span className="font-semibold">Order:</span> {lesson.order || 'Auto'}</div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6">
                        <p className="text-sm text-slate-600 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            Edit the fields you want to change. Leave unchanged fields as they are.
                        </p>

                        {/* Lesson Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Lesson Title
                            </label>
                            <input
                                type="text"
                                value={data.proposed_lesson_title}
                                onChange={(e) => setData('proposed_lesson_title', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
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
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
                                rows="5"
                            />
                            {errors.proposed_lesson_description && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_lesson_description}</p>
                            )}
                        </div>

                        {/* Level */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Level
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.proposed_lesson_level}
                                onChange={(e) => setData('proposed_lesson_level', parseInt(e.target.value))}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
                            />
                            {errors.proposed_lesson_level && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_lesson_level}</p>
                            )}
                            <p className="text-xs text-slate-600 mt-2">
                                Changing the level will move this lesson to a different level group
                            </p>
                        </div>

                        {/* Order */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Order
                            </label>
                            <input
                                type="number"
                                value={data.proposed_lesson_order}
                                onChange={(e) => setData('proposed_lesson_order', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
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
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
                                rows="3"
                                placeholder="Explain why you're proposing these changes..."
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
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Update Proposal'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.get(route('mentor.programs.view', lesson.program_id))}
                                className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                                <span className="font-semibold">Note:</span> This proposal will be sent to administrators for review.
                                The original lesson will remain unchanged until the proposal is approved.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </MentorLayout>
    );
}
