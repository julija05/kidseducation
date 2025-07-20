import React from 'react';
import FormField from '@/Components/Form/FormField';
import { Check, X } from 'lucide-react';

export default function TrueFalseBuilder({ formData, onChange, errors }) {
    const correctAnswer = formData.correct_answer;

    const setCorrectAnswer = (answer) => {
        onChange('correct_answer', answer);
    };

    return (
        <div className="space-y-6">
            {/* Question Text */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Question Content</h4>
                
                <FormField
                    label="Question Statement"
                    name="question_text"
                    type="textarea"
                    value={formData.question_text}
                    onChange={(e) => onChange('question_text', e.target.value)}
                    error={errors.question_text}
                    placeholder="Write a statement that can be answered with True or False..."
                    rows={3}
                    required
                />
            </div>

            {/* Correct Answer Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Correct Answer</h4>
                
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setCorrectAnswer('true')}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                            correctAnswer === 'true'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        <div className="flex items-center justify-center mb-2">
                            <Check className="w-8 h-8" />
                        </div>
                        <div className="text-lg font-medium">True</div>
                        <div className="text-sm text-gray-500 mt-1">
                            The statement is correct
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCorrectAnswer('false')}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                            correctAnswer === 'false'
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        <div className="flex items-center justify-center mb-2">
                            <X className="w-8 h-8" />
                        </div>
                        <div className="text-lg font-medium">False</div>
                        <div className="text-sm text-gray-500 mt-1">
                            The statement is incorrect
                        </div>
                    </button>
                </div>

                {!correctAnswer && (
                    <p className="text-sm text-red-600 mt-3">
                        Please select whether the statement is True or False.
                    </p>
                )}

                {errors.correct_answer && (
                    <p className="text-sm text-red-600 mt-3">{errors.correct_answer}</p>
                )}
            </div>

            {/* Question Preview */}
            {formData.question_text && (
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-blue-900 mb-3">Question Preview</h4>
                    <div className="bg-white border border-blue-200 rounded-md p-4">
                        <div className="mb-4">
                            <h5 className="text-lg font-medium text-gray-900 mb-4">
                                {formData.question_text}
                            </h5>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 border rounded-md text-center ${
                                correctAnswer === 'true'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200'
                            }`}>
                                <div className="flex items-center justify-center mb-1">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div className="font-medium">True</div>
                                {correctAnswer === 'true' && (
                                    <div className="text-xs text-green-600 mt-1">✓ Correct</div>
                                )}
                            </div>

                            <div className={`p-3 border rounded-md text-center ${
                                correctAnswer === 'false'
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200'
                            }`}>
                                <div className="flex items-center justify-center mb-1">
                                    <X className="w-5 h-5" />
                                </div>
                                <div className="font-medium">False</div>
                                {correctAnswer === 'false' && (
                                    <div className="text-xs text-red-600 mt-1">✓ Correct</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}