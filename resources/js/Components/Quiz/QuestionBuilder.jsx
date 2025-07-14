import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import FormField from '@/Components/Form/FormField';
import MentalArithmeticBuilder from './MentalArithmeticBuilder';
import MultipleChoiceBuilder from './MultipleChoiceBuilder';
import TextAnswerBuilder from './TextAnswerBuilder';
import TrueFalseBuilder from './TrueFalseBuilder';
import { X, Save, RefreshCw } from 'lucide-react';

export default function QuestionBuilder({ quiz, question = null, quizTypes, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        type: question?.type || quiz.type || 'mental_arithmetic',
        question_text: question?.question_text || '',
        question_data: question?.question_data || {},
        answer_options: question?.answer_options || {},
        correct_answer: question?.correct_answer || '',
        explanation: question?.explanation || '',
        points: question?.points || 1,
        time_limit: question?.time_limit || '',
        settings: question?.settings || {},
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const isEditing = !!question;

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const url = isEditing 
                ? route('admin.quizzes.questions.update', [quiz.id, question.id])
                : route('admin.quizzes.questions.store', quiz.id);

            const method = isEditing ? 'put' : 'post';
            
            router[method](url, {
                ...formData,
                order: question?.order || (quiz.questions?.length || 0) + 1,
            }, {
                onSuccess: () => {
                    onSave();
                },
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);
                },
                preserveScroll: true,
            });
        } catch (error) {
            console.error('Error saving question:', error);
            setIsSubmitting(false);
        }
    };

    const generateMentalArithmeticQuestion = async () => {
        if (formData.type !== 'mental_arithmetic') return;
        
        setIsGenerating(true);
        try {
            const response = await fetch(route('admin.quizzes.generate-question', quiz.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    difficulty: formData.settings.difficulty || 1,
                    operations: formData.settings.operations || ['addition', 'subtraction'],
                    number_range: formData.settings.number_range || { min: 1, max: 10 },
                    sequence_length: formData.settings.sequence_length || 4,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    question_text: `Calculate the result of: ${data.question_data.display_sequence}`,
                    question_data: data.question_data,
                    correct_answer: data.question_data.correct_answer,
                }));
            }
        } catch (error) {
            console.error('Error generating question:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const renderTypeSpecificBuilder = () => {
        const commonProps = {
            formData,
            onChange: handleFieldChange,
            errors,
        };

        switch (formData.type) {
            case 'mental_arithmetic':
                return (
                    <MentalArithmeticBuilder 
                        {...commonProps}
                        onGenerate={generateMentalArithmeticQuestion}
                        isGenerating={isGenerating}
                    />
                );
            case 'multiple_choice':
                return <MultipleChoiceBuilder {...commonProps} />;
            case 'text_answer':
                return <TextAnswerBuilder {...commonProps} />;
            case 'true_false':
                return <TrueFalseBuilder {...commonProps} />;
            default:
                return <div>Question type not supported yet.</div>;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        {isEditing ? 'Edit Question' : 'Add New Question'}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Question Settings */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Question Settings</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                label="Question Type"
                                name="type"
                                type="select"
                                value={formData.type}
                                onChange={(e) => handleFieldChange('type', e.target.value)}
                                error={errors.type}
                                required
                            >
                                {Object.entries(quizTypes).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </FormField>

                            <FormField
                                label="Points"
                                name="points"
                                type="number"
                                value={formData.points}
                                onChange={(e) => handleFieldChange('points', parseFloat(e.target.value))}
                                error={errors.points}
                                min="0.01"
                                step="0.01"
                                required
                            />

                            <FormField
                                label="Time Limit (seconds)"
                                name="time_limit"
                                type="number"
                                value={formData.time_limit}
                                onChange={(e) => handleFieldChange('time_limit', e.target.value ? parseInt(e.target.value) : '')}
                                error={errors.time_limit}
                                min="1"
                                max="300"
                                placeholder="Use quiz default"
                            />
                        </div>
                    </div>

                    {/* Type-specific content */}
                    {renderTypeSpecificBuilder()}

                    {/* Explanation */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <FormField
                            label="Explanation (Optional)"
                            name="explanation"
                            type="textarea"
                            value={formData.explanation}
                            onChange={(e) => handleFieldChange('explanation', e.target.value)}
                            error={errors.explanation}
                            placeholder="Provide an explanation for the correct answer..."
                            rows={3}
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Question' : 'Add Question')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}