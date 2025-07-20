import React, { useState } from 'react';
import FormField from '@/Components/Form/FormField';
import { Plus, Trash2, Check, Code, Eye } from 'lucide-react';
import QuestionText from './QuestionText';
import { hasCodeBlocks } from '@/Utils/codeBlockParser';

export default function MultipleChoiceBuilder({ formData, onChange, errors }) {
    const [newOption, setNewOption] = useState('');

    const answerOptions = formData.answer_options || {};
    const optionKeys = Object.keys(answerOptions);

    const addOption = () => {
        if (!newOption.trim()) return;
        
        const newKey = String.fromCharCode(65 + optionKeys.length); // A, B, C, D...
        const newOptions = {
            ...answerOptions,
            [newKey]: newOption.trim()
        };
        
        onChange('answer_options', newOptions);
        setNewOption('');
    };

    const updateOption = (key, value) => {
        const newOptions = { ...answerOptions };
        newOptions[key] = value;
        onChange('answer_options', newOptions);
    };

    const removeOption = (key) => {
        const newOptions = { ...answerOptions };
        delete newOptions[key];
        
        // Reorder remaining options
        const reorderedOptions = {};
        Object.values(newOptions).forEach((value, index) => {
            const newKey = String.fromCharCode(65 + index);
            reorderedOptions[newKey] = value;
        });
        
        onChange('answer_options', reorderedOptions);
        
        // Clear correct answer if it was the removed option
        if (formData.correct_answer === key) {
            onChange('correct_answer', '');
        }
    };

    const setCorrectAnswer = (key) => {
        onChange('correct_answer', key);
    };

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
                    placeholder="Enter your multiple choice question here..."
                    rows={6}
                    required
                />
                
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-3">
                    <div className="flex">
                        <Code className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
                        <div className="text-sm text-amber-700">
                            <p className="font-medium">Code Block Support:</p>
                            <ul className="mt-1 list-disc list-inside space-y-1">
                                <li>Use <code className="bg-amber-100 px-1 rounded">```language</code> for code blocks</li>
                                <li>Use <code className="bg-amber-100 px-1 rounded">`code`</code> for inline code</li>
                                <li>Supported languages: javascript, python, java, cpp, html, css, sql</li>
                                <li>Example: <code className="bg-amber-100 px-1 rounded">```javascript\nconsole.log("Hello World");\n```</code></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Answer Options */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Answer Options</h4>
                
                {/* Existing Options */}
                <div className="space-y-3 mb-4">
                    {optionKeys.map((key) => (
                        <div key={key} className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setCorrectAnswer(key)}
                                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                                    formData.correct_answer === key
                                        ? 'bg-green-100 border-green-500 text-green-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                title="Mark as correct answer"
                            >
                                {formData.correct_answer === key && <Check className="w-4 h-4" />}
                                {formData.correct_answer !== key && <span className="text-sm font-medium">{key}</span>}
                            </button>
                            
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={answerOptions[key]}
                                    onChange={(e) => updateOption(key, e.target.value)}
                                    placeholder={`Option ${key}`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => removeOption(key)}
                                className="flex-shrink-0 p-2 text-red-600 hover:text-red-800"
                                title="Remove option"
                                disabled={optionKeys.length <= 2}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add New Option */}
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-400">
                            {String.fromCharCode(65 + optionKeys.length)}
                        </span>
                    </div>
                    
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            placeholder="Add new answer option..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addOption();
                                }
                            }}
                        />
                    </div>
                    
                    <button
                        type="button"
                        onClick={addOption}
                        disabled={!newOption.trim() || optionKeys.length >= 6}
                        className="flex-shrink-0 p-2 text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                        title="Add option"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {optionKeys.length < 2 && (
                    <p className="text-sm text-red-600 mt-2">
                        At least 2 answer options are required.
                    </p>
                )}

                {!formData.correct_answer && optionKeys.length > 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                        Please select the correct answer by clicking on one of the option circles.
                    </p>
                )}

                {errors.answer_options && (
                    <p className="text-sm text-red-600 mt-2">{errors.answer_options}</p>
                )}

                {errors.correct_answer && (
                    <p className="text-sm text-red-600 mt-2">{errors.correct_answer}</p>
                )}
            </div>

            {/* Question Preview */}
            {formData.question_text && optionKeys.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-blue-900 mb-3 flex items-center">
                        <Eye className="w-5 h-5 mr-2" />
                        Question Preview
                        {hasCodeBlocks(formData.question_text) && (
                            <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                                Contains Code
                            </span>
                        )}
                    </h4>
                    <div className="bg-white border border-blue-200 rounded-md p-4">
                        <div className="mb-4">
                            <div className="text-lg font-medium text-gray-900 mb-3">
                                <QuestionText text={formData.question_text} showCopy={false} />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            {optionKeys.map((key) => (
                                <div 
                                    key={key} 
                                    className={`flex items-center p-3 border rounded-md ${
                                        formData.correct_answer === key
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                        {key}
                                    </span>
                                    <span className="text-gray-900">{answerOptions[key]}</span>
                                    {formData.correct_answer === key && (
                                        <Check className="w-4 h-4 text-green-600 ml-auto" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}