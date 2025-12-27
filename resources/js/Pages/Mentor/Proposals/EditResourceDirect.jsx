import MentorLayout from "@/Layouts/MentorLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { FileText, ArrowLeft, Loader2, Save } from "lucide-react";

/**
 * EditResourceDirect Component
 * Allows mentors to edit resources in their programs during content development
 */
export default function EditResourceDirect({ resource, lesson, program }) {
    const { data, setData, post, processing, errors } = useForm({
        title: resource.title || '',
        description: resource.description || '',
        type: resource.type || 'youtube',
        resource_url: resource.resource_url || '',
        order: resource.order || '',
        file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mentor.proposals.resources.update-direct', resource.id), {
            forceFormData: true,
        });
    };

    return (
        <MentorLayout>
            <Head title={`Edit Resource - ${resource.title}`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.get(route('mentor.programs.content', program.slug))}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Program Content
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">
                                    Edit Resource
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
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-400 focus:outline-none"
                                placeholder="e.g., Introduction to Variables"
                                required
                            />
                            {errors.title && (
                                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* Resource Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-400 focus:outline-none"
                                rows="4"
                                placeholder="Describe what this resource covers..."
                            />
                            {errors.description && (
                                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                            )}
                        </div>

                        {/* Resource Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Resource Type *
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-400 focus:outline-none"
                                required
                            >
                                <option value="youtube">YouTube Video</option>
                                <option value="pdf">PDF Document</option>
                                <option value="word">Word Document</option>
                                <option value="document">Document (General)</option>
                                <option value="other">Other File</option>
                            </select>
                            {errors.type && (
                                <p className="text-red-600 text-sm mt-1">{errors.type}</p>
                            )}
                        </div>

                        {/* YouTube URL (conditional) */}
                        {data.type === 'youtube' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    YouTube URL *
                                </label>
                                <input
                                    type="url"
                                    value={data.resource_url}
                                    onChange={(e) => setData('resource_url', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-400 focus:outline-none"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    required
                                />
                                {errors.resource_url && (
                                    <p className="text-red-600 text-sm mt-1">{errors.resource_url}</p>
                                )}
                            </div>
                        )}

                        {/* File Upload (conditional) */}
                        {(data.type === 'pdf' ||
                          data.type === 'word' ||
                          data.type === 'document' ||
                          data.type === 'other') && (
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Upload New File (Optional)
                                </label>
                                {resource.file_name && (
                                    <p className="text-sm text-slate-600 mb-2">
                                        Current file: <span className="font-semibold">{resource.file_name}</span>
                                    </p>
                                )}
                                <input
                                    type="file"
                                    onChange={(e) => setData('file', e.target.files[0])}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-400 focus:outline-none"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                                />
                                {errors.file && (
                                    <p className="text-red-600 text-sm mt-1">{errors.file}</p>
                                )}
                                <p className="text-xs text-slate-600 mt-2">
                                    Leave empty to keep current file. Max file size: 50MB.
                                </p>
                            </div>
                        )}

                        {/* Order */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Order
                            </label>
                            <input
                                type="number"
                                value={data.order}
                                onChange={(e) => setData('order', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-400 focus:outline-none"
                                placeholder="Resource order within the lesson"
                            />
                            {errors.order && (
                                <p className="text-red-600 text-sm mt-1">{errors.order}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.get(route('mentor.programs.content', program.slug))}
                                className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                            <p className="text-sm text-amber-900">
                                <span className="font-semibold">Note:</span> Changes will be saved immediately.
                                Make sure to review your changes before saving.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </MentorLayout>
    );
}
