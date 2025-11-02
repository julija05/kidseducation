import MentorLayout from "@/Layouts/MentorLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { FileText, ArrowLeft, Loader2 } from "lucide-react";

export default function CreateResource({ lesson }) {
    const { data, setData, post, processing, errors } = useForm({
        proposed_title: '',
        proposed_description: '',
        proposed_resource_type: 'youtube',
        proposed_youtube_url: '',
        proposed_order: '',
        mentor_notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mentor.proposals.resources.store', lesson.id));
    };

    return (
        <MentorLayout>
            <Head title={`Propose New Resource - ${lesson.title}`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.get(route('mentor.programs.view', lesson.program.id))}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Program
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">
                                    Propose New Resource
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    For lesson: <span className="font-semibold">{lesson.title}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6">
                        {/* Resource Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Resource Title *
                            </label>
                            <input
                                type="text"
                                value={data.proposed_title}
                                onChange={(e) => setData('proposed_title', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                placeholder="e.g., Introduction to Variables"
                                required
                            />
                            {errors.proposed_title && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_title}</p>
                            )}
                        </div>

                        {/* Resource Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.proposed_description}
                                onChange={(e) => setData('proposed_description', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                rows="4"
                                placeholder="Describe what this resource covers..."
                            />
                            {errors.proposed_description && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_description}</p>
                            )}
                        </div>

                        {/* Resource Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Resource Type *
                            </label>
                            <select
                                value={data.proposed_resource_type}
                                onChange={(e) => setData('proposed_resource_type', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                required
                            >
                                <option value="youtube">YouTube Video</option>
                                <option value="pdf">PDF Document</option>
                                <option value="word">Word Document</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.proposed_resource_type && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_resource_type}</p>
                            )}
                        </div>

                        {/* YouTube URL (conditional) */}
                        {data.proposed_resource_type === 'youtube' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    YouTube URL
                                </label>
                                <input
                                    type="url"
                                    value={data.proposed_youtube_url}
                                    onChange={(e) => setData('proposed_youtube_url', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                                {errors.proposed_youtube_url && (
                                    <p className="text-red-600 text-sm mt-1">{errors.proposed_youtube_url}</p>
                                )}
                            </div>
                        )}

                        {/* Order */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Order (Optional)
                            </label>
                            <input
                                type="number"
                                value={data.proposed_order}
                                onChange={(e) => setData('proposed_order', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                                placeholder="Leave blank for automatic ordering"
                            />
                            {errors.proposed_order && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_order}</p>
                            )}
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
                                    'Submit Proposal'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.get(route('mentor.programs.view', lesson.program.id))}
                                className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                                <span className="font-semibold">Note:</span> This proposal will be sent to administrators for review.
                                You'll be notified once it's been approved or if changes are requested.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </MentorLayout>
    );
}
