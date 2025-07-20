import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import FormField from '@/Components/Form/FormField';
import MentalArithmeticBuilder from '@/Components/Quiz/MentalArithmeticBuilder';
import { ArrowLeft, Save, Info } from 'lucide-react';

export default function EditQuiz({ quiz, lessons, quiz_types }) {
    const { data, setData, put, processing, errors } = useForm({
        lesson_id: quiz.lesson_id || '',
        title: quiz.title || '',
        description: quiz.description || '',
        type: quiz.type || 'mental_arithmetic',
        time_limit: quiz.time_limit || '',
        question_time_limit: quiz.question_time_limit || '',
        max_attempts: quiz.max_attempts || 3,
        passing_score: quiz.passing_score || 70,
        show_results_immediately: quiz.show_results_immediately ?? true,
        shuffle_questions: quiz.shuffle_questions ?? false,
        shuffle_answers: quiz.shuffle_answers ?? false,
        is_active: quiz.is_active ?? true,
        settings: {
            operations: ['addition', 'subtraction'],
            number_range: { min: 1, max: 10 },
            display_time: 5,
            numbers_per_session: 5,
            session_count: 3,
            allow_negative: true,
            points_per_session: 10,
            ...quiz.settings,  // Preserve existing settings, overriding defaults
        },
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.quizzes.update', quiz.id));
    };

    const getTypeDescription = (type) => {
        const descriptions = {
            mental_arithmetic: 'Timed number sequences where students calculate the final result',
            multiple_choice: 'Questions with predefined answer choices',
            text_answer: 'Open-ended questions requiring written answers',
            true_false: 'Simple true or false questions',
            mixed: 'Combination of different question types'
        };
        return descriptions[type] || '';
    };

    return (
        <AdminLayout>
            <Head title={`Edit Quiz: ${quiz.title}`} />

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                            <Link
                                href={route('admin.quizzes.show', quiz.id)}
                                className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Quiz
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Edit Quiz: {quiz.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Update quiz settings and configuration
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="Lesson"
                                    name="lesson_id"
                                    type="select"
                                    value={data.lesson_id}
                                    onChange={(e) => setData('lesson_id', e.target.value)}
                                    error={errors.lesson_id}
                                    required
                                >
                                    <option value="">Select a lesson</option>
                                    {lessons.map((lesson) => (
                                        <option key={lesson.id} value={lesson.id}>
                                            {lesson.display_name}
                                        </option>
                                    ))}
                                </FormField>

                                <FormField
                                    label="Quiz Type"
                                    name="type"
                                    type="select"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    error={errors.type}
                                    required
                                >
                                    {Object.entries(quiz_types).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </FormField>
                            </div>

                            {data.type && (
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <div className="flex">
                                        <Info className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-medium text-blue-800">
                                                {quiz_types[data.type]}
                                            </h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                {getTypeDescription(data.type)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <FormField
                                label="Quiz Title"
                                name="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                error={errors.title}
                                placeholder="Enter quiz title"
                                required
                            />

                            <FormField
                                label="Description"
                                name="description"
                                type="textarea"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                error={errors.description}
                                placeholder="Brief description of the quiz (optional)"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Quiz Settings</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    label="Max Attempts"
                                    name="max_attempts"
                                    type="number"
                                    value={data.max_attempts}
                                    onChange={(e) => setData('max_attempts', parseInt(e.target.value))}
                                    error={errors.max_attempts}
                                    min="1"
                                    max="10"
                                    required
                                />

                                <FormField
                                    label="Passing Score (%)"
                                    name="passing_score"
                                    type="number"
                                    value={data.passing_score}
                                    onChange={(e) => setData('passing_score', parseFloat(e.target.value))}
                                    error={errors.passing_score}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    required
                                />

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                        Active Quiz
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="Total Time Limit (seconds)"
                                    name="time_limit"
                                    type="number"
                                    value={data.time_limit}
                                    onChange={(e) => setData('time_limit', e.target.value ? parseInt(e.target.value) : '')}
                                    error={errors.time_limit}
                                    min="1"
                                    max="7200"
                                    placeholder="Leave empty for no time limit"
                                />

                                <FormField
                                    label="Time per Question (seconds)"
                                    name="question_time_limit"
                                    type="number"
                                    value={data.question_time_limit}
                                    onChange={(e) => setData('question_time_limit', e.target.value ? parseInt(e.target.value) : '')}
                                    error={errors.question_time_limit}
                                    min="1"
                                    max="300"
                                    placeholder="Leave empty for no limit"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center text-lg font-medium text-gray-900 hover:text-gray-700"
                            >
                                Advanced Options
                                <svg
                                    className={`ml-2 h-5 w-5 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                        {showAdvanced && (
                            <div className="px-6 py-4 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="show_results_immediately"
                                            checked={data.show_results_immediately}
                                            onChange={(e) => setData('show_results_immediately', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="show_results_immediately" className="ml-2 block text-sm text-gray-900">
                                            Show results immediately after completion
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="shuffle_questions"
                                            checked={data.shuffle_questions}
                                            onChange={(e) => setData('shuffle_questions', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="shuffle_questions" className="ml-2 block text-sm text-gray-900">
                                            Randomize question order
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="shuffle_answers"
                                            checked={data.shuffle_answers}
                                            onChange={(e) => setData('shuffle_answers', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="shuffle_answers" className="ml-2 block text-sm text-gray-900">
                                            Randomize answer choices (for multiple choice)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mental Arithmetic Settings */}
                    {data.type === 'mental_arithmetic' && (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Mental Arithmetic Settings</h3>
                                <p className="text-sm text-gray-500 mt-1">Configure how numbers are displayed and operations are performed</p>
                            </div>
                            <div className="px-6 py-4">
                                <MentalArithmeticBuilder
                                    formData={data}
                                    onChange={setData}
                                    errors={errors}
                                    onGenerate={() => {
                                        // This will be handled when creating questions after quiz creation
                                        console.log('Generate preview - will be available after quiz creation');
                                    }}
                                    isGenerating={false}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <Link
                            href={route('admin.quizzes.show', quiz.id)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}