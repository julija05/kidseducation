import MentorLayout from "@/Layouts/MentorLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { Layers, ArrowLeft, Loader2 } from "lucide-react";

export default function CreateLevel({ program, suggestedLevel }) {
    const { data, setData, post, processing, errors } = useForm({
        proposed_level_number: suggestedLevel,
        proposed_level_description: '',
        mentor_notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mentor.proposals.levels.store', program.id));
    };

    return (
        <MentorLayout>
            <Head title={`Propose New Level - ${program.name}`} />

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
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">
                                    Propose New Level
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    For program: <span className="font-semibold">{program.name}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6">
                        {/* Level Number */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Level Number *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.proposed_level_number}
                                onChange={(e) => setData('proposed_level_number', parseInt(e.target.value))}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none text-lg font-semibold"
                                required
                            />
                            {errors.proposed_level_number && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_level_number}</p>
                            )}
                            <p className="text-xs text-slate-600 mt-2">
                                Suggested next level: <span className="font-semibold">{suggestedLevel}</span>
                            </p>
                        </div>

                        {/* Level Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Level Description
                            </label>
                            <textarea
                                value={data.proposed_level_description}
                                onChange={(e) => setData('proposed_level_description', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                rows="5"
                                placeholder="Describe what students will learn at this level, difficulty, prerequisites, etc..."
                            />
                            {errors.proposed_level_description && (
                                <p className="text-red-600 text-sm mt-1">{errors.proposed_level_description}</p>
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
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                rows="3"
                                placeholder="Explain the rationale for adding this new level..."
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
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Level Proposal'
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
                                Once approved, you'll be able to create lessons for this new level.
                            </p>
                        </div>

                        {/* Important Warning */}
                        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                            <p className="text-sm text-amber-900">
                                <span className="font-semibold">Important:</span> Make sure the level number doesn't conflict with existing levels.
                                Adding a level between existing levels may require reordering.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </MentorLayout>
    );
}
