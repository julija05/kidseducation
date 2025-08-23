import React from 'react';
import FormField from '@/Components/Form/FormField';
import { RefreshCw, Calculator, Settings, Info } from 'lucide-react';

export default function MentalArithmeticBuilder({ formData, onChange, errors, onGenerate, isGenerating }) {
    // Set default values for mental arithmetic questions
    React.useEffect(() => {
        if (!formData.question_text) {
            onChange('question_text', 'Complete the mental arithmetic flash card sessions');
        }
        if (!formData.correct_answer) {
            onChange('correct_answer', 'flash_card_sessions');
        }
        if (!formData.question_data || Object.keys(formData.question_data).length === 0) {
            onChange('question_data', {
                type: 'flash_card_sessions',
                use_quiz_settings: true
            });
        }
    }, []);

    const handleSettingsChange = (setting, value) => {
        try {
            const currentSettings = formData.settings || {};
            const newSettings = { ...currentSettings, [setting]: value };
            onChange('settings', newSettings);
        } catch (error) {
            console.error('Error in handleSettingsChange:', error);
        }
    };

    const handleOperationsChange = (operation, checked) => {
        const currentOps = formData.settings?.operations || ['addition', 'subtraction'];
        let newOps;
        
        if (checked) {
            newOps = [...currentOps, operation];
        } else {
            newOps = currentOps.filter(op => op !== operation);
        }
        
        // Ensure at least one operation is selected
        if (newOps.length === 0) {
            newOps = ['addition'];
        }
        
        handleSettingsChange('operations', newOps);
    };

    const operations = [
        { key: 'addition', label: 'Addition (+)', description: 'Add positive numbers', difficulty: 1 },
        { key: 'subtraction', label: 'Subtraction (-)', description: 'Subtract numbers (results can be negative)', difficulty: 2 },
        { key: 'multiplication', label: 'Multiplication (×)', description: 'Multiply by small numbers (2-9)', difficulty: 3 },
        { key: 'division', label: 'Division (÷)', description: 'Divide by factors for whole number results', difficulty: 4 },
    ];

    const selectedOperations = formData.settings?.operations || ['addition', 'subtraction'];
    const difficulty = formData.settings?.difficulty || 1;
    const numberRange = formData.settings?.number_range || { min: 1, max: 10 };
    const sequenceLength = formData.settings?.sequence_length || 4;
    const sessionCount = formData.settings?.session_count || 3;
    const numbersPerSession = formData.settings?.numbers_per_session || 5;
    const displayTime = formData.settings?.display_time || 2;

    return (
        <div className="space-y-6">
            {/* Auto-generated Content Info */}
            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                    <Calculator className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="text-md font-medium text-blue-900">Auto-Generated Mental Arithmetic</h4>
                </div>
                <div className="bg-blue-100 border border-blue-200 rounded-md p-3">
                    <div className="flex">
                        <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                        <div className="text-sm text-blue-700">
                            <p className="font-medium">Questions are automatically generated based on your settings below.</p>
                            <p className="mt-1">Students will complete flash card sessions with numbers appearing sequentially according to your configuration.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Generation Settings */}
            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                    <Settings className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="text-md font-medium text-blue-900">Generation Settings</h4>
                </div>

                <div className="bg-blue-100 border border-blue-200 rounded-md p-3 mb-4">
                    <div className="flex">
                        <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                        <div className="text-sm text-blue-700">
                            <p className="font-medium">Flash Card Mental Arithmetic:</p>
                            <p>Students will see {sessionCount} sessions. In each session, numbers appear one by one for {displayTime} seconds each.</p>
                            <p className="mt-1">Students must add all numbers mentally and enter the sum at the end of each session.</p>
                            <p className="mt-1 font-medium">Example: 5 → 3 → 2 → 8 = Answer: 18</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField
                        label="Difficulty Level"
                        name="difficulty"
                        type="select"
                        value={difficulty}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleSettingsChange('difficulty', parseInt(e.target.value));
                        }}
                    >
                        <option value={1}>Level 1 (Easy)</option>
                        <option value={2}>Level 2 (Medium)</option>
                        <option value={3}>Level 3 (Hard)</option>
                        <option value={4}>Level 4 (Expert)</option>
                        <option value={5}>Level 5 (Master)</option>
                    </FormField>

                    <FormField
                        label="Sessions Count"
                        name="session_count"
                        type="number"
                        value={sessionCount}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleSettingsChange('session_count', parseInt(e.target.value));
                        }}
                        min="1"
                        max="10"
                    />

                    <FormField
                        label="Numbers per Session"
                        name="numbers_per_session"
                        type="number"
                        value={numbersPerSession}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleSettingsChange('numbers_per_session', parseInt(e.target.value));
                        }}
                        min="3"
                        max="15"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Display Time Settings */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Time per Number
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[2, 3, 5, 10].map(time => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSettingsChange('display_time', time);
                                    }}
                                    className={`flex items-center justify-center p-3 border rounded-md hover:bg-gray-50 transition-colors ${
                                        displayTime === time ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300'
                                    }`}
                                >
                                    <span className="font-medium">{time}s</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">How long each number is displayed</p>
                    </div>

                    {/* Number Digits Settings */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number Complexity
                        </label>
                        <div className="space-y-2">
                            {[
                                { key: 'single', label: '1 digit (1-9)', range: { min: 1, max: 9 } },
                                { key: 'double', label: '2 digits (10-99)', range: { min: 10, max: 99 } },
                                { key: 'triple', label: '3 digits (100-999)', range: { min: 100, max: 999 } },
                                { key: 'mixed', label: 'Mixed (1-99)', range: { min: 1, max: 99 } }
                            ].map(option => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSettingsChange('number_range', option.range);
                                    }}
                                    className={`flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors w-full text-left ${
                                        (numberRange.min === option.range.min && numberRange.max === option.range.max) 
                                            ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                        (numberRange.min === option.range.min && numberRange.max === option.range.max)
                                            ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                                    }`}>
                                        {(numberRange.min === option.range.min && numberRange.max === option.range.max) && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Custom Number Range */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Number Range (Optional)
                    </label>
                    <div className="grid grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                            <input
                                type="number"
                                placeholder="Min"
                                value={numberRange.min}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleSettingsChange('number_range', {
                                        ...numberRange,
                                        min: parseInt(e.target.value) || 1
                                    });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                min="1"
                                max="999"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                            <input
                                type="number"
                                placeholder="Max"
                                value={numberRange.max}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleSettingsChange('number_range', {
                                        ...numberRange,
                                        max: parseInt(e.target.value) || 10
                                    });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                min="1"
                                max="999"
                            />
                        </div>
                        <div className="text-sm text-gray-600">
                            <p><strong>Time per session:</strong></p>
                            <p>{numbersPerSession * displayTime} seconds</p>
                        </div>
                    </div>
                </div>

                {/* Allow Negative Numbers */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSettingsChange('allow_negative', !(formData.settings?.allow_negative !== false));
                        }}
                        className="flex items-center w-full text-left"
                    >
                        <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                            formData.settings?.allow_negative !== false
                                ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                        }`}>
                            {formData.settings?.allow_negative !== false && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                            Allow negative numbers (subtraction)
                        </span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1 ml-7">
                        When enabled, some numbers will be negative (subtraction operations)
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Mathematical Operations
                    </label>
                    <div className="space-y-4">
                        {/* Quick Operation Presets */}
                        <div>
                            <label className="block text-xs text-gray-600 mb-2 font-medium">Quick Presets:</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                    { key: 'basic', label: 'Basic (+/-)', ops: ['addition', 'subtraction'] },
                                    { key: 'add_only', label: 'Addition Only', ops: ['addition'] },
                                    { key: 'multiply', label: 'Multiply (+/×)', ops: ['addition', 'multiplication'] },
                                    { key: 'all', label: 'All Operations', ops: ['addition', 'subtraction', 'multiplication', 'division'] }
                                ].map(preset => (
                                    <button
                                        key={preset.key}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSettingsChange('operations', preset.ops);
                                        }}
                                        className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                                            JSON.stringify(selectedOperations.sort()) === JSON.stringify(preset.ops.sort())
                                                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Individual Operations */}
                        <div>
                            <label className="block text-xs text-gray-600 mb-2 font-medium">Custom Selection:</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {operations.map((operation) => (
                                    <button
                                        key={operation.key}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleOperationsChange(operation.key, !selectedOperations.includes(operation.key));
                                        }}
                                        className={`flex items-start p-3 border rounded-md hover:bg-gray-50 transition-colors text-left w-full ${
                                            selectedOperations.includes(operation.key) 
                                                ? 'border-indigo-500 bg-indigo-50' 
                                                : 'border-gray-200'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center mt-0.5 ${
                                            selectedOperations.includes(operation.key)
                                                ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                                        }`}>
                                            {selectedOperations.includes(operation.key) && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {operation.label}
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    operation.difficulty <= 2 ? 'bg-green-100 text-green-800' :
                                                    operation.difficulty === 3 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    Level {operation.difficulty}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {operation.description}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Operations Info */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <div className="flex">
                                <Info className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
                                <div className="text-sm text-yellow-700">
                                    <p className="font-medium mb-1">Operation Mixing:</p>
                                    <ul className="text-xs space-y-1">
                                        <li>• Multiple operations can be combined in a single session</li>
                                        <li>• Numbers appear sequentially: "4" → "+6" → "×2" → "-3" → "÷2"</li>
                                        <li>• Students calculate step by step mentally</li>
                                        <li>• More operations = higher difficulty</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flash Card Preview */}
            <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-green-900 mb-3">Flash Card Quiz Preview</h4>
                <div className="bg-white border border-green-200 rounded-md p-4">
                    <div className="text-center">
                        <div className="text-lg font-medium text-gray-900 mb-4">
                            Flash Card Mental Arithmetic Quiz
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-sm font-medium text-gray-700">Sessions</div>
                                <div className="text-xl font-bold text-indigo-600">{sessionCount}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-sm font-medium text-gray-700">Numbers per Session</div>
                                <div className="text-xl font-bold text-indigo-600">{numbersPerSession}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-sm font-medium text-gray-700">Display Time</div>
                                <div className="text-xl font-bold text-indigo-600">{displayTime}s</div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>Students will complete {sessionCount} flash card sessions.</p>
                            <p>Each session shows {numbersPerSession} numbers for {displayTime} seconds each.</p>
                            <p>Total time per session: {numbersPerSession * displayTime} seconds</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Points Configuration */}
            <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                    <Settings className="w-5 h-5 text-yellow-600 mr-2" />
                    <h4 className="text-md font-medium text-yellow-900">Points Configuration</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Points per Session
                        </label>
                        <input
                            type="number"
                            value={formData.settings?.points_per_session || 10}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleSettingsChange('points_per_session', parseInt(e.target.value) || 10);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            min="1"
                            max="100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Points awarded for completing each session</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Points Available
                        </label>
                        <div className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-900">
                            {(formData.settings?.points_per_session || 10) * sessionCount} points
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {sessionCount} sessions × {formData.settings?.points_per_session || 10} points each
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}