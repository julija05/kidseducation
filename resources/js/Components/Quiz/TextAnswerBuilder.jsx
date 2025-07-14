import React from 'react';
import FormField from '@/Components/Form/FormField';
import { Info } from 'lucide-react';

export default function TextAnswerBuilder({ formData, onChange, errors }) {
    const handleSettingsChange = (setting, value) => {
        const newSettings = { ...formData.settings, [setting]: value };
        onChange('settings', newSettings);
    };

    const placeholder = formData.settings?.placeholder || 'Enter your answer here...';
    const caseSensitive = formData.settings?.case_sensitive || false;
    const allowPartialCredit = formData.settings?.allow_partial_credit || false;

    return (
        <div className="space-y-6">
            {/* Question Text */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Question Content</h4>
                
                <FormField
                    label="Question Text"
                    name="question_text"
                    type="textarea"
                    value={formData.question_text}
                    onChange={(e) => onChange('question_text', e.target.value)}
                    error={errors.question_text}
                    placeholder="Enter your open-ended question here..."
                    rows={3}
                    required
                />

                <div className="mt-4">
                    <FormField
                        label="Correct Answer"
                        name="correct_answer"
                        type="text"
                        value={formData.correct_answer}
                        onChange={(e) => onChange('correct_answer', e.target.value)}
                        error={errors.correct_answer}
                        placeholder="Enter the correct answer or one possible correct answer..."
                        required
                    />
                </div>
            </div>

            {/* Answer Settings */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Answer Settings</h4>
                
                <div className="space-y-4">
                    <FormField
                        label="Input Placeholder"
                        name="placeholder"
                        type="text"
                        value={placeholder}
                        onChange={(e) => handleSettingsChange('placeholder', e.target.value)}
                        placeholder="Placeholder text for the answer input..."
                    />

                    <div className="space-y-3">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="case_sensitive"
                                checked={caseSensitive}
                                onChange={(e) => handleSettingsChange('case_sensitive', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="case_sensitive" className="ml-2 block text-sm text-gray-900">
                                Case sensitive answer
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="allow_partial_credit"
                                checked={allowPartialCredit}
                                onChange={(e) => handleSettingsChange('allow_partial_credit', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="allow_partial_credit" className="ml-2 block text-sm text-gray-900">
                                Allow partial credit for similar answers
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex">
                        <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                        <div className="text-sm text-blue-700">
                            <p className="font-medium">Text Answer Guidelines:</p>
                            <ul className="mt-1 list-disc list-inside space-y-1">
                                <li>Provide a clear, specific correct answer</li>
                                <li>Consider enabling case sensitivity for exact matches</li>
                                <li>Partial credit can help with minor spelling differences</li>
                                <li>Questions should have one clear, unambiguous answer</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alternative Answers */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Alternative Correct Answers (Optional)</h4>
                
                <FormField
                    label="Alternative Answers"
                    name="alternative_answers"
                    type="textarea"
                    value={formData.settings?.alternative_answers || ''}
                    onChange={(e) => handleSettingsChange('alternative_answers', e.target.value)}
                    placeholder="Enter alternative correct answers, one per line..."
                    rows={3}
                />
                
                <p className="text-sm text-gray-500 mt-2">
                    List other acceptable answers, one per line. These will be considered correct along with the main answer.
                </p>
            </div>

            {/* Question Preview */}
            {formData.question_text && (
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-blue-900 mb-3">Question Preview</h4>
                    <div className="bg-white border border-blue-200 rounded-md p-4">
                        <div className="mb-4">
                            <h5 className="text-lg font-medium text-gray-900 mb-3">
                                {formData.question_text}
                            </h5>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Answer:
                            </label>
                            <input
                                type="text"
                                placeholder={placeholder}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                            />
                        </div>

                        <div className="text-sm text-gray-600">
                            <p><strong>Correct Answer:</strong> {formData.correct_answer}</p>
                            {caseSensitive && (
                                <p className="text-amber-600 mt-1">
                                    <strong>Note:</strong> Answer is case sensitive
                                </p>
                            )}
                            {allowPartialCredit && (
                                <p className="text-green-600 mt-1">
                                    <strong>Note:</strong> Partial credit available for similar answers
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}