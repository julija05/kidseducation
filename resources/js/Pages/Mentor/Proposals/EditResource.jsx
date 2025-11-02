import MentorLayout from "@/Layouts/MentorLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { Edit, ArrowLeft, Loader2 } from "lucide-react";

export default function EditResource({ resource }) {
    const { data, setData, put, processing, errors } = useForm({
        proposed_title: resource.title,
        proposed_description: resource.description || '',
        proposed_resource_type: resource.resource_type,
        proposed_youtube_url: resource.youtube_url || '',
        proposed_order: resource.order || '',
        mentor_notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('mentor.proposals.resources.update', resource.id));
    };

    return (
        <MentorLayout>
            <Head title={`Propose Update - ${resource.title}`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.get(route('mentor.programs.view', resource.lesson.program_id))}
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
                                    Propose Resource Update
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    For lesson: <span className="font-semibold">{resource.lesson.title}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Original Values Display */}
                    <div className="bg-slate-100 rounded-xl border-2 border-slate-300 p-6 mb-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">CURRENT VALUES</h3>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-semibold">Title:</span> {resource.title}</div>
                            <div><span className="font-semibold">Description:</span> {resource.description || 'None'}</div>
                            <div><span className="font-semibold">Type:</span> {resource.resource_type}</div>
                            {resource.youtube_url && (
                                <div><span className="font-semibold">URL:</span> {resource.youtube_url}</div>
                            )}
                            <div><span className="font-semibold">Order:</span> {resource.order || 'Auto'}</div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6">
                        <p className="text-sm text-slate-600 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            Edit the fields you want to change. Leave unchanged fields as they are.
                        </p>

                        {/* Resource Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Resource Title
                            </label>
                            <input
                                type="text"
                                value={data.proposed_title}
                                onChange={(e) => setData('proposed_title', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
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
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
                                rows="4"
                            />
                            {errors.proposed_description && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_description}</p>
                            )}
                        </div>

                        {/* Resource Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Resource Type
                            </label>
                            <select
                                value={data.proposed_resource_type}
                                onChange={(e) => setData('proposed_resource_type', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
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
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
                                />
                                {errors.proposed_youtube_url && (
                                    <p className="text-red-600 text-sm mt-1">{errors.proposed_youtube_url}</p>
                                )}
                            </div>
                        )}

                        {/* Order */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Order
                            </label>
                            <input
                                type="number"
                                value={data.proposed_order}
                                onChange={(e) => setData('proposed_order', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
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
                                onClick={() => router.get(route('mentor.programs.view', resource.lesson.program_id))}
                                className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                                <span className="font-semibold">Note:</span> This proposal will be sent to administrators for review.
                                The original resource will remain unchanged until the proposal is approved.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </MentorLayout>
    );
}
