import MentorLayout from "@/Layouts/MentorLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";

/**
 * CreateProgram Component
 * Allows mentors to propose a new educational program
 */
export default function CreateProgram() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        duration: '',
        price: '',
        requires_monthly_payment: false,
        duration_weeks: '',
        icon: 'BookOpen',
        color: 'bg-blue-600',
        light_color: 'bg-blue-100',
        border_color: 'border-blue-300',
        text_color: 'text-blue-900',
    });

    /**
     * Handle form submission
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mentor.proposals.programs.store'));
    };

    return (
        <MentorLayout>
            <Head title="Propose New Program" />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.get(route('mentor.proposals.programs.my-programs'))}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to My Programs
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">
                                    Propose New Program
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    Submit your program idea for admin review
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-slate-200 p-8 space-y-6">
                        {/* Program Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Program Name *
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                placeholder="e.g., Advanced Python Programming"
                                required
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                Description *
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                rows="6"
                                placeholder="Describe what students will learn in this program..."
                                required
                            />
                            {errors.description && (
                                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                            )}
                        </div>

                        {/* Duration and Price Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Duration *
                                </label>
                                <input
                                    type="text"
                                    value={data.duration}
                                    onChange={(e) => setData('duration', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                    placeholder="e.g., 3 months"
                                    required
                                />
                                {errors.duration && (
                                    <p className="text-red-600 text-sm mt-1">{errors.duration}</p>
                                )}
                            </div>

                            {/* Duration in Weeks */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Duration (Weeks)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.duration_weeks}
                                    onChange={(e) => setData('duration_weeks', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                    placeholder="e.g., 12"
                                />
                                {errors.duration_weeks && (
                                    <p className="text-red-600 text-sm mt-1">{errors.duration_weeks}</p>
                                )}
                            </div>
                        </div>

                        {/* Price and Payment Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Price */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Price * ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                    placeholder="49.99"
                                    required
                                />
                                {errors.price && (
                                    <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                                )}
                            </div>

                            {/* Monthly Payment */}
                            <div className="flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.requires_monthly_payment}
                                        onChange={(e) => setData('requires_monthly_payment', e.target.checked)}
                                        className="w-5 h-5 border-2 border-slate-200 rounded focus:ring-purple-400"
                                    />
                                    <span className="text-sm font-bold text-slate-900">
                                        Requires Monthly Payment
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Theme Customization */}
                        <div className="border-t-2 border-slate-100 pt-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">
                                Theme Customization (Optional)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Icon */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">
                                        Icon Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                        placeholder="BookOpen"
                                    />
                                    <p className="text-xs text-slate-600 mt-2">
                                        Lucide icon name (e.g., BookOpen, Code, Calculator)
                                    </p>
                                </div>

                                {/* Primary Color */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">
                                        Primary Color
                                    </label>
                                    <input
                                        type="text"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                        placeholder="bg-blue-600"
                                    />
                                    <p className="text-xs text-slate-600 mt-2">
                                        Tailwind class (e.g., bg-blue-600)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center gap-4 pt-6 border-t-2 border-slate-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>Submit Proposal</>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.get(route('mentor.proposals.programs.my-programs'))}
                                className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Info Banner - Two-stage approval process */}
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                            <p className="text-sm font-bold text-purple-900 mb-2">
                                Two-Stage Approval Process:
                            </p>
                            <ol className="text-sm text-purple-800 list-decimal list-inside space-y-1">
                                <li><strong>Initial Review:</strong> An administrator will review your program concept</li>
                                <li><strong>Content Development:</strong> Once approved, you can add lessons and resources</li>
                                <li><strong>Final Review:</strong> Submit your complete program for final approval</li>
                                <li><strong>Published:</strong> After final approval, your program goes live!</li>
                            </ol>
                        </div>
                    </form>
                </div>
            </div>
        </MentorLayout>
    );
}
